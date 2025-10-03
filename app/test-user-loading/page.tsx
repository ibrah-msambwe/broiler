"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Database, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ChatUser {
  id: string
  name: string
  email: string
  role: "admin" | "batch_user"
  created_at: string
  isOnline: boolean
  lastSeen: string
  unreadCount?: number
}

export default function TestUserLoading() {
  const [users, setUsers] = useState<ChatUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setDebugInfo([])
      addDebugInfo("Starting user loading process...")
      
      const allUsers: ChatUser[] = []
      
      // 1. Load users from BATCHES table
      try {
        addDebugInfo("Loading farmers from batches table...")
        const { data: batchesData, error: batchesError } = await supabase
          .from("batches")
          .select("id, farmer_name, username, created_at, name, code")
          .order("created_at", { ascending: false })

        if (batchesError) {
          addDebugInfo(`❌ Batches table error: ${batchesError.message}`)
          addDebugInfo(`Error details: ${JSON.stringify(batchesError, null, 2)}`)
        } else {
          addDebugInfo(`✅ Batches query successful`)
          addDebugInfo(`Raw batches data: ${JSON.stringify(batchesData, null, 2)}`)
          addDebugInfo(`Batches count: ${batchesData?.length || 0}`)
          
          if (batchesData && batchesData.length > 0) {
            addDebugInfo(`✅ Loaded ${batchesData.length} batches`)
            const usersFromBatches = batchesData
              .filter(batch => (batch.farmer_name || batch.username))
              .map(batch => ({
                id: batch.username || `batch-${batch.id}`,
                name: batch.farmer_name || batch.username || `Batch ${batch.id}`,
                email: `${batch.username || `batch-${batch.id}`}@example.com`,
                role: "batch_user" as const,
                created_at: batch.created_at,
                isOnline: Math.random() > 0.3,
                lastSeen: Math.random() > 0.5 ? "2m ago" : "Online",
                unreadCount: Math.floor(Math.random() * 5)
              }))
              .filter(user => user.id !== "admin-tariq")
            
            allUsers.push(...usersFromBatches)
            addDebugInfo(`✅ Processed ${usersFromBatches.length} farmers from batches`)
            addDebugInfo(`Processed users: ${JSON.stringify(usersFromBatches, null, 2)}`)
          } else {
            addDebugInfo("📝 No batches found in database")
          }
        }
      } catch (batchesError) {
        addDebugInfo(`📝 Batches table not accessible: ${batchesError}`)
      }

      // 2. Load users from PROFILE table (if exists)
      try {
        addDebugInfo("Loading users from profile table...")
        const { data: profilesData, error: profilesError } = await supabase
          .from("profile")
          .select("id, name, email, role, created_at")
          .neq("id", "admin-tariq")
          .order("created_at", { ascending: false })

        if (profilesError) {
          addDebugInfo(`❌ Profile table error: ${profilesError.message}`)
        } else if (profilesData && profilesData.length > 0) {
          addDebugInfo(`✅ Loaded ${profilesData.length} profiles`)
          const usersFromProfiles = profilesData.map(profile => ({
            id: profile.id,
            name: profile.name || "Unknown User",
            email: profile.email || `${profile.id}@example.com`,
            role: (profile.role as "admin" | "batch_user") || "batch_user",
            created_at: profile.created_at,
            isOnline: Math.random() > 0.3,
            lastSeen: Math.random() > 0.5 ? "2m ago" : "Online",
            unreadCount: Math.floor(Math.random() * 3)
          }))
          allUsers.push(...usersFromProfiles)
        } else {
          addDebugInfo("📝 No profiles found in profile table")
        }
      } catch (profileError) {
        addDebugInfo(`📝 Profile table not accessible: ${profileError}`)
      }

      // 3. If no users found, create mock users for demo
      if (allUsers.length === 0) {
        addDebugInfo("📝 No users found in database, creating mock users for demo")
        const mockUsers: ChatUser[] = [
          {
            id: "batch-user-1",
            name: "John Farmer",
            email: "john@example.com",
            role: "batch_user",
            created_at: new Date().toISOString(),
            isOnline: true,
            lastSeen: "Online",
            unreadCount: 2
          },
          {
            id: "batch-user-2",
            name: "Sarah Farmer",
            email: "sarah@example.com",
            role: "batch_user",
            created_at: new Date().toISOString(),
            isOnline: false,
            lastSeen: "5m ago",
            unreadCount: 0
          },
          {
            id: "batch-user-3",
            name: "Mike Farmer",
            email: "mike@example.com",
            role: "batch_user",
            created_at: new Date().toISOString(),
            isOnline: true,
            lastSeen: "Online",
            unreadCount: 1
          },
          {
            id: "batch-user-4",
            name: "Lisa Farmer",
            email: "lisa@example.com",
            role: "batch_user",
            created_at: new Date().toISOString(),
            isOnline: false,
            lastSeen: "1h ago",
            unreadCount: 0
          }
        ]
        allUsers.push(...mockUsers)
        addDebugInfo(`✅ Created ${mockUsers.length} mock users`)
      }

      // 4. Remove duplicates and sort
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      ).sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1
        if (!a.isOnline && b.isOnline) return 1
        return a.name.localeCompare(b.name)
      })

      addDebugInfo(`✅ Total unique users: ${uniqueUsers.length}`)
      setUsers(uniqueUsers)

    } catch (error) {
      addDebugInfo(`❌ Error loading users: ${error}`)
      // Fallback to mock users
      const mockUsers: ChatUser[] = [
        {
          id: "batch-user-1",
          name: "John Farmer",
          email: "john@example.com",
          role: "batch_user",
          created_at: new Date().toISOString(),
          isOnline: true,
          lastSeen: "Online",
          unreadCount: 2
        },
        {
          id: "batch-user-2",
          name: "Sarah Farmer",
          email: "sarah@example.com",
          role: "batch_user",
          created_at: new Date().toISOString(),
          isOnline: false,
          lastSeen: "5m ago",
          unreadCount: 0
        }
      ]
      setUsers(mockUsers)
      addDebugInfo(`✅ Fallback: Created ${mockUsers.length} mock users`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🔍 User Loading Debug Test
          </h1>
          <p className="text-xl text-gray-600">
            Test user loading from batches and profile tables
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Test Controls
              </CardTitle>
              <CardDescription>
                Test user loading functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadUsers} disabled={isLoading} className="w-full">
                {isLoading ? "Loading..." : "Load Users"}
              </Button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {isLoading ? (
                    <Badge variant="secondary">Loading</Badge>
                  ) : users.length > 0 ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {users.length} Users Found
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No Users
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Loaded Users
              </CardTitle>
              <CardDescription>
                Users found in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No users loaded yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        {user.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Debug Information
            </CardTitle>
            <CardDescription>
              Detailed logging of the user loading process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500">No debug information yet. Click "Load Users" to start.</p>
              ) : (
                debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">{info}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
