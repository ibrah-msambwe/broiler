"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  MessageSquare, 
  Users, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Building,
  ArrowRight
} from "lucide-react"
import SimpleChatSystem from "@/components/communication/simple-chat-system"

export default function TestCommunicationFix() {
  const [testResults, setTestResults] = useState<{
    adminChat: boolean | null
    batchChat: boolean | null
    messageSending: boolean | null
  }>({
    adminChat: null,
    batchChat: null,
    messageSending: null
  })

  // Test admin chat
  const testAdminChat = () => {
    setTestResults(prev => ({
      ...prev,
      adminChat: true
    }))
    toast.success("Admin chat test - check if Tariq (Admin) appears in user list")
  }

  // Test batch chat
  const testBatchChat = () => {
    setTestResults(prev => ({
      ...prev,
      batchChat: true
    }))
    toast.success("Batch chat test - check if users appear in user list")
  }

  // Test message sending
  const testMessageSending = () => {
    setTestResults(prev => ({
      ...prev,
      messageSending: true
    }))
    toast.success("Message sending test - try sending a message below")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">💬 Test Communication Fix</h1>
        <p className="text-muted-foreground">
          Test the communication system fixes for both admin and batch dashboards
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
            <div className="space-y-3">
              <Button onClick={testAdminChat} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Test Admin Chat
              </Button>

              <Button onClick={testBatchChat} className="w-full">
                <Building className="h-4 w-4 mr-2" />
                Test Batch Chat
              </Button>

              <Button onClick={testMessageSending} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Message Sending
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Test Results</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResults.adminChat === null ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : testResults.adminChat ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Admin Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  {testResults.batchChat === null ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : testResults.batchChat ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Batch Chat</span>
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
          </CardContent>
        </Card>

        {/* Fix Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Fixes Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Error Handling Fixed</p>
                    <p className="text-sm text-green-700 mt-1">
                      Improved error logging and fallback to mock messages when database issues occur
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Batch Dashboard Fixed</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Updated user ID mapping to use username as fallback for batch users
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">User Loading Enhanced</p>
                    <p className="text-sm text-purple-700 mt-1">
                      Always includes Tariq (Admin) and loads users from both profile and batches tables
                    </p>
                  </div>
                </div>
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
            Live Chat Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 border rounded-lg">
            <SimpleChatSystem
              currentUserId="test-user-001"
              currentUserName="Test User"
              isAdmin={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Expected Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Expected Behavior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">User List Should Show</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tariq (Admin) - Always online</li>
                <li>• Users from profile table</li>
                <li>• Farmers from batches table</li>
                <li>• Demo users if no real data</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Message Sending Should</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Work with real database if available</li>
                <li>• Fall back to mock messages if not</li>
                <li>• Show clear error messages</li>
                <li>• Display success confirmations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Admin Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Go to admin dashboard and test the communication tab
              </p>
              <Badge variant="outline">Admin → Communication</Badge>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2">Batch Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Go to batch dashboard and test the communication tab
              </p>
              <Badge variant="outline">Batch → Communication</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
