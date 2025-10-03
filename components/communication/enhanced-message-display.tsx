"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Reply, 
  Forward, 
  Star, 
  StarOff, 
  Trash2, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  FileText,
  Image,
  Download,
  Eye,
  EyeOff
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  sender_name: string
  receiver_name: string
  message: string
  message_type: "text" | "image" | "file" | "system" | "urgent" | "scheduled"
  conversation_id: string
  is_read: boolean
  is_admin_message: boolean
  batch_id?: string
  priority?: "low" | "normal" | "high" | "urgent"
  created_at: string
  updated_at: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
    size: number
  }>
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  reply_to?: {
    id: string
    content: string
    sender: string
  }
}

interface EnhancedMessageDisplayProps {
  message: Message
  isFromCurrentUser: boolean
  currentUserId: string
  onReply?: (message: Message) => void
  onForward?: (message: Message) => void
  onStar?: (messageId: string, starred: boolean) => void
  onDelete?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
  onMarkAsRead?: (messageId: string) => void
  isStarred?: boolean
  showReadReceipt?: boolean
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "👏"]

export default function EnhancedMessageDisplay({
  message,
  isFromCurrentUser,
  currentUserId,
  onReply,
  onForward,
  onStar,
  onDelete,
  onReact,
  onMarkAsRead,
  isStarred = false,
  showReadReceipt = true
}: EnhancedMessageDisplayProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent": return "border-red-500 bg-red-50"
      case "high": return "border-orange-500 bg-orange-50"
      case "normal": return "border-blue-500 bg-blue-50"
      case "low": return "border-gray-500 bg-gray-50"
      default: return "border-blue-500 bg-blue-50"
    }
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "high": return <Zap className="h-4 w-4 text-orange-600" />
      case "normal": return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "low": return <Clock className="h-4 w-4 text-gray-600" />
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTime = (dateString: string) => {
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

  const handleReaction = (emoji: string) => {
    onReact?.(message.id, emoji)
    setShowReactions(false)
  }

  const handleMarkAsRead = () => {
    if (!message.is_read && !isFromCurrentUser) {
      onMarkAsRead?.(message.id)
    }
  }

  return (
    <div
      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-4 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-xs lg:max-w-md ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
        {/* Reply Context */}
        {message.reply_to && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1">Replying to {message.reply_to.sender}</div>
            <div className="text-sm text-gray-800 truncate">{message.reply_to.content}</div>
          </div>
        )}

        {/* Message Card */}
        <Card className={`shadow-sm hover:shadow-md transition-shadow ${
          isFromCurrentUser 
            ? 'bg-blue-500 text-white' 
            : message.priority === 'urgent'
            ? 'border-red-500 bg-red-50'
            : 'bg-white'
        } ${message.priority ? getPriorityColor(message.priority) : ''}`}>
          <CardContent className="p-3">
            {/* Message Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {message.priority && (
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(message.priority)}
                    <span className="text-xs font-medium">
                      {message.priority.toUpperCase()}
                    </span>
                  </div>
                )}
                {message.message_type === "scheduled" && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                )}
                {message.message_type === "urgent" && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    URGENT
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {message.is_admin_message && (
                  <Badge variant="outline" className="text-xs">
                    Admin
                  </Badge>
                )}
                <span className="text-xs opacity-70">
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div className="mb-2">
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                    {attachment.type.startsWith('image/') ? (
                      <Image className="h-4 w-4 text-gray-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{attachment.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {message.reactions.map((reaction, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(reaction.emoji)}
                    className="h-6 px-2 text-xs"
                  >
                    {reaction.emoji} {reaction.count}
                  </Button>
                ))}
              </div>
            )}

            {/* Message Actions */}
            {isHovered && (
              <div className="flex items-center gap-1 pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply?.(message)}
                  className="h-6 w-6 p-0"
                  title="Reply"
                >
                  <Reply className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onForward?.(message)}
                  className="h-6 w-6 p-0"
                  title="Forward"
                >
                  <Forward className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStar?.(message.id, !isStarred)}
                  className="h-6 w-6 p-0"
                  title={isStarred ? "Unstar" : "Star"}
                >
                  {isStarred ? (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  ) : (
                    <StarOff className="h-3 w-3" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReactions(!showReactions)}
                  className="h-6 w-6 p-0"
                  title="Add reaction"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
                
                {isFromCurrentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(message.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Read Receipt */}
            {showReadReceipt && isFromCurrentUser && (
              <div className="flex items-center justify-end gap-1 mt-2">
                {message.is_read ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Read
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Sent
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reaction Picker */}
        {showReactions && (
          <Card className="absolute bottom-full right-0 mb-2 z-10">
            <CardContent className="p-2">
              <div className="flex gap-1">
                {REACTION_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(emoji)}
                    className="h-8 w-8 p-0 text-lg"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sender Avatar */}
      {!isFromCurrentUser && (
        <div className="order-2 ml-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender_name}`} />
            <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  )
}
