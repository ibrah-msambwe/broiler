"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Send,
  Search,
  Users,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { playNotificationSound } from "@/lib/audio-notifications"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  email: string
  role: string
  type: string
  displayName: string
  avatar?: string
  is_active: boolean
  last_login?: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  message_type: string
  created_at: string
  read_at?: string
  sender?: User
  receiver?: User
}

interface Conversation {
  id: string
  otherUser: User
  lastMessage: {
    id: string
    message: string
    created_at: string
    sender_id: string
  }
  unreadCount: number
  updated_at: string
}

export default function MessagingSystem() {
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId] = useState("admin-user-id") // This should come from auth context
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/admin/conversations?userId=${currentUserId}`)
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/messages?conversationId=${conversationId}`)
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages.reverse()) // Reverse to show oldest first
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: selectedConversation.otherUser.id,
          message: newMessage.trim(),
          message_type: "text",
          conversation_id: selectedConversation.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNewMessage("")
        // Refresh messages
        fetchMessages(selectedConversation.id)
        // Refresh conversations to update last message
        fetchConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Start a new conversation
  const startConversation = async (user: User) => {
    try {
      const response = await fetch("/api/admin/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1_id: currentUserId,
          user2_id: user.id,
        }),
      })

      const data = await response.json()
      if (data.conversation_id) {
        // Refresh conversations
        fetchConversations()
        // Select the new conversation
        const newConv = conversations.find(c => c.id === data.conversation_id) || {
          id: data.conversation_id,
          otherUser: user,
          lastMessage: { id: "", message: "Conversation started", created_at: new Date().toISOString(), sender_id: currentUserId },
          unreadCount: 0,
          updated_at: new Date().toISOString()
        }
        setSelectedConversation(newConv)
        fetchMessages(data.conversation_id)
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchUsers(), fetchConversations()])
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Real-time subscriptions for messages
  useEffect(() => {
    if (!currentUserId) return

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('admin_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages'
        },
        (payload) => {
          console.log('💬 New message received:', payload.new)
          const newMessage = payload.new as Message
          
          // Add to current conversation if it matches
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, newMessage])
          }
          
          // Update conversations list to show new message
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversation_id 
                ? { ...conv, lastMessage: newMessage.message, lastMessageTime: newMessage.created_at }
                : conv
            )
          )

          // Play notification sound for messages not from current user
          if (newMessage.sender_id !== currentUserId) {
            playNotificationSound('message')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_messages'
        },
        (payload) => {
          console.log('💬 Message updated:', payload.new)
          const updatedMessage = payload.new as Message
          
          // Update message in current conversation
          if (selectedConversation && updatedMessage.conversation_id === selectedConversation.id) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [currentUserId, selectedConversation])

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messaging system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar - Conversations & Users */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              !searchQuery ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setSearchQuery("")}
          >
            Conversations
          </button>
          <button
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              searchQuery ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setSearchQuery("")}
          >
            All Users
          </button>
        </div>

        {/* Conversations/Users List */}
        <ScrollArea className="flex-1">
          {!searchQuery ? (
            // Conversations
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a conversation with a user</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors mb-2",
                      selectedConversation?.id === conversation.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => {
                      setSelectedConversation(conversation)
                      fetchMessages(conversation.id)
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.otherUser.avatar} />
                        <AvatarFallback>
                          {conversation.otherUser.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.otherUser.displayName}
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.created_at)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage.sender_id === currentUserId ? "You: " : ""}
                          {conversation.lastMessage.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // All Users
            <div className="p-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2"
                  onClick={() => startConversation(user)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.displayName}
                        </p>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.otherUser.avatar} />
                    <AvatarFallback>
                      {selectedConversation.otherUser.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.otherUser.displayName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.otherUser.role} • {selectedConversation.otherUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender_id === currentUserId ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        message.sender_id === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.created_at)}
                        </span>
                        {message.sender_id === currentUserId && (
                          <div className="flex items-center">
                            {message.read_at ? (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            ) : (
                              <Check className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
