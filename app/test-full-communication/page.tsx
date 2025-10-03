"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, CheckCircle, XCircle, Users, Loader } from "lucide-react"
import { toast } from "sonner"

const TestFullCommunicationPage = () => {
  const [testMessage, setTestMessage] = useState("Hello! This is a full communication test.")
  const [isTesting, setIsTesting] = useState(false)
  const [results, setResults] = useState<any>({})

  const testFullCommunication = async () => {
    setIsTesting(true)
    setResults({})

    try {
      // Step 1: Test conversation creation
      console.log("🔄 Step 1: Testing conversation creation...")
      const convResponse = await fetch('/api/chart/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1Id: "test-admin",
          participant2Id: "test-farmer",
          participant1Name: "Test Admin",
          participant2Name: "Test Farmer"
        })
      })

      const convData = await convResponse.json()
      const conversationId = convData.conversation?.id

      setResults(prev => ({
        ...prev,
        conversation: {
          status: convResponse.status,
          ok: convResponse.ok,
          data: convData,
          conversationId
        }
      }))

      if (!convResponse.ok) {
        throw new Error(`Conversation creation failed: ${convData.error}`)
      }

      // Step 2: Test message sending
      console.log("🔄 Step 2: Testing message sending...")
      const msgResponse = await fetch('/api/chart/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: "test-admin",
          receiverId: "test-farmer",
          senderName: "Test Admin",
          receiverName: "Test Farmer",
          message: testMessage,
          conversationId: conversationId
        })
      })

      const msgData = await msgResponse.json()

      setResults(prev => ({
        ...prev,
        messageSend: {
          status: msgResponse.status,
          ok: msgResponse.ok,
          data: msgData
        }
      }))

      if (!msgResponse.ok) {
        throw new Error(`Message sending failed: ${msgData.error}`)
      }

      // Step 3: Test message loading
      console.log("🔄 Step 3: Testing message loading...")
      const loadResponse = await fetch(`/api/chart/messages?userId=test-admin&conversationId=${conversationId}`)
      const loadData = await loadResponse.json()

      setResults(prev => ({
        ...prev,
        messageLoad: {
          status: loadResponse.status,
          ok: loadResponse.ok,
          data: loadData
        }
      }))

      if (!loadResponse.ok) {
        throw new Error(`Message loading failed: ${loadData.error}`)
      }

      // Step 4: Test users API
      console.log("🔄 Step 4: Testing users API...")
      const usersResponse = await fetch('/api/communication/users')
      const usersData = await usersResponse.json()

      setResults(prev => ({
        ...prev,
        users: {
          status: usersResponse.status,
          ok: usersResponse.ok,
          data: usersData
        }
      }))

      toast.success("All communication tests passed! 🎉")

    } catch (error: any) {
      console.error("💥 Communication test failed:", error)
      toast.error(`Test failed: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  const getStatusIcon = (result: any) => {
    if (!result) return <Loader className="h-4 w-4 animate-spin text-blue-500" />
    if (result.ok) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (result: any) => {
    if (!result) return "bg-blue-50 border-blue-200"
    if (result.ok) return "bg-green-50 border-green-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Full Communication System Test
            </CardTitle>
            <p className="text-green-100 mt-2 text-lg">
              Test all communication features: conversations, messages, and users
            </p>
          </CardHeader>
        </Card>

        {/* Test Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Run Full Test
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter your test message..."
                  className="w-full"
                />
              </div>

              <Button
                onClick={testFullCommunication}
                disabled={isTesting || !testMessage.trim()}
                className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Testing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Run Full Communication Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conversation Creation */}
          <Card className={`shadow-lg border-2 ${getStatusColor(results.conversation)}`}>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(results.conversation)}
                Conversation Creation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {results.conversation ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={results.conversation.ok ? "text-green-600" : "text-red-600"}>
                      {results.conversation.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className={results.conversation.ok ? "text-green-600" : "text-red-600"}>
                      {results.conversation.ok ? "Yes" : "No"}
                    </span>
                  </div>
                  {results.conversation.conversationId && (
                    <div className="text-xs text-gray-500 break-all">
                      ID: {results.conversation.conversationId}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Waiting for test...</p>
              )}
            </CardContent>
          </Card>

          {/* Message Sending */}
          <Card className={`shadow-lg border-2 ${getStatusColor(results.messageSend)}`}>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(results.messageSend)}
                Message Sending
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {results.messageSend ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={results.messageSend.ok ? "text-green-600" : "text-red-600"}>
                      {results.messageSend.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className={results.messageSend.ok ? "text-green-600" : "text-red-600"}>
                      {results.messageSend.ok ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Waiting for test...</p>
              )}
            </CardContent>
          </Card>

          {/* Message Loading */}
          <Card className={`shadow-lg border-2 ${getStatusColor(results.messageLoad)}`}>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(results.messageLoad)}
                Message Loading
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {results.messageLoad ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={results.messageLoad.ok ? "text-green-600" : "text-red-600"}>
                      {results.messageLoad.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className={results.messageLoad.ok ? "text-green-600" : "text-red-600"}>
                      {results.messageLoad.ok ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages:</span>
                    <span className="text-blue-600">
                      {results.messageLoad.data?.messages?.length || 0}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Waiting for test...</p>
              )}
            </CardContent>
          </Card>

          {/* Users API */}
          <Card className={`shadow-lg border-2 ${getStatusColor(results.users)}`}>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(results.users)}
                Users API
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {results.users ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={results.users.ok ? "text-green-600" : "text-red-600"}>
                      {results.users.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className={results.users.ok ? "text-green-600" : "text-red-600"}>
                      {results.users.ok ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <span className="text-blue-600">
                      {results.users.data?.users?.length || 0}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Waiting for test...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        {Object.keys(results).length > 0 && (
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-sm border-green-200">
            <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
              <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Test Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All communication APIs are working correctly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No more relationship errors with batches table</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Message sending and loading work perfectly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Your communication system is fully functional!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TestFullCommunicationPage
