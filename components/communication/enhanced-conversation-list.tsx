"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Users, 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "farmer" | "user"
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
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
  is_starred?: boolean
  is_archived?: boolean
  priority?: "low" | "normal" | "high" | "urgent"
  message_type?: "text" | "image" | "file" | "system" | "urgent"
}

interface EnhancedConversationListProps {
  conversations: Conversation[]
  users: User[]
  currentUserId: string
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  onStartConversation: (userId: string, userName: string) => void
  onStarConversation: (conversationId: string, starred: boolean) => void
  onArchiveConversation: (conversationId: string, archived: boolean) => void
  onDeleteConversation: (conversationId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filter: "all" | "unread" | "starred" | "archived" | "urgent"
  onFilterChange: (filter: "all" | "unread" | "starred" | "archived" | "urgent") => void
}

export default function EnhancedConversationList({
  conversations,
  users,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  onStartConversation,
  onStarConversation,
  onArchiveConversation,
  onDeleteConversation,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange
}: EnhancedConversationListProps) {
  const [showUserList, setShowUserList] = useState(false)

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant_1_id === currentUserId 
      ? { id: conversation.participant_2_id, name: conversation.participant_2_name } 
      : { id: conversation.participant_1_id, name: conversation.participant_1_name }
  }

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.participant_1_id === currentUserId 
      ? conversation.unread_count_1 
      : conversation.unread_count_2
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "high": return <Zap className="h-4 w-4 text-orange-600" />
      case "normal": return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "low": return <Clock className="h-4 w-4 text-gray-600" />
      default: return null
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent": return "border-l-red-500 bg-red-50"
      case "high": return "border-l-orange-500 bg-orange-50"
      case "normal": return "border-l-blue-500 bg-blue-50"
      case "low": return "border-l-gray-500 bg-gray-50"
      default: return ""
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv)
    const matchesSearch = otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (filter) {
      case "unread":
        return matchesSearch && getUnreadCount(conv) > 0
      case "starred":
        return matchesSearch && conv.is_starred
      case "archived":
        return matchesSearch && conv.is_archived
      case "urgent":
        return matchesSearch && conv.priority === "urgent"
      default:
        return matchesSearch && !conv.is_archived
    }
  })

  const availableUsers = users.filter(user => 
    user.id !== currentUserId && 
    !conversations.some(conv => 
      conv.participant_1_id === user.id || conv.participant_2_id === user.id
    )
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Conversations</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserList(!showUserList)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All", count: conversations.filter(c => !c.is_archived).length },
            { key: "unread", label: "Unread", count: conversations.filter(c => getUnreadCount(c) > 0).length },
            { key: "starred", label: "Starred", count: conversations.filter(c => c.is_starred).length },
            { key: "urgent", label: "Urgent", count: conversations.filter(c => c.priority === "urgent").length },
            { key: "archived", label: "Archived", count: conversations.filter(c => c.is_archived).length }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange(key as any)}
              className="flex-1 text-xs"
            >
              {label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* User List for New Conversations */}
      {showUserList && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h4 className="text-sm font-semibold text-blue-800 mb-3">Start New Conversation</h4>
          <ScrollArea className="max-h-32">
            <div className="space-y-2">
              {availableUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    onStartConversation(user.id, user.name)
                    setShowUserList(false)
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || `/api/placeholder/32/32`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.role}</p>
                  </div>
                  {user.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {filter === "all" ? "No conversations yet" : `No ${filter} conversations`}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const unreadCount = getUnreadCount(conversation)
              const isSelected = selectedConversationId === conversation.id
              
              return (
                <Card
                  key={conversation.id}
                  className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  } ${conversation.priority ? getPriorityColor(conversation.priority) : ""}`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.name}`} />
                        <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{otherParticipant.name}</p>
                            {conversation.priority && getPriorityIcon(conversation.priority)}
                            {conversation.is_starred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.last_message_at)}
                            </span>
                            {unreadCount > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {conversation.last_message || "No messages yet"}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {conversation.message_type === "urgent" && (
                              <Badge variant="destructive" className="text-xs">
                                URGENT
                              </Badge>
                            )}
                            {conversation.is_archived && (
                              <Badge variant="outline" className="text-xs">
                                Archived
                              </Badge>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onStarConversation(conversation.id, !conversation.is_starred)
                                }}
                              >
                                {conversation.is_starred ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Unstar
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Star
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onArchiveConversation(conversation.id, !conversation.is_archived)
                                }}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                {conversation.is_archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteConversation(conversation.id)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
