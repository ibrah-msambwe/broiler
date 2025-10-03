"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Users, MessageSquare, User } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email?: string
  role: string
  type: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  sender_name: string
  receiver_name: string
  message: string
  message_type: string
  conversation_id: string
  is_read: boolean
  is_admin_message: boolean
  batch_id?: string
  created_at: string
  batches?: { name: string }
}

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  participant_1_name: string
  participant_2_name: string
  last_message: string
  last_message_at: string
  unread_count_1: number
  unread_count_2: number
  is_active: boolean
}

interface MessagingSystemProps {
  currentUserId: string
  currentUserName: string
  isAdmin?: boolean
}

export default function MessagingSystem({ 
  currentUserId, 
  currentUserName, 
  isAdmin = false 
}: MessagingSystemProps) {
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"conversations" | "users">("conversations")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChatTables = async () => {
    try {
      console.log("Checking if chat tables exist...")
      const response = await fetch('/api/migrations/create-chat-tables', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (response.ok) {
        console.log("Chat tables initialized successfully")
      } else {
        console.warn("Chat tables initialization failed:", data.error)
      }
    } catch (error) {
      console.warn("Error initializing chat tables:", error)
    }
  }

  // Load users and conversations on component mount
  useEffect(() => {
    if (currentUserId) {
      // Initialize chat tables first
      initializeChatTables().then(() => {
        loadUsers()
        loadConversations()
      })
    }
  }, [currentUserId])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadUsers = async () => {
    try {
      console.log("Loading users...", { currentUserId })
      const response = await fetch(`/api/chart/users?currentUserId=${currentUserId}&userType=all`)
      const data = await response.json()
      console.log("Users API response:", { response: response.status, data })
      if (response.ok) {
        setUsers(data.users || [])
        console.log("Users loaded:", data.users?.length || 0)
      } else {
        console.error("Users API error:", data)
        toast.error(`Failed to load users: ${data.error}`)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error(`Failed to load users: ${error}`)
    }
  }

  const loadConversations = async () => {
    try {
      console.log("Loading conversations...", { currentUserId })
      
      if (!currentUserId) {
        console.warn("No currentUserId available for loading conversations")
        return
      }

      const response = await fetch(`/api/chart/conversations?userId=${currentUserId}`)
      const data = await response.json()
      
      console.log("Conversations API response:", { 
        status: response.status, 
        statusText: response.statusText,
        data 
      })
      
      if (response.ok) {
        setConversations(data.conversations || [])
        console.log("Conversations loaded:", data.conversations?.length || 0)
        
        // Show message if chat tables are not initialized
        if (data.message && data.message.includes("not initialized")) {
          console.warn("Chat tables not initialized:", data.message)
          // Don't show error toast for this, just log it
        }
      } else {
        console.error("Conversations API error:", { 
          status: response.status, 
          statusText: response.statusText,
          error: data.error,
          data 
        })
        
        // Only show error toast for actual errors, not missing tables
        if (!data.message?.includes("not initialized")) {
          toast.error(`Failed to load conversations: ${data.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error(`Failed to load conversations: ${error instanceof Error ? error.message : 'Network error'}`)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chart/messages?userId=${currentUserId}&conversationId=${conversationId}`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        toast.error("Failed to load messages")
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load messages")
    }
  }

  const startConversation = async (user: User) => {
    setSelectedUser(user)
    setActiveTab("conversations")
    
    // Find existing conversation or create new one
    const existingConversation = conversations.find(conv => 
      (conv.participant_1_id === currentUserId && conv.participant_2_id === user.id) ||
      (conv.participant_2_id === currentUserId && conv.participant_1_id === user.id)
    )

    if (existingConversation) {
      setSelectedConversation(existingConversation)
    } else {
      // Create new conversation
      try {
        const response = await fetch("/api/chart/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participant1Id: currentUserId,
            participant2Id: user.id,
            participant1Name: currentUserName,
            participant2Name: user.name
          })
        })
        
        const data = await response.json()
        if (response.ok) {
          setSelectedConversation(data.conversation)
          loadConversations() // Refresh conversations list
        } else {
          toast.error("Failed to start conversation")
        }
      } catch (error) {
        console.error("Error creating conversation:", error)
        toast.error("Failed to start conversation")
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setLoading(true)
    try {
      const response = await fetch("/api/chart/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedUser?.id,
          senderName: currentUserName,
          receiverName: selectedUser?.name,
          message: newMessage.trim(),
          isAdminMessage: isAdmin
        })
      })

      const data = await response.json()
      if (response.ok) {
        setNewMessage("")
        loadMessages(selectedConversation.id) // Refresh messages
        loadConversations() // Refresh conversations to update last message
        toast.success("Message sent")
      } else {
        toast.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  const getConversationPartner = (conversation: Conversation) => {
    return conversation.participant_1_id === currentUserId 
      ? conversation.participant_2_name 
      : conversation.participant_1_name
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.participant_1_id === currentUserId 
      ? conversation.unread_count_1 
      : conversation.unread_count_2
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === "conversations" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("conversations")}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversations
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("users")}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[520px]">
          {activeTab === "conversations" ? (
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a conversation with someone</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`mb-2 cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id 
                        ? "bg-blue-50 border-blue-200" 
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getConversationPartner(conversation).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {getConversationPartner(conversation)}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {conversation.last_message || "No messages yet"}
                            </p>
                          </div>
                        </div>
                        {getUnreadCount(conversation) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {getUnreadCount(conversation)}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="p-2">
              {users.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                users.map((user) => (
                  <Card
                    key={user.id}
                    className="mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => startConversation(user)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">
                            {user.role} • {user.type}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>
                    {getConversationPartner(selectedConversation).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {getConversationPartner(selectedConversation)}
                  </h3>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === currentUserId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          message.sender_id === currentUserId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === currentUserId
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  disabled={loading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || loading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the sidebar or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
