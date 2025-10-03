"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  Send, 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  CheckCircle,
  Circle
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { playNotificationSound } from "@/lib/audio-notifications"

interface BatchUser {
  id: string
  batchId?: string
  name: string
  email: string
  role: string
  farmerName?: string
  batchName?: string
  username?: string
  status?: string
  isOnline: boolean
  lastSeen: string
  avatar?: string | null
  location?: string
  phone?: string
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  sender_name: string
  receiver_name: string
  message: string
  created_at: string
  is_read: boolean
  message_type: string
  conversation_id?: string
}

interface AdminBatchCommunicationProps {
  currentUserId: string
  currentUserName: string
  isAdmin: boolean
}

export default function AdminBatchCommunication({ 
  currentUserId, 
  currentUserName, 
  isAdmin 
}: AdminBatchCommunicationProps) {
  const [users, setUsers] = useState<BatchUser[]>([])
  const [selectedUser, setSelectedUser] = useState<BatchUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id)
      
      // Set up real-time message subscription
      const channel = supabase
        .channel(`messages-${currentUserId}-${selectedUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chart_messages',
            filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUserId}))`
          },
          (payload) => {
            console.log('📨 New message received:', payload.new)
            const newMsg = payload.new as Message
            setMessages(prev => [...prev, newMsg])
            
            // Play notification sound if message is from other user
            if (newMsg.sender_id !== currentUserId) {
              playNotificationSound()
              toast.info(`New message from ${newMsg.sender_name}`)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedUser, currentUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load unread counts for all users
    if (users.length > 0) {
      loadUnreadCounts()
    }
  }, [users])
  
  useEffect(() => {
    // Refresh messages every 10 seconds as backup (silent mode - no loading indicators)
    if (selectedUser) {
      const interval = setInterval(() => {
        loadMessages(selectedUser.id, true) // Silent background refresh
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Loading batch users for communication...")
      
      const response = await fetch('/api/communication/batch-users')
      const data = await response.json()
      
      if (data.users) {
        setUsers(data.users)
        console.log(`✅ Loaded ${data.users.length} users for communication`)
        
        // Auto-select first batch user if available
        const firstBatchUser = data.users.find((user: BatchUser) => user.role === "batch_user")
        if (firstBatchUser && !selectedUser) {
          setSelectedUser(firstBatchUser)
        }
      } else {
        console.error("❌ Failed to load users:", data.error)
        toast.error("Failed to load users")
      }
    } catch (error) {
      console.error("❌ Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (userId: string, silent: boolean = false) => {
    try {
      // Only show loading state on initial load, not on background refreshes
      if (!silent) {
        setIsLoading(true)
      }
      
      console.log("💬 Loading messages with user:", userId)
      
      const response = await fetch(`/api/chart/messages?userId=${currentUserId}&otherUserId=${userId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
        console.log(`✅ Loaded ${data.messages.length} messages`)
        
        // Mark messages from the other user as read (non-blocking)
        const unreadMessages = data.messages.filter((msg: Message) => 
          msg.sender_id !== currentUserId && !msg.is_read
        )
        if (unreadMessages.length > 0) {
          // Mark as read in background without blocking UI
          markMessagesAsRead(unreadMessages).catch(err => 
            console.log("Note: Failed to mark messages as read:", err)
          )
        }
      } else {
        console.error("❌ Failed to load messages:", data.error || data.message)
        if (!silent) {
          setMessages([])
          if (data.message) {
            toast.error(data.message)
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error)
      if (!silent) {
        setMessages([])
        toast.error("Failed to load messages")
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const loadUnreadCounts = async () => {
    try {
      const unreadCounts: Record<string, number> = {}
      
      // Load unread counts in background without blocking UI
      const promises = users
        .filter(user => user.id !== currentUserId)
        .map(async (user) => {
          try {
            const response = await fetch(`/api/chart/messages?userId=${currentUserId}&otherUserId=${user.id}`)
            const data = await response.json()
            
            if (data.messages) {
              const unreadMessages = data.messages.filter((msg: Message) => 
                msg.sender_id !== currentUserId && !msg.is_read
              )
              unreadCounts[user.id] = unreadMessages.length
            }
          } catch (err) {
            console.log(`Note: Failed to load unread count for ${user.name}`)
          }
        })
      
      // Wait for all requests to complete (non-blocking)
      await Promise.allSettled(promises)
      
      setUnreadCounts(unreadCounts)
    } catch (error) {
      console.log("Note: Failed to load unread counts:", error)
    }
  }

  const markMessagesAsRead = async (messages: Message[]) => {
    try {
      for (const message of messages) {
        await fetch('/api/chart/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId: message.id,
            isRead: true
          })
        })
      }
    } catch (error) {
      console.error("❌ Error marking messages as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    try {
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedUser.id,
        senderName: currentUserName,
        receiverName: selectedUser.name,
        message: messageText,
        messageType: "text",
        isAdminMessage: isAdmin
      }

      console.log("📤 Sending message:", messageData)

      const response = await fetch('/api/chart/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      const data = await response.json()

      if (response.ok && data.message) {
        // Add message to local state immediately
        const newMsg: Message = {
          id: data.message.id,
          sender_id: data.message.sender_id,
          receiver_id: data.message.receiver_id,
          sender_name: data.message.sender_name,
          receiver_name: data.message.receiver_name,
          message: data.message.message,
          created_at: data.message.created_at,
          is_read: data.message.is_read,
          message_type: data.message.message_type,
          conversation_id: data.message.conversation_id
        }

        setMessages(prev => [...prev, newMsg])
        
        // Show special message if auto-setup happened
        if (data.autoSetup) {
          toast.success("Chat system initialized! Message sent successfully! 🎉")
        } else {
          toast.success("Message sent successfully!")
        }
        
        // Update unread counts
        loadUnreadCounts()
      } else {
        console.error("❌ Failed to send message:", data.error)
        
        // Check if setup is needed
        if (data.setupUrl) {
          toast.error(
            <div>
              <p className="font-semibold">{data.error}</p>
              <button 
                onClick={() => window.open(data.setupUrl, '_blank')}
                className="mt-2 text-blue-600 underline hover:text-blue-800"
              >
                Click here to set up chat system
              </button>
            </div>,
            { duration: 10000 }
          )
        } else {
          toast.error(data.error || "Failed to send message")
        }
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.farmerName && user.farmerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.batchName && user.batchName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusColor = (user: BatchUser) => {
    if (user.role === "admin") return "bg-green-500"
    if (user.isOnline) return "bg-blue-500"
    return "bg-gray-400"
  }

  return (
    <div className="h-full flex bg-white rounded-lg shadow-sm border border-blue-200">
      {/* Users List */}
      <div className="w-1/3 border-r border-blue-200 flex flex-col">
        <div className="p-4 border-b border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Batch Communication</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search batches, farmers, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 border-b border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedUser?.id === user.id ? "bg-blue-100 border-blue-300" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                      {unreadCounts[user.id] > 0 && (
                        <Badge variant="destructive" className="text-xs px-1 py-0 h-5 min-w-5">
                          {unreadCounts[user.id]}
                        </Badge>
                      )}
                    </div>
                    
                    {user.role === "batch_user" && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{user.location}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {user.isOnline ? "Online" : formatDate(user.lastSeen)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-blue-200 bg-blue-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                  {selectedUser.role === "batch_user" && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>📍 {selectedUser.location}</span>
                        {selectedUser.phone && <span>📞 {selectedUser.phone}</span>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  selectedUser.isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {selectedUser.isOnline ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  {selectedUser.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border border-blue-200"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === currentUserId ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-blue-200 bg-white">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  className="flex-1 border-blue-200 focus:border-blue-400"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a Batch to Start Chatting</h3>
              <p>Choose a batch user from the list to begin communication</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
