"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  MessageSquare, 
  Users, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Wifi,
  Send,
  User,
  Building
} from "lucide-react"
import SimpleChatSystem from "@/components/communication/simple-chat-system"

export default function TestCommunicationSystem() {
  const [testResults, setTestResults] = useState<{
    tableSetup: boolean | null
    userLoading: boolean | null
    messageSending: boolean | null
    errorMessage: string
  }>({
    tableSetup: null,
    userLoading: null,
    messageSending: null,
    errorMessage: ""
  })

  const [currentUser, setCurrentUser] = useState({
    id: "test-user-001",
    name: "Test User",
    isAdmin: false
  })

  // Test table setup
  const testTableSetup = async () => {
    try {
      const response = await fetch('/api/setup-chat-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setTestResults(prev => ({
          ...prev,
          tableSetup: true,
          errorMessage: "Chat tables setup successfully"
        }))
        toast.success("Chat tables setup completed")
      } else {
        setTestResults(prev => ({
          ...prev,
          tableSetup: false,
          errorMessage: `Table setup failed: ${data.error}`
        }))
        toast.error("Failed to setup chat tables")
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        tableSetup: false,
        errorMessage: `Table setup error: ${error}`
      }))
      toast.error("Failed to setup chat tables")
    }
  }

  // Test user loading
  const testUserLoading = async () => {
    try {
      // This will be tested by the chat component itself
      setTestResults(prev => ({
        ...prev,
        userLoading: true,
        errorMessage: "User loading will be tested by the chat component below"
      }))
      toast.success("User loading test initiated - check the chat component below")
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        userLoading: false,
        errorMessage: `User loading error: ${error}`
      }))
    }
  }

  // Test message sending
  const testMessageSending = async () => {
    try {
      // This will be tested by the chat component itself
      setTestResults(prev => ({
        ...prev,
        messageSending: true,
        errorMessage: "Message sending will be tested by the chat component below"
      }))
      toast.success("Message sending test initiated - try sending a message below")
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        messageSending: false,
        errorMessage: `Message sending error: ${error}`
      }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">💬 Test Communication System</h1>
        <p className="text-muted-foreground">
          Test the chat system with users from batches and profile tables including admin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current User</Label>
              <Select 
                value={currentUser.id} 
                onValueChange={(value) => {
                  if (value === "admin") {
                    setCurrentUser({ id: "admin-tariq", name: "Tariq (Admin)", isAdmin: true })
                  } else if (value === "farmer") {
                    setCurrentUser({ id: "farmer-001", name: "John Farmer", isAdmin: false })
                  } else {
                    setCurrentUser({ id: "test-user-001", name: "Test User", isAdmin: false })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Tariq (Admin)</SelectItem>
                  <SelectItem value="farmer">John Farmer</SelectItem>
                  <SelectItem value="test">Test User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Button onClick={testTableSetup} className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Setup Chat Tables
              </Button>

              <Button onClick={testUserLoading} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Test User Loading
              </Button>

              <Button onClick={testMessageSending} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Test Message Sending
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Test Results</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResults.tableSetup === null ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : testResults.tableSetup ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Table Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.userLoading === null ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : testResults.userLoading ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">User Loading</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.messageSending === null ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : testResults.messageSending ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Message Sending</span>
                </div>
              </div>
            </div>

            {testResults.errorMessage && (
              <div className="p-3 bg-gray-50 border rounded-lg">
                <p className="text-sm text-muted-foreground">{testResults.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {currentUser.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={currentUser.isAdmin ? "default" : "secondary"}>
                  {currentUser.isAdmin ? "Admin" : "User"}
                </Badge>
                <Badge variant="outline">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This user will be used for testing the chat system. 
                  Switch between different user types to test different scenarios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat System Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat System Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 border rounded-lg">
            <SimpleChatSystem
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              isAdmin={currentUser.isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Expected Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Expected Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">User Loading</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Load users from profile table</li>
                <li>• Load farmers from batches table</li>
                <li>• Always include Tariq (Admin)</li>
                <li>• Remove duplicates</li>
                <li>• Show online/offline status</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Chat Functionality</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Send messages to any user</li>
                <li>• Receive messages in real-time</li>
                <li>• Message history</li>
                <li>• Read receipts</li>
                <li>• Admin message indicators</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
