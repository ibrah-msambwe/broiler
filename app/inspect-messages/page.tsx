"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function InspectMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const inspectDatabase = async () => {
    setIsLoading(true)
    
    try {
      // Get all messages
      const messagesRes = await fetch('/api/chart/messages?userId=all')
      const messagesData = await messagesRes.json()
      setMessages(messagesData.messages || [])

      // Get all conversations
      const convRes = await fetch('/api/chart/conversations?userId=all')
      const convData = await convRes.json()
      setConversations(convData.conversations || [])

      // Get all users
      const usersRes = await fetch('/api/communication/users')
      const usersData = await usersRes.json()
      setUsers(usersData.users || [])

    } catch (error) {
      console.error("Error inspecting database:", error)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    inspectDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Inspector - Chart Messages</CardTitle>
            <Button onClick={inspectDatabase} disabled={isLoading} className="w-fit">
              {isLoading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Messages</h3>
                <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Conversations</h3>
                <p className="text-2xl font-bold text-green-600">{conversations.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Users</h3>
                <p className="text-2xl font-bold text-purple-600">{users.length}</p>
              </div>
            </div>

            {/* Messages Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Messages in Database</h3>
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages found in database</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Sender</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Receiver</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Message</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Conversation</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg, index) => (
                        <tr key={msg.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {msg.id?.substring(0, 8)}...
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">{msg.sender_name}</p>
                              <p className="text-xs text-gray-500">{msg.sender_id}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">{msg.receiver_name}</p>
                              <p className="text-xs text-gray-500">{msg.receiver_id}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 max-w-xs">
                            <p className="text-sm truncate">{msg.message}</p>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {msg.conversation_id?.substring(0, 8)}...
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {new Date(msg.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Conversations Table */}
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold">All Conversations</h3>
              {conversations.length === 0 ? (
                <p className="text-gray-500">No conversations found in database</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Participant 1</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Participant 2</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversations.map((conv, index) => (
                        <tr key={conv.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {conv.id?.substring(0, 8)}...
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">{conv.participant_1_name}</p>
                              <p className="text-xs text-gray-500">{conv.participant_1_id}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">{conv.participant_2_name}</p>
                              <p className="text-xs text-gray-500">{conv.participant_2_id}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge variant="secondary">{conv.conversation_type || 'direct'}</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {new Date(conv.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold">All Users</h3>
              {users.length === 0 ? (
                <p className="text-gray-500">No users found in database</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id || index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {user.id?.substring(0, 8)}...
                          </td>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {user.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            {user.email}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge variant="outline">{user.role}</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <Badge variant={user.isOnline ? "default" : "secondary"}>
                              {user.status || (user.isOnline ? 'online' : 'offline')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
