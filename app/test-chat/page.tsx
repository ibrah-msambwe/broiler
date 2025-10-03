"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestChat() {
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testUsersAPI = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch('/api/chart/users?currentUserId=test&userType=all')
      const data = await response.json()
      console.log('Users API Response:', data)
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(`Users API Error: ${data.error}`)
      }
    } catch (err) {
      setError(`Users API Error: ${err}`)
    }
    setLoading(false)
  }

  const testConversationsAPI = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch('/api/chart/conversations?userId=test')
      const data = await response.json()
      console.log('Conversations API Response:', data)
      if (response.ok) {
        setConversations(data.conversations || [])
      } else {
        setError(`Conversations API Error: ${data.error}`)
      }
    } catch (err) {
      setError(`Conversations API Error: ${err}`)
    }
    setLoading(false)
  }

  const testMessagesAPI = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch('/api/chart/messages?userId=test')
      const data = await response.json()
      console.log('Messages API Response:', data)
      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        setError(`Messages API Error: ${data.error}`)
      }
    } catch (err) {
      setError(`Messages API Error: ${err}`)
    }
    setLoading(false)
  }

  const testSendMessage = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch('/api/chart/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'test-sender',
          receiverId: 'test-receiver',
          senderName: 'Test Sender',
          receiverName: 'Test Receiver',
          message: 'Hello, this is a test message!',
          isAdminMessage: false
        })
      })
      const data = await response.json()
      console.log('Send Message API Response:', data)
      if (response.ok) {
        alert('Message sent successfully!')
      } else {
        setError(`Send Message API Error: ${data.error}`)
      }
    } catch (err) {
      setError(`Send Message API Error: ${err}`)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Chat System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testUsersAPI} disabled={loading} className="w-full">
              Test Users API
            </Button>
            <Button onClick={testConversationsAPI} disabled={loading} className="w-full">
              Test Conversations API
            </Button>
            <Button onClick={testMessagesAPI} disabled={loading} className="w-full">
              Test Messages API
            </Button>
            <Button onClick={testSendMessage} disabled={loading} className="w-full">
              Test Send Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <p><strong>Users:</strong> {users.length}</p>
              <p><strong>Conversations:</strong> {conversations.length}</p>
              <p><strong>Messages:</strong> {messages.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(users, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversations ({conversations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(conversations, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages ({messages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(messages, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
