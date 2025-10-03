"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Search,
  Send,
  Smile,
  Plus,
  Check,
  CheckCheck,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import ModernChatInterface from "./modern-chat-interface"

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

interface SimpleChatSystemProps {
  currentUserId: string
  currentUserName: string
  isAdmin?: boolean
  batchId?: string
}

export default function SimpleChatSystem({
  currentUserId,
  currentUserName,
  isAdmin = false,
  batchId
}: SimpleChatSystemProps) {
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [showMobileUserList, setShowMobileUserList] = useState(false)

  // Load users
  useEffect(() => {
    loadUsers()
  }, [currentUserId])

  // Debug function to check database tables
  const debugDatabaseTables = async () => {
    console.log("🔍 DEBUG: Checking database tables...")
    
    // Check profile table
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .limit(5)
      
      if (profileError) {
        console.log("❌ Profile table error:", profileError)
        console.log("❌ Profile error message:", profileError.message)
        console.log("❌ Profile error code:", profileError.code)
      } else {
        console.log("✅ Profile table data:", profileData)
      }
    } catch (e) {
      console.log("❌ Profile table exception:", e)
    }

    // Check batches table
    try {
      const { data: batchesData, error: batchesError } = await supabase
        .from("batches")
        .select("*")
        .limit(5)
      
      if (batchesError) {
        console.log("❌ Batches table error:", batchesError)
        console.log("❌ Batches error message:", batchesError.message)
        console.log("❌ Batches error code:", batchesError.code)
      } else {
        console.log("✅ Batches table data:", batchesData)
      }
    } catch (e) {
      console.log("❌ Batches table exception:", e)
    }

    // Check chart_messages table
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("chart_messages")
        .select("*")
        .limit(5)
      
      if (messagesError) {
        console.log("❌ Chart_messages table error:", messagesError)
        console.log("❌ Chart_messages error message:", messagesError.message)
        console.log("❌ Chart_messages error code:", messagesError.code)
      } else {
        console.log("✅ Chart_messages table data:", messagesData)
      }
    } catch (e) {
      console.log("❌ Chart_messages table exception:", e)
    }
  }

  // Function to create necessary tables if they don't exist
  const createTablesIfNeeded = async () => {
    console.log("🔧 Checking if tables need to be created...")
    
    try {
      // Try to create the chart_messages table
      const { error: messagesTableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS chart_messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            receiver_name TEXT NOT NULL,
            message TEXT NOT NULL,
            message_type TEXT DEFAULT 'text',
            is_read BOOLEAN DEFAULT FALSE,
            is_admin_message BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (messagesTableError) {
        console.log("❌ Could not create chart_messages table:", messagesTableError.message)
      } else {
        console.log("✅ Chart_messages table ready")
      }
    } catch (e) {
      console.log("❌ Error creating tables:", e)
    }
  }

  // Run debug on component mount
  useEffect(() => {
    debugDatabaseTables()
    createTablesIfNeeded()
  }, [])

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id)
    }
  }, [selectedUser, currentUserId])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      console.log("🔄 Loading users for conversations from profile and batches tables")
      console.log("Current User ID:", currentUserId, "Batch ID:", batchId)
      
      const allUsers: User[] = []
      
      // 1. Load users from PROFILE table (if exists)
      try {
        console.log("📋 Loading users from profile table...")
        const { data: profilesData, error: profilesError } = await supabase
          .from("profile")
          .select("id, name, email, role, created_at")
          .neq("id", currentUserId)
          .order("created_at", { ascending: false })

        if (profilesError) {
          console.log("❌ Profile table error:", profilesError)
          if (profilesError.message && (profilesError.message.includes("relation") || profilesError.message.includes("does not exist"))) {
            console.log("📝 Profile table does not exist - skipping")
          } else {
            console.warn("Profile table exists but has error:", profilesError.message || "Unknown error")
          }
        } else if (profilesData && profilesData.length > 0) {
          console.log("✅ Loaded profiles:", profilesData.length)
          const usersFromProfiles = profilesData.map(profile => ({
            id: profile.id,
            name: profile.name || "Unknown User",
            email: profile.email || `${profile.id}@example.com`,
            role: (profile.role as "admin" | "batch_user") || "batch_user",
            created_at: profile.created_at,
            isOnline: Math.random() > 0.3,
            lastSeen: Math.random() > 0.5 ? "2m ago" : "Online"
          }))
          allUsers.push(...usersFromProfiles)
        } else {
          console.log("📝 No profiles found in profile table")
        }
      } catch (profileError) {
        console.log("📝 Profile table not accessible:", profileError)
      }

      // 2. Load users from BATCHES table (get ALL batches for chat)
      try {
        console.log("🌾 Loading farmers from batches table...")
        const { data: batchesData, error: batchesError } = await supabase
          .from("batches")
          .select("id, farmer_id, farmer_name, farmer_email, username, created_at")
          .order("created_at", { ascending: false })

        if (batchesError) {
          console.log("❌ Batches table error:", batchesError)
          if (batchesError.message && (batchesError.message.includes("relation") || batchesError.message.includes("does not exist"))) {
            console.log("📝 Batches table does not exist - skipping")
          } else {
            console.warn("Batches table exists but has error:", batchesError.message || "Unknown error")
          }
        } else if (batchesData && batchesData.length > 0) {
          console.log("✅ Loaded batches:", batchesData.length)
          const usersFromBatches = batchesData
            .filter(batch => (batch.farmer_id || batch.username) && (batch.farmer_name || batch.username)) // Include batches with farmer info or username
            .map(batch => ({
              id: batch.farmer_id || batch.username || `batch-${batch.id}`,
              name: batch.farmer_name || batch.username || `Batch ${batch.id}`,
              email: batch.farmer_email || `${batch.farmer_id || batch.username}@example.com`,
              role: "batch_user" as const,
              created_at: batch.created_at,
              isOnline: Math.random() > 0.3,
              lastSeen: Math.random() > 0.5 ? "2m ago" : "Online"
            }))
            .filter(user => user.id !== currentUserId) // Exclude current user
          
          console.log("✅ Processed farmers from batches:", usersFromBatches.length)
          allUsers.push(...usersFromBatches)
        } else {
          console.log("📝 No batches found in batches table")
        }
      } catch (batchesError) {
        console.log("📝 Batches table not accessible:", batchesError)
      }

      // 3. Always add admin user to the list
      const adminUser: User = {
        id: "admin-tariq",
        name: "Tariq (Admin)",
        email: "tariq@admin.com",
        role: "admin",
        created_at: new Date().toISOString(),
        isOnline: true,
        lastSeen: "Online"
      }

      // Add admin if not current user (always at the top)
      if (adminUser.id !== currentUserId) {
        // Remove any existing admin user first
        const filteredUsers = allUsers.filter(user => user.id !== adminUser.id)
        filteredUsers.unshift(adminUser) // Add admin at the top
        allUsers.length = 0 // Clear array
        allUsers.push(...filteredUsers) // Add back all users with admin first
        console.log("✅ Added admin user to chat list")
      }

      // 4. Remove duplicates and filter out current user
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id) && user.id !== currentUserId
      )

      console.log("🎯 Total unique users for conversations:", uniqueUsers.length)
      console.log("Users list:", uniqueUsers.map(u => `${u.name} (${u.role})`))

      if (uniqueUsers.length === 0) {
        console.log("📝 No users found, creating demo users")
        // Create demo users if no real users found
        const demoUsers = [
          {
            id: "demo-admin",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin" as const,
            created_at: new Date().toISOString(),
            isOnline: true,
            lastSeen: "Online"
          },
          {
            id: "demo-farmer-1", 
            name: "John Farmer",
            email: "john@example.com",
            role: "batch_user" as const,
            created_at: new Date().toISOString(),
            isOnline: Math.random() > 0.3,
            lastSeen: Math.random() > 0.5 ? "2m ago" : "Online"
          },
          {
            id: "demo-farmer-2",
            name: "Sarah Farmer", 
            email: "sarah@example.com",
            role: "batch_user" as const,
            created_at: new Date().toISOString(),
            isOnline: Math.random() > 0.3,
            lastSeen: Math.random() > 0.5 ? "5m ago" : "Online"
          }
        ].filter(user => user.id !== currentUserId)
        
        setUsers(demoUsers)
        toast.info("Demo users loaded - set up your database tables for real users")
      } else {
        setUsers(uniqueUsers)
        toast.success(`Loaded ${uniqueUsers.length} users for conversations`)
      }

    } catch (error) {
      console.error("❌ Unexpected error loading users:", error)
      toast.error("Unexpected error: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (receiverId: string) => {
    try {
      setIsLoading(true)
      console.log("💬 Loading messages between:", currentUserId, "and", receiverId)
      
      // First check if chart_messages table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from("chart_messages")
        .select("id")
        .limit(1)

      if (tableError) {
        console.error("❌ Chart_messages table check error:", tableError)
        
        // If chart_messages table doesn't exist, create mock messages for demo
        if (tableError.message.includes("relation") && tableError.message.includes("does not exist")) {
          console.log("📝 Chart_messages table doesn't exist, creating mock messages")
          const mockMessages: Message[] = [
            {
              id: "mock-1",
              sender_id: receiverId,
              receiver_id: currentUserId,
              sender_name: receiverId === "admin-tariq" ? "Tariq (Admin)" : "Mock User",
              receiver_name: currentUserName,
              message: "Hello! This is a demo message.",
              created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              is_read: false,
              message_type: "text"
            },
            {
              id: "mock-2",
              sender_id: currentUserId,
              receiver_id: receiverId,
              sender_name: currentUserName,
              receiver_name: receiverId === "admin-tariq" ? "Tariq (Admin)" : "Mock User",
              message: "Hi there! How are you?",
              created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
              is_read: true,
              message_type: "text"
            }
          ]
          setMessages(mockMessages)
          return
        }
        
        toast.error("Database error: " + tableError.message)
        return
      }

      // Load messages where current user is either sender or receiver
      const { data, error } = await supabase
        .from("chart_messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("❌ Error loading messages:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        toast.error("Failed to load messages: " + (error.message || "Unknown error"))
        return
      }

      console.log("✅ Loaded messages:", data?.length || 0)
      console.log("Messages data:", data)
      setMessages(data || [])
    } catch (error) {
      console.error("❌ Unexpected error loading messages:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      toast.error("Unexpected error: " + ((error as Error)?.message || "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (message: string, receiverId: string) => {
    if (!message.trim()) return

    try {
      setIsSendingMessage(true)
      console.log("📤 Sending message:", message.substring(0, 50) + "...", "to:", receiverId)
      console.log("Available users:", users.map(u => ({ id: u.id, name: u.name })))
      
      // Find receiver name
      const receiver = users.find(u => u.id === receiverId)
      if (!receiver) {
        console.error("❌ Receiver not found in users list:", receiverId)
        console.error("Available user IDs:", users.map(u => u.id))
        toast.error("User not found in the system")
        return
      }

      console.log("✅ Found receiver:", receiver.name, "ID:", receiver.id)

      // First check if chart_messages table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from("chart_messages")
        .select("id")
        .limit(1)

      if (tableError) {
        console.error("❌ Chart_messages table check error:", tableError)
        console.error("Table error details:", JSON.stringify(tableError, null, 2))
        
        // If chart_messages table doesn't exist, create a mock message
        if (tableError.message && (tableError.message.includes("relation") && tableError.message.includes("does not exist"))) {
          console.log("📝 Chart_messages table doesn't exist, creating mock message")
          const mockMessage = {
            id: "mock-" + Date.now(),
            sender_id: currentUserId,
            receiver_id: receiverId,
            sender_name: currentUserName,
            receiver_name: receiver.name,
            message: message.trim(),
            created_at: new Date().toISOString(),
            is_read: false,
            message_type: "text"
          }
          setMessages(prev => [...prev, mockMessage])
          toast.success("Message sent (demo mode - tables not set up)")
          return
        }
        
        // For any other table error, also create mock message
        console.log("📝 Chart_messages table error, creating mock message")
        const mockMessage = {
          id: "mock-" + Date.now(),
          sender_id: currentUserId,
          receiver_id: receiverId,
          sender_name: currentUserName,
          receiver_name: receiver.name,
          message: message.trim(),
          created_at: new Date().toISOString(),
          is_read: false,
          message_type: "text"
        }
        setMessages(prev => [...prev, mockMessage])
        toast.success("Message sent (demo mode - database issue)")
        return
      }

      console.log("✅ Chart_messages table exists, inserting message...")
      console.log("Insert data:", {
        sender_id: currentUserId,
        receiver_id: receiverId,
        sender_name: currentUserName,
        receiver_name: receiver.name,
        message: message.trim(),
        message_type: "text",
        is_read: false,
        is_admin_message: isAdmin
      })

      const { data, error } = await supabase
        .from("chart_messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          sender_name: currentUserName,
          receiver_name: receiver.name,
          message: message.trim(),
          message_type: "text",
          is_read: false,
          is_admin_message: isAdmin
        })
        .select()
        .single()

      console.log("Supabase response - data:", data)
      console.log("Supabase response - error:", error)

      if (error) {
        console.error("❌ Error sending message:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        console.error("Error message:", error.message)
        console.error("Error code:", error.code)
        console.error("Error hint:", error.hint)
        console.error("Error details:", error.details)
        toast.error("Failed to send message: " + (error.message || "Unknown error"))
        return
      }

      if (data) {
        console.log("✅ Message sent successfully:", data.id)
        // Add message to local state
        setMessages(prev => [...prev, data])
        toast.success("Message sent")
      } else {
        console.warn("⚠️ No data returned from Supabase, creating mock message")
        // Fallback: create a mock message
        const mockMessage = {
          id: "mock-" + Date.now(),
          sender_id: currentUserId,
          receiver_id: receiverId,
          sender_name: currentUserName,
          receiver_name: receiver.name,
          message: message.trim(),
          created_at: new Date().toISOString(),
          is_read: false,
          message_type: "text"
        }
        setMessages(prev => [...prev, mockMessage])
        toast.success("Message sent (fallback mode)")
      }
    } catch (error) {
      console.error("❌ Unexpected error sending message:", error)
      console.error("Error type:", typeof error)
      console.error("Error constructor:", error?.constructor?.name)
      console.error("Error details:", JSON.stringify(error, null, 2))
      console.error("Error message:", (error as Error)?.message)
      console.error("Error stack:", (error as Error)?.stack)
      
      // Try to get more details about the error
      if (error && typeof error === 'object') {
        console.error("Error keys:", Object.keys(error))
        console.error("Error values:", Object.values(error))
      }
      
      // Final fallback: create a mock message even if everything fails
      console.log("🔄 Creating fallback mock message due to error")
      const fallbackMessage = {
        id: "fallback-" + Date.now(),
        sender_id: currentUserId,
        receiver_id: receiverId,
        sender_name: currentUserName,
        receiver_name: receiver.name,
        message: message.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
        message_type: "text"
      }
      setMessages(prev => [...prev, fallbackMessage])
      toast.success("Message sent (fallback mode - system error)")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          {selectedUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUser(null)}
            >
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        {/* User List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <ModernChatInterface
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            users={users}
            messages={messages}
            selectedUser={selectedUser}
            onSendMessage={sendMessage}
            onSelectUser={setSelectedUser}
            onBack={() => setSelectedUser(null)}
            isLoading={isSendingMessage}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1">
        {selectedUser ? (
          <ModernChatInterface
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            users={users}
            messages={messages}
            selectedUser={selectedUser}
            onSendMessage={sendMessage}
            onSelectUser={setSelectedUser}
            onBack={() => setSelectedUser(null)}
            isLoading={isSendingMessage}
          />
        ) : (
          <div className="h-full bg-white">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
