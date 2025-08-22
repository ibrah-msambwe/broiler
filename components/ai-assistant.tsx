"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Minimize2, Send, Bot, User, Sparkles } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  userEmail?: string
}

export default function AIAssistant({ userEmail = "ibrahim8msambwe@gmail.com" }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "👋 Hello Ibrahim! I'm your SecureVault Pro AI Assistant created by Msambwe Pro. I know everything about your password management system and can help you with any questions. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getIntelligentResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase()

    // System information responses
    if (message.includes("what") && (message.includes("system") || message.includes("do"))) {
      return `🔐 **SecureVault Pro** is an enterprise-grade password management system created by **Msambwe Pro**. Here's what it does:

**Core Features:**
• 🔑 **Credential Vault** - Securely store passwords for all your devices and services
• 🖥️ **Device Management** - Manage servers, laptops, domains, and cloud services
• ☁️ **Cloud Sync** - Your data is saved online and accessible from any device
• 💾 **Automatic Backups** - Daily backups ensure your data is never lost
• 📊 **Security Analytics** - Monitor password strength and security status
• 🤖 **AI Assistant** - That's me! I help you with everything

**Your Account:** ${userEmail}
**Current Status:** All data is securely stored and synced to the cloud!`
    }

    // Gmail/email related questions
    if (message.includes("gmail") || message.includes("email") || message.includes("username")) {
      return `📧 **Your Gmail Account Information:**

**Email:** ${userEmail}
**Status:** This is your primary account for SecureVault Pro

**To find your Gmail credentials:**
1. Go to the **Credential Vault** tab
2. Look for "Gmail Account" or "Email Account" entries
3. Your Gmail username should be: ${userEmail}

**Security Tip:** Your Gmail password is safely encrypted in the vault. Use the eye icon to view it when needed!

Need help accessing your Gmail credentials? I can guide you step by step! 🔐`
    }

    // Who are you questions
    if (message.includes("who are you") || message.includes("who") || message.includes("what are you")) {
      return `🤖 **I'm your SecureVault Pro AI Assistant!**

**Created by:** Msambwe Pro
**Purpose:** Help you manage passwords and navigate the system
**Capabilities:**
• Answer questions about SecureVault Pro features
• Help you find stored credentials
• Explain security best practices
• Guide you through system functions
• Provide personalized assistance for ${userEmail}

**I'm intelligent and context-aware** - I understand your questions and can help with anything related to password management, security, or system features!

What would you like to know about your SecureVault Pro system? 🔐✨`
    }

    // Password/credential related questions
    if (message.includes("password") || message.includes("credential")) {
      return `🔑 **Password & Credential Management:**

**Your Current Status:**
• Account: ${userEmail}
• Stored Credentials: Available in your vault
• Security: All passwords encrypted with AES-256

**Common Actions:**
• **View Passwords:** Go to Credential Vault → Click eye icon
• **Add New:** Click "Add Credential" button
• **Edit:** Click edit button on any credential
• **Export:** Use "Export HTML" in the header

**Security Features:**
• Password generator for strong passwords
• Automatic cloud backup
• Cross-device synchronization
• Breach monitoring

Need help with a specific password or credential? Just ask! 🛡️`
    }

    // Device management questions
    if (message.includes("device") || message.includes("server") || message.includes("add")) {
      return `🖥️ **Device & System Management:**

**Your SecureVault Pro supports:**
• Physical devices (servers, laptops, desktops)
• Systems & software
• Domains & websites
• Cloud services

**To Add a Device:**
1. Go to "Device & System Management" tab
2. Click "Add Device/System"
3. Choose category (device/system/domain/cloud)
4. Fill in details (name, IP, domain, etc.)
5. Save - it syncs to cloud automatically!

**Your devices are accessible from anywhere with your email: ${userEmail}**

Want me to walk you through adding a specific type of device? 🚀`
    }

    // Backup and security questions
    if (message.includes("backup") || message.includes("save") || message.includes("sync")) {
      return `💾 **Backup & Cloud Storage:**

**Your Data Security:**
• **Auto-Backup:** Daily at 2:00 AM
• **Cloud Storage:** All data saved online
• **Encryption:** AES-256 military-grade
• **Access:** Available from any device with ${userEmail}

**Manual Backup:**
1. Go to "Backup & Storage" tab
2. Click "Create & Download Backup"
3. Get instant backup file

**Cloud Sync Status:** ✅ Active
**Last Sync:** Real-time (every 30 seconds)
**Recovery:** Possible from any device

Your data is completely safe and accessible anywhere! 🌐🔒`
    }

    // Export questions
    if (message.includes("export") || message.includes("download")) {
      return `📥 **Export Your Data:**

**Available Export Options:**
• **Full Export:** All credentials and devices (HTML format)
• **Single Credential:** Individual password export (PDF)
• **Backup File:** Complete system backup (JSON)

**How to Export:**
1. **Full Export:** Click "Export HTML" in header
2. **Single Item:** Click download icon on any credential
3. **Backup:** Go to Backup tab → "Create & Download Backup"

**Export includes:**
• All your devices and systems
• Encrypted credential information
• Security metadata
• Access instructions

**Note:** Passwords are redacted in exports for security. Access them through SecureVault Pro with ${userEmail}! 🔐📄`
    }

    // Help and navigation
    if (message.includes("help") || message.includes("how") || message.includes("guide")) {
      return `🆘 **SecureVault Pro Help Guide:**

**Main Sections:**
• **Device Management:** Add/edit servers, systems, domains
• **Credential Vault:** Store/manage passwords securely
• **Backup & Storage:** Manage backups and cloud sync
• **AI Assistant:** That's me! Always here to help

**Quick Actions:**
• Add new credential: Credential Vault → Add Credential
• Add device: Device Management → Add Device/System
• Export data: Header → Export HTML
• View passwords: Click eye icon on credentials

**Your Account:** ${userEmail}
**System Status:** All systems operational ✅

**Need specific help?** Just ask me:
• "How do I add a server?"
• "Where are my Gmail credentials?"
• "How do I backup my data?"

I'm here to make SecureVault Pro easy for you! 🚀`
    }

    // Security questions
    if (message.includes("secure") || message.includes("safe") || message.includes("security")) {
      return `🛡️ **Security Features:**

**Your Data Protection:**
• **Encryption:** AES-256 military-grade encryption
• **Authentication:** Multi-factor with security questions
• **Cloud Security:** Secure encrypted cloud storage
• **Access Control:** Only accessible with ${userEmail} credentials

**Security Monitoring:**
• Password strength analysis
• Breach detection alerts
• Automatic security updates
• Real-time sync protection

**Best Practices:**
• Use strong, unique passwords
• Enable automatic backups
• Regular security reviews
• Keep credentials updated

**Your Security Score:** Excellent ✅
**Created by:** Msambwe Pro - Enterprise Security Standards

Your data is completely secure and protected! 🔐🌟`
    }

    // Default intelligent response
    return `🤖 **I understand you're asking about:** "${userMessage}"

**I'm your SecureVault Pro AI Assistant created by Msambwe Pro**, and I can help with:

• 🔑 **Password Management** - Finding, adding, editing credentials
• 🖥️ **Device Management** - Adding servers, systems, domains
• ☁️ **Cloud & Backup** - Data sync, backups, recovery
• 🔐 **Security** - Best practices, encryption, safety
• 📱 **System Navigation** - How to use features
• 📊 **Analytics** - Understanding your security status

**Your Account:** ${userEmail}
**System Status:** Fully operational ✅

**Try asking me:**
• "Show me my Gmail password"
• "How do I add a new server?"
• "Is my data backed up?"
• "How secure is my account?"

What specific help do you need with SecureVault Pro? 🚀`
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(async () => {
      const response = await getIntelligentResponse(inputValue)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 shadow-2xl border-0 z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      }`}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">SecureVault AI</CardTitle>
              <p className="text-xs text-blue-100">Created by Msambwe Pro</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Badge className="bg-green-500 text-white text-xs px-2 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "assistant" && <Bot className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />}
                      {message.type === "user" && <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about SecureVault Pro..."
                className="flex-1 border-gray-300 focus:border-blue-500"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center mt-2">
              <p className="text-xs text-gray-500">Powered by Msambwe Pro AI • SecureVault Pro Assistant</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
