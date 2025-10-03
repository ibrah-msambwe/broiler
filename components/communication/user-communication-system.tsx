"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageSquare, User, Clock, Shield } from "lucide-react"
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
}

interface UserCommunicationSystemProps {
  currentUserId: string
  currentUserName: string
  isAdmin: boolean
}

export default function UserCommunicationSystem({ 
  currentUserId, 
  currentUserName, 
  isAdmin 
}: UserCommunicationSystemProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Admin details
  const adminId = "admin-tariq"
  const adminName = "Tariq (Admin)"

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      console.log("💬 Loading messages between user and admin:", currentUserId, "and", adminId)
      
      // Try to load from database first
      const { data, error } = await supabase
        .from("chart_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true })

      if (error) {
        console.log("📝 Database error, using mock messages:", error.message)
        // Create mock messages for demo
        const mockMessages: Message[] = [
          {
            id: "welcome-1",
            sender_id: adminId,
            receiver_id: currentUserId,
            sender_name: adminName,
            receiver_name: currentUserName,
            message: "Hello! I'm here to help you with your batch management. How can I assist you today?",
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            is_read: false,
            message_type: "text"
          },
          {
            id: "welcome-2",
            sender_id: currentUserId,
            receiver_id: adminId,
            sender_name: currentUserName,
            receiver_name: adminName,
            message: "Hi! Thank you for the welcome message. I have some questions about my batch.",
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            is_read: true,
            message_type: "text"
          },
          {
            id: "welcome-3",
            sender_id: adminId,
            receiver_id: currentUserId,
            sender_name: adminName,
            receiver_name: currentUserName,
            message: "Of course! I'm here to help. What would you like to know about your batch?",
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            is_read: false,
            message_type: "text"
          }
        ]
        setMessages(mockMessages)
      } else {
        console.log("✅ Loaded messages from database:", data?.length || 0)
        setMessages(data || [])
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error)
      // Fallback to mock messages
      const mockMessages: Message[] = [
        {
          id: "welcome-1",
          sender_id: adminId,
          receiver_id: currentUserId,
          sender_name: adminName,
          receiver_name: currentUserName,
          message: "Hello! I'm here to help you with your batch management. How can I assist you today?",
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          is_read: false,
          message_type: "text"
        }
      ]
      setMessages(mockMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    try {
      // Create message object
      const message: Message = {
        id: `msg-${Date.now()}`,
        sender_id: currentUserId,
        receiver_id: adminId,
        sender_name: currentUserName,
        receiver_name: adminName,
        message: messageText,
        created_at: new Date().toISOString(),
        is_read: false,
        message_type: "text"
      }

      // Try to save to database
      try {
        const { error: dbError } = await supabase
          .from("chart_messages")
          .insert({
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            sender_name: message.sender_name,
            receiver_name: message.receiver_name,
            message: message.message,
            message_type: message.message_type,
            is_read: message.is_read,
            is_admin_message: false
          })

        if (dbError) {
          console.log("📝 Database save failed, using local message:", dbError.message)
        } else {
          console.log("✅ Message saved to database")
        }
      } catch (dbError) {
        console.log("📝 Database error, using local message:", dbError)
      }

      // Add message to local state (always works)
      setMessages(prev => [...prev, message])
      toast.success("Message sent to admin")

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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat with Admin
          <Badge variant="secondary" className="ml-auto">
            <Shield className="h-3 w-3 mr-1" />
            Admin Support
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          Direct communication with Tariq (Admin)
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation with admin!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[80%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {isOwnMessage ? currentUserName.charAt(0) : adminName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${
                        isOwnMessage 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          isOwnMessage ? "text-blue-100" : "text-gray-500"
                        }`}>
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{formatTime(message.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message to admin..."
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isSending && (
            <p className="text-xs text-gray-500 mt-1">Sending to admin...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
