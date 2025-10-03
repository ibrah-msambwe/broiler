"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "farmer" | "user" | "batch_user"
  avatar?: string
  isOnline?: boolean
}

export default function SimpleChartTest() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock users for testing
  const mockUsers: User[] = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      isOnline: true
    },
    {
      id: "2", 
      name: "Farmer John",
      email: "farmer@example.com",
      role: "farmer",
      isOnline: true
    },
    {
      id: "3",
      name: "Batch User 1",
      email: "batch1@example.com", 
      role: "batch_user",
      isOnline: false
    },
    {
      id: "4",
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      isOnline: true
    }
  ]

  useEffect(() => {
    setUsers(mockUsers)
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500'
      case 'farmer': return 'bg-green-500'
      case 'user': return 'bg-blue-500'
      case 'batch_user': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const handleStartChat = (userId: string, userName: string) => {
    alert(`Starting chat with ${userName} (ID: ${userId})`)
  }

  return (
    <div className="h-[600px] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar - User Chart */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Chart</h3>
          
          {/* Instructions */}
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              💬 <strong>Click on any user card or "Start Chat" button to begin messaging</strong>
            </p>
          </div>
        </div>

        {/* User Chart */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {users.map((user) => (
              <Card
                key={user.id}
                className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-gray-200 hover:border-blue-300"
                onClick={() => handleStartChat(user.id, user.name)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className={`${getRoleColor(user.role)} text-white text-lg font-bold`}>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          {user.role.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-medium text-gray-600">
                          {user.isOnline ? 'online' : 'offline'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full">
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartChat(user.id, user.name)
                        }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Instructions */}
      <div className="w-1/2 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Test the Chart Communication</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">What you should see:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 4 user cards in a 2x2 grid</li>
                <li>• Each card has a "Start Chat" button</li>
                <li>• Different colored avatars for different roles</li>
                <li>• Green dots for online users</li>
              </ul>
            </div>
            
            <div className="bg-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Try this:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click on any user card</li>
                <li>• Or click the "Start Chat" button</li>
                <li>• You should see an alert with the user info</li>
              </ul>
            </div>

            <div className="bg-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Debug Info:</h4>
              <p className="text-sm text-green-700">
                Users loaded: {users.length}<br/>
                Component rendered: ✅<br/>
                Buttons should be visible: ✅
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
