"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff, 
  Image, 
  FileText, 
  AlertTriangle,
  Clock,
  Star,
  Reply,
  Forward,
  MoreVertical,
  X,
  CheckCircle,
  Zap
} from "lucide-react"
import { toast } from "sonner"

interface MessageTemplate {
  id: string
  title: string
  content: string
  category: "greeting" | "response" | "urgent" | "info"
}

interface EnhancedMessageInputProps {
  onSendMessage: (message: {
    content: string
    type: "text" | "image" | "file" | "urgent" | "scheduled"
    priority?: "low" | "normal" | "high" | "urgent"
    scheduledAt?: string
    templateId?: string
  }) => void
  isAdmin?: boolean
  isTyping?: boolean
  onTypingChange?: (typing: boolean) => void
  replyTo?: {
    id: string
    content: string
    sender: string
  }
  onClearReply?: () => void
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome",
    title: "Welcome Message",
    content: "Hello! Welcome to our broiler management system. How can I help you today?",
    category: "greeting"
  },
  {
    id: "urgent_response",
    title: "Urgent Response",
    content: "I've received your urgent message. I'm looking into this immediately and will get back to you shortly.",
    category: "urgent"
  },
  {
    id: "batch_update",
    title: "Batch Update",
    content: "Your batch has been updated successfully. All changes have been recorded in the system.",
    category: "info"
  },
  {
    id: "report_received",
    title: "Report Received",
    content: "Thank you for submitting your report. I've reviewed it and it looks good. Keep up the excellent work!",
    category: "response"
  },
  {
    id: "maintenance_notice",
    title: "Maintenance Notice",
    content: "Scheduled maintenance will occur tonight from 10 PM to 2 AM. The system will be temporarily unavailable.",
    category: "info"
  }
]

const EMOJIS = ["😊", "👍", "❤️", "🎉", "🔥", "💯", "👏", "🤔", "😢", "😡", "🚨", "✅", "❌", "⚠️", "📝", "💡"]

export default function EnhancedMessageInput({
  onSendMessage,
  isAdmin = false,
  isTyping = false,
  onTypingChange,
  replyTo,
  onClearReply
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal")
  const [scheduledAt, setScheduledAt] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showScheduling, setShowScheduling] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    if (selectedTemplate) {
      const template = MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate)
      if (template) {
        setMessage(template.content)
        setSelectedTemplate("")
      }
    }
  }, [selectedTemplate])

  const handleSend = () => {
    if (!message.trim()) return

    const messageData = {
      content: message.trim(),
      type: priority === "urgent" ? "urgent" : "text" as const,
      priority,
      scheduledAt: scheduledAt || undefined,
      templateId: selectedTemplate || undefined
    }

    onSendMessage(messageData)
    setMessage("")
    setPriority("normal")
    setScheduledAt("")
    setAttachments([])
    onTypingChange?.(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    onTypingChange?.(true)
    
    // Stop typing indicator after 3 seconds
    setTimeout(() => {
      onTypingChange?.(false)
    }, 3000)
  }

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojis(false)
    textareaRef.current?.focus()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recordingRef.current = new MediaRecorder(stream)
      
      recordingRef.current.ondataavailable = (event) => {
        // Handle audio data
        console.log("Audio data available:", event.data)
      }
      
      recordingRef.current.start()
      setIsRecording(true)
    } catch (error) {
      toast.error("Could not start recording")
    }
  }

  const stopRecording = () => {
    if (recordingRef.current) {
      recordingRef.current.stop()
      setIsRecording(false)
      toast.success("Voice message recorded")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "normal": return "bg-blue-500 text-white"
      case "low": return "bg-gray-500 text-white"
      default: return "bg-blue-500 text-white"
    }
  }

  return (
    <div className="space-y-4">
      {/* Reply Preview */}
      {replyTo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Reply className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Replying to {replyTo.sender}</span>
                </div>
                <p className="text-sm text-blue-700 truncate">{replyTo.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearReply}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Templates */}
      {isAdmin && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Quick Templates</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              {showTemplates ? "Hide" : "Show"} Templates
            </Button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-1 gap-2">
              {MESSAGE_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(template.id)}
                  className="justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium">{template.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{template.content}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Priority and Scheduling */}
      <div className="flex gap-2">
        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScheduling(!showScheduling)}
          >
            <Clock className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        )}
      </div>

      {/* Scheduling Options */}
      {showScheduling && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Schedule Message</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-yellow-700">
                Message will be sent at the scheduled time
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Attachments</Label>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">
            Message {priority !== "normal" && (
              <Badge className={`ml-2 ${getPriorityColor(priority)}`}>
                {priority.toUpperCase()}
              </Badge>
            )}
          </Label>
          {isTyping && (
            <Badge variant="outline" className="text-blue-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Typing...
              </div>
            </Badge>
          )}
        </div>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="min-h-[100px] max-h-48 resize-none pr-20"
          />
          
          {/* Action Buttons */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojis(!showEmojis)}
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className={`h-8 w-8 p-0 ${isRecording ? "text-red-600" : ""}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojis && (
          <Card className="absolute bottom-full right-0 mb-2 z-10">
            <CardContent className="p-3">
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => addEmoji(emoji)}
                    className="h-8 w-8 p-0 text-lg"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        multiple
        onChange={handleFileUpload}
      />
    </div>
  )
}
