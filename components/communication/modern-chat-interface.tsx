"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Send, 
  Smile, 
  Plus,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "batch_user"
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
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
  message_type?: "text" | "image" | "file"
}

interface ModernChatInterfaceProps {
  currentUserId: string
  currentUserName: string
  users: User[]
  messages: Message[]
  selectedUser: User | null
  onSendMessage: (message: string, receiverId: string) => void
  onSelectUser: (user: User) => void
  onBack: () => void
  isLoading?: boolean
}

export default function ModernChatInterface({
  currentUserId,
  currentUserName,
  users,
  messages,
  selectedUser,
  onSendMessage,
  onSelectUser,
  onBack,
  isLoading = false
}: ModernChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return
    onSendMessage(message.trim(), selectedUser.id)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) {
      return "now"
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== currentUserId) return null
    
    if (message.is_read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    } else {
      return <Check className="h-3 w-3 text-gray-400" />
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>

        {/* User List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(user.name)}
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                    <span className="text-xs text-gray-500">
                      {user.lastSeen || "Online"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {getInitials(selectedUser.name)}
          </div>
          {selectedUser.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{selectedUser.name}</h3>
          <p className="text-sm text-gray-500">
            {selectedUser.isOnline ? "Online" : selectedUser.lastSeen || "Offline"}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isFromCurrentUser = msg.sender_id === currentUserId
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar - only show for received messages */}
                    {!isFromCurrentUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {getInitials(msg.sender_name)}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="relative">
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-full ${
                          isFromCurrentUser
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      
                      {/* Timestamp and Status */}
                      <div className={`flex items-center gap-1 mt-1 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-gray-500">
                          {formatTime(msg.created_at)}
                        </span>
                        {getMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Card className="absolute bottom-full left-4 mb-2 z-10 shadow-lg">
            <CardContent className="p-3">
              <div className="grid grid-cols-8 gap-1">
                {["😊", "👍", "❤️", "🎉", "😂", "😢", "😮", "😡", "🔥", "💯", "👏", "🤔", "✅", "❌", "⚠️", "📝"].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMessage(prev => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
