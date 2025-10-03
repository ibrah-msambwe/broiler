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
  User, 
  Clock,
  CheckCircle,
  Circle
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

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

interface BatchUserCommunicationProps {
  currentUserId: string
  currentUserName: string
  batchId?: string
  farmerName?: string
  batchName?: string
}

export default function BatchUserCommunication({ 
  currentUserId, 
  currentUserName,
  batchId,
  farmerName,
  batchName
}: BatchUserCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Admin details
  const adminId = "admin-tariq"
  const adminName = "Tariq (Admin)"

  useEffect(() => {
    loadMessages()
    
    // Set up real-time message subscription
    const channel = supabase
      .channel(`messages-${currentUserId}-${adminId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chart_messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new)
          const newMsg = payload.new as Message
          setMessages(prev => [...prev, newMsg])
          
          // Play notification sound if message is from admin
          if (newMsg.sender_id === adminId) {
            toast.info(`New message from ${newMsg.sender_name}`)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, adminId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Refresh messages every 10 seconds as backup (silent mode - no loading indicators)
    const interval = setInterval(() => {
      loadMessages(true) // Silent background refresh
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async (silent: boolean = false) => {
    try {
      // Only show loading state on initial load, not on background refreshes
      if (!silent) {
        setIsLoading(true)
      }
      
      console.log("💬 Loading messages with admin:", adminId)
      
      const response = await fetch(`/api/chart/messages?userId=${currentUserId}&otherUserId=${adminId}`)
      const data = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
        
        // Count unread messages from admin
        const unreadMessages = data.messages.filter((msg: Message) => 
          msg.sender_id === adminId && !msg.is_read
        )
        setUnreadCount(unreadMessages.length)
        
        // Mark admin messages as read (non-blocking)
        if (unreadMessages.length > 0) {
          markMessagesAsRead(unreadMessages).catch(err => 
            console.log("Note: Failed to mark messages as read:", err)
          )
        }
        
        console.log(`✅ Loaded ${data.messages.length} messages, ${unreadMessages.length} unread`)
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
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    try {
      const messageData = {
        senderId: currentUserId,
        receiverId: adminId,
        senderName: currentUserName,
        receiverName: adminName,
        message: messageText,
        messageType: "text",
        batchId: batchId,
        isAdminMessage: false
      }

      console.log("📤 Sending message to admin:", messageData)

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
        toast.success("Message sent to admin!")
      } else {
        console.error("❌ Failed to send message:", data.error)
        toast.error("Failed to send message")
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      toast.error("Failed to send message")
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="bg-blue-50 border-b border-blue-200">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(adminName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{adminName}</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Online - Admin Support</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
              <p>Send a message to the admin for support or questions</p>
              {farmerName && batchName && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p><strong>Farmer:</strong> {farmerName}</p>
                  <p><strong>Batch:</strong> {batchName}</p>
                </div>
              )}
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
              placeholder="Type your message to admin..."
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
          {farmerName && (
            <p className="text-xs text-gray-500 mt-2">
              Chatting as: {farmerName} {batchName && `(${batchName})`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
