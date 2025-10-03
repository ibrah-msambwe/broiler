"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  PhoneOff,
  VideoOff,
  Settings,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Edit,
  Reply,
  Forward,
  Star,
  StarOff,
  Activity,
  CheckCircle
} from "lucide-react"
import EnhancedMessageInput from "./enhanced-message-input"
import EnhancedMessageDisplay from "./enhanced-message-display"
import EnhancedConversationList from "./enhanced-conversation-list"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "farmer" | "user"
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
  message_type: "text" | "image" | "file" | "system"
  conversation_id: string
  is_read: boolean
  is_admin_message: boolean
  batch_id?: string
  created_at: string
  updated_at: string
}

interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  participant_1_name: string
  participant_2_name: string
  last_message?: string
  last_message_at?: string
  unread_count_1: number
  unread_count_2: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UnifiedMessagingSystemProps {
  currentUserId: string
  currentUserName: string
  isAdmin?: boolean
  batchId?: string
}

export default function UnifiedMessagingSystem({ 
  currentUserId, 
  currentUserName, 
  isAdmin = false,
  batchId 
}: UnifiedMessagingSystemProps) {
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [isAudioCall, setIsAudioCall] = useState(false)
  const [messageFilter, setMessageFilter] = useState<"all" | "unread" | "important">("all")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGroupMessage, setShowGroupMessage] = useState(false)
  const [groupMessage, setGroupMessage] = useState("")
  const [isSendingGroup, setIsSendingGroup] = useState(false)
  const [conversationStats, setConversationStats] = useState<any>(null)
  const [showStats, setShowStats] = useState(false)
  const [replyTo, setReplyTo] = useState<{id: string, content: string, sender: string} | null>(null)
  const [starredConversations, setStarredConversations] = useState<Set<string>>(new Set())
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load users and conversations on component mount
  useEffect(() => {
    if (currentUserId) {
      loadUsers()
      loadConversations()
    }
  }, [currentUserId])

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/communication/users`)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
        console.log(`✅ Loaded ${data.users?.length || 0} users for communication`)
        console.log(`📊 Users by role:`, data.byRole)
      } else {
        console.error("Error loading users:", data.error)
        toast.error("Failed to load users")
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/chart/conversations?userId=${currentUserId}`)
      const data = await response.json()
      
      if (response.ok) {
        setConversations(data.conversations || [])
      } else {
        console.error("Error loading conversations:", data.error)
        toast.error("Failed to load conversations")
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast.error("Failed to load conversations")
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chart/messages?conversationId=${conversationId}`)
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        console.error("Error loading messages:", data.error)
        toast.error("Failed to load messages")
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load messages")
    }
  }

  const sendMessage = async (messageData: {
    content: string
    type: "text" | "image" | "file" | "urgent" | "scheduled"
    priority?: "low" | "normal" | "high" | "urgent"
    scheduledAt?: string
    templateId?: string
  }) => {
    if (!messageData.content.trim() || !selectedConversation) return

    try {
      const response = await fetch('/api/chart/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: selectedConversation.participant_1_id === currentUserId 
            ? selectedConversation.participant_2_id 
            : selectedConversation.participant_1_id,
          sender_name: currentUserName,
          receiver_name: selectedConversation.participant_1_id === currentUserId 
            ? selectedConversation.participant_2_name 
            : selectedConversation.participant_1_name,
          message: messageData.content.trim(),
          message_type: messageData.type,
          conversation_id: selectedConversation.id,
          is_admin_message: isAdmin,
          batch_id: batchId,
          priority: messageData.priority || "normal",
          scheduled_at: messageData.scheduledAt,
          template_id: messageData.templateId,
          reply_to: replyTo?.id
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setReplyTo(null)
        // Reload messages to get the new one
        loadMessages(selectedConversation.id)
        // Reload conversations to update last message
        loadConversations()
        
        // Trigger intelligent auto-response
        setTimeout(() => {
          intelligentAction("auto_respond", {
            message: messageData.content.trim(),
            senderId: selectedConversation.participant_1_id === currentUserId 
              ? selectedConversation.participant_2_id 
              : selectedConversation.participant_1_id,
            receiverId: currentUserId,
            conversationId: selectedConversation.id
          })
        }, 1000)
      } else {
        console.error("Error sending message:", data.error)
        toast.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const sendGroupMessage = async () => {
    if (!groupMessage.trim()) return

    try {
      setIsSendingGroup(true)
      const response = await fetch('/api/communication/group-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          senderName: currentUserName,
          message: groupMessage.trim(),
          messageType: "text",
          isAdmin: isAdmin,
          batchId: batchId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setGroupMessage("")
        setShowGroupMessage(false)
        toast.success(`Group message sent to ${data.stats.successful} users`)
        console.log("✅ Group message sent:", data.stats)
        
        // Reload conversations to show the group message
        loadConversations()
      } else {
        console.error("Error sending group message:", data.error)
        toast.error("Failed to send group message")
      }
    } catch (error) {
      console.error("Error sending group message:", error)
      toast.error("Failed to send group message")
    } finally {
      setIsSendingGroup(false)
    }
  }

  const intelligentAction = async (action: string, params: any = {}) => {
    try {
      const response = await fetch('/api/communication/intelligent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: currentUserId,
          conversationId: selectedConversation?.id,
          ...params
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        if (action === "get_conversation_stats") {
          setConversationStats(data.stats)
          setShowStats(true)
        } else {
          toast.success(data.message || "Action completed successfully")
        }
        
        // Reload data if needed
        if (["mark_all_read", "archive_conversation", "delete_message"].includes(action)) {
          loadConversations()
          if (selectedConversation) {
            loadMessages(selectedConversation.id)
          }
        }
      } else {
        console.error(`Error with intelligent action ${action}:`, data.error)
        toast.error(data.error || "Action failed")
      }
    } catch (error) {
      console.error(`Error with intelligent action ${action}:`, error)
      toast.error("Action failed")
    }
  }

  const startConversation = async (userId: string, userName: string) => {
    try {
      const response = await fetch('/api/chart/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_1_id: currentUserId,
          participant_2_id: userId,
          participant_1_name: currentUserName,
          participant_2_name: userName
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Reload conversations and select the new one
        await loadConversations()
        const newConversation = conversations.find(c => 
          (c.participant_1_id === currentUserId && c.participant_2_id === userId) ||
          (c.participant_2_id === currentUserId && c.participant_1_id === userId)
        )
        if (newConversation) {
          setSelectedConversation(newConversation)
        }
      } else {
        console.error("Error creating conversation:", data.error)
        toast.error("Failed to start conversation")
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast.error("Failed to start conversation")
    }
  }

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.message,
      sender: message.sender_name
    })
  }

  const handleStarConversation = (conversationId: string, starred: boolean) => {
    setStarredConversations(prev => {
      const newSet = new Set(prev)
      if (starred) {
        newSet.add(conversationId)
      } else {
        newSet.delete(conversationId)
      }
      return newSet
    })
    toast.success(starred ? "Conversation starred" : "Conversation unstarred")
  }

  const handleArchiveConversation = (conversationId: string, archived: boolean) => {
    setArchivedConversations(prev => {
      const newSet = new Set(prev)
      if (archived) {
        newSet.add(conversationId)
      } else {
        newSet.delete(conversationId)
      }
      return newSet
    })
    toast.success(archived ? "Conversation archived" : "Conversation unarchived")
  }

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      // Implement delete conversation API call
      toast.success("Conversation deleted")
      loadConversations()
    }
  }

  const handleStarMessage = (messageId: string, starred: boolean) => {
    // Implement star message functionality
    toast.success(starred ? "Message starred" : "Message unstarred")
  }

  const handleDeleteMessage = (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      // Implement delete message API call
      toast.success("Message deleted")
      if (selectedConversation) {
        loadMessages(selectedConversation.id)
      }
    }
  }

  const handleReactToMessage = (messageId: string, emoji: string) => {
    // Implement message reaction functionality
    toast.success(`Reacted with ${emoji}`)
  }

  const handleMarkAsRead = (messageId: string) => {
    // Implement mark as read functionality
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }

  return (
    <div className="h-[600px] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Enhanced Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <EnhancedConversationList
          conversations={conversations.map(conv => ({
            ...conv,
            is_starred: starredConversations.has(conv.id),
            is_archived: archivedConversations.has(conv.id)
          }))}
          users={users}
          currentUserId={currentUserId}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={setSelectedConversation}
          onStartConversation={startConversation}
          onStarConversation={handleStarConversation}
          onArchiveConversation={handleArchiveConversation}
          onDeleteConversation={handleDeleteConversation}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={messageFilter}
          onFilterChange={setMessageFilter}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.participant_1_id === currentUserId ? selectedConversation.participant_2_name : selectedConversation.participant_1_name}`} />
                  <AvatarFallback>{(selectedConversation.participant_1_id === currentUserId ? selectedConversation.participant_2_name : selectedConversation.participant_1_name).charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800">
                    {selectedConversation.participant_1_id === currentUserId 
                      ? selectedConversation.participant_2_name 
                      : selectedConversation.participant_1_name}
                  </p>
                  <p className="text-sm text-gray-600">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGroupMessage(true)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Send group message"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => intelligentAction("get_conversation_stats")}
                  className="text-green-600 hover:text-green-700"
                  title="View statistics"
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isFromCurrentUser = message.sender_id === currentUserId
                    
                    return (
                      <EnhancedMessageDisplay
                        key={message.id}
                        message={message}
                        isFromCurrentUser={isFromCurrentUser}
                        currentUserId={currentUserId}
                        onReply={handleReply}
                        onForward={(msg) => console.log("Forward:", msg)}
                        onStar={handleStarMessage}
                        onDelete={handleDeleteMessage}
                        onReact={handleReactToMessage}
                        onMarkAsRead={handleMarkAsRead}
                        isStarred={false}
                        showReadReceipt={true}
                      />
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Enhanced Message Input */}
            <div className="p-4 border-t border-gray-200">
              <EnhancedMessageInput
                onSendMessage={sendMessage}
                isAdmin={isAdmin}
                isTyping={isTyping}
                onTypingChange={setIsTyping}
                replyTo={replyTo}
                onClearReply={() => setReplyTo(null)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Group Message Dialog */}
      <Dialog open={showGroupMessage} onOpenChange={setShowGroupMessage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Send Group Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupMessage">Message to all users</Label>
              <Textarea
                id="groupMessage"
                placeholder="Type your group message here..."
                value={groupMessage}
                onChange={(e) => setGroupMessage(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGroupMessage(false)}
                disabled={isSendingGroup}
              >
                Cancel
              </Button>
              <Button
                onClick={sendGroupMessage}
                disabled={!groupMessage.trim() || isSendingGroup}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSendingGroup ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send to All"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Communication Statistics
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {conversationStats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Messages:</span>
                  <span className="font-semibold">{conversationStats.totalMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unread Messages:</span>
                  <span className="font-semibold text-orange-600">{conversationStats.unreadMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Conversations:</span>
                  <span className="font-semibold text-green-600">{conversationStats.activeConversations}</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-semibold">{conversationStats.avgResponseTime}ms</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No statistics available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
