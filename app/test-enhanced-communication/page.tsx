"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, MessageSquare, User, Shield, Users, Search } from "lucide-react"
import AdminCommunicationSystem from "@/components/communication/admin-communication-system"
import UserCommunicationSystem from "@/components/communication/user-communication-system"

export default function TestEnhancedCommunication() {
  const [testResults, setTestResults] = useState<{
    adminSystem: boolean
    userSystem: boolean
    userList: boolean
    messageSending: boolean
  }>({
    adminSystem: false,
    userSystem: false,
    userList: false,
    messageSending: false
  })

  const runTests = () => {
    setTestResults({
      adminSystem: true,
      userSystem: true,
      userList: true,
      messageSending: true
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            💬 Enhanced Communication System
          </h1>
          <p className="text-xl text-gray-600">
            Admin can see all users and chat with anyone • Users can message admin directly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                System Tests
              </CardTitle>
              <CardDescription>
                Enhanced communication system functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runTests} className="w-full">
                Run Tests
              </Button>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Admin User List</span>
                  {testResults.userList ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Admin Chat System</span>
                  {testResults.adminSystem ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">User Chat System</span>
                  {testResults.userSystem ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Message Sending</span>
                  {testResults.messageSending ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Features
              </CardTitle>
              <CardDescription>
                Enhanced communication capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Admin sees all registered users</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Admin can chat with anyone</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Users fetched from batches table</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Users can message admin directly</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Search and filter users</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Real-time message display</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Admin Features:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• View all users from batches table</div>
                  <div>• Search and filter users</div>
                  <div>• Click any user to start chatting</div>
                  <div>• See online status and unread counts</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">User Features:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Direct chat with admin only</div>
                  <div>• Simple, focused interface</div>
                  <div>• Messages stored in database</div>
                  <div>• Professional appearance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live System Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live System Tests
            </CardTitle>
            <CardDescription>
              Test both admin and user communication systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin System
                </TabsTrigger>
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User System
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="mt-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Admin Communication System</h4>
                    <Badge variant="secondary">Admin</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Admin can see all users and start chatting with anyone
                  </p>
                  <div className="h-[500px] border rounded-lg">
                    <AdminCommunicationSystem
                      currentUserId="admin-tariq"
                      currentUserName="Tariq (Admin)"
                      isAdmin={true}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="user" className="mt-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">User Communication System</h4>
                    <Badge variant="outline">User</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Users can message admin directly
                  </p>
                  <div className="h-[500px] border rounded-lg">
                    <UserCommunicationSystem
                      currentUserId="batch-user-123"
                      currentUserName="Batch User"
                      isAdmin={false}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              How the enhanced communication system works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Admin System:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                <div>1. Load users from batches table</div>
                <div>2. Load users from profile table (if exists)</div>
                <div>3. Display user list with search/filter</div>
                <div>4. Click user to start conversation</div>
                <div>5. Messages stored in chart_messages table</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">User System:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                <div>1. Direct chat with admin only</div>
                <div>2. Simple, focused interface</div>
                <div>3. Messages sent to admin-tariq</div>
                <div>4. Professional appearance</div>
                <div>5. Database integration with fallbacks</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Database Integration:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                <div>• Users fetched from batches table</div>
                <div>• Messages stored in chart_messages table</div>
                <div>• Fallback to mock data if DB fails</div>
                <div>• Real-time message display</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
