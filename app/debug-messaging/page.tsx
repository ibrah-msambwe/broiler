"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugMessagingPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testMessageSending = async () => {
    setIsLoading(true)
    const results = []

    try {
      // Test 1: Send message from batch user to admin
      console.log("🧪 Testing message sending from batch to admin...")
      
      const response = await fetch('/api/chart/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: "batch-user-1",
          receiverId: "admin-1", 
          senderName: "Msambwe Manager",
          receiverName: "TARIQ KIZENGA",
          message: "Test message from batch to admin",
          messageType: "text",
          isAdminMessage: false
        })
      })

      const data = await response.json()
      results.push({
        test: "Send message batch → admin",
        status: response.ok ? "SUCCESS" : "FAILED",
        response: data,
        timestamp: new Date().toISOString()
      })

      // Test 2: Check if admin can see the message
      console.log("🧪 Testing message retrieval for admin...")
      
      const getResponse = await fetch('/api/chart/messages?userId=admin-1')
      const getData = await getResponse.json()
      
      results.push({
        test: "Get messages for admin",
        status: getResponse.ok ? "SUCCESS" : "FAILED", 
        response: getData,
        messageCount: getData.messages?.length || 0,
        timestamp: new Date().toISOString()
      })

      // Test 3: Check conversations for admin
      console.log("🧪 Testing conversations for admin...")
      
      const convResponse = await fetch('/api/chart/conversations?userId=admin-1')
      const convData = await convResponse.json()
      
      results.push({
        test: "Get conversations for admin",
        status: convResponse.ok ? "SUCCESS" : "FAILED",
        response: convData,
        conversationCount: convData.conversations?.length || 0,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      results.push({
        test: "Error during testing",
        status: "ERROR",
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const testMessageRetrieval = async () => {
    setIsLoading(true)
    const results = []

    try {
      // Test message retrieval for different users
      const users = [
        { id: "admin-1", name: "Admin" },
        { id: "batch-user-1", name: "Batch User" },
        { id: "farmer-1", name: "Farmer" }
      ]

      for (const user of users) {
        console.log(`🧪 Testing message retrieval for ${user.name}...`)
        
        const response = await fetch(`/api/chart/messages?userId=${user.id}`)
        const data = await response.json()
        
        results.push({
          test: `Get messages for ${user.name}`,
          status: response.ok ? "SUCCESS" : "FAILED",
          messageCount: data.messages?.length || 0,
          response: data,
          timestamp: new Date().toISOString()
        })
      }

    } catch (error) {
      results.push({
        test: "Error during retrieval testing",
        status: "ERROR", 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }

    setTestResults(prev => [...prev, ...results])
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Messaging System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testMessageSending}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? "Testing..." : "Test Message Sending"}
              </Button>
              
              <Button 
                onClick={testMessageRetrieval}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                {isLoading ? "Testing..." : "Test Message Retrieval"}
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Test Results:</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === "SUCCESS" 
                        ? "bg-green-50 border-green-200" 
                        : result.status === "FAILED"
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={`font-bold ${
                            result.status === "SUCCESS" ? "text-green-600" : 
                            result.status === "FAILED" ? "text-red-600" : "text-yellow-600"
                          }`}>
                            {result.status}
                          </span>
                        </p>
                        {result.messageCount !== undefined && (
                          <p className="text-sm text-gray-600">
                            Messages: {result.messageCount}
                          </p>
                        )}
                        {result.conversationCount !== undefined && (
                          <p className="text-sm text-gray-600">
                            Conversations: {result.conversationCount}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{result.timestamp}</p>
                    </div>
                    {result.response && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-blue-600">
                          View Response
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
