"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageSquare, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Building,
  User
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "batch_user"
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
  status?: "available" | "busy" | "away" | "offline"
}

const TestSimpleCommunicationPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    testCommunicationSystem()
  }, [])

  const testCommunicationSystem = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      console.log("🔄 Testing simplified communication system...")

      // Test 1: Load users
      const usersResponse = await fetch('/api/communication/users')
      const usersData = await usersResponse.json()
      
      console.log("📡 Users API Response:", usersData)

      if (usersResponse.ok) {
        setUsers(usersData.users || [])
        
        // Test 2: Check if only admin and batch users are returned
        const roles = usersData.users?.map((u: User) => u.role) || []
        const uniqueRoles = [...new Set(roles)]
        const hasFarmers = roles.includes('farmer')
        const hasOnlyAllowedRoles = uniqueRoles.every(role => role === 'admin' || role === 'batch_user')

        setTestResult({
          success: true,
          userCount: usersData.users?.length || 0,
          roles: uniqueRoles,
          hasFarmers,
          hasOnlyAllowedRoles,
          users: usersData.users || []
        })

        if (hasFarmers) {
          toast.error("❌ Farmers still found in communication system!")
        } else if (hasOnlyAllowedRoles) {
          toast.success("✅ Communication system simplified successfully!")
        } else {
          toast.warning("⚠️ Unexpected roles found in communication system")
        }
      } else {
        setTestResult({
          success: false,
          error: usersData.error,
          userCount: 0,
          roles: [],
          hasFarmers: false,
          hasOnlyAllowedRoles: false,
          users: []
        })
        toast.error(`❌ Failed to load users: ${usersData.error}`)
      }

    } catch (error: any) {
      console.error("💥 Error testing communication system:", error)
      setTestResult({
        success: false,
        error: error.message,
        userCount: 0,
        roles: [],
        hasFarmers: false,
        hasOnlyAllowedRoles: false,
        users: []
      })
      toast.error(`❌ Error testing communication system: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500'
      case 'batch_user': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'batch_user': return 'Batch Manager'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Test Simplified Communication System
            </CardTitle>
            <p className="text-green-100 mt-2 text-lg">
              Verify that only Admin and Batch Users can communicate (no farmers)
            </p>
          </CardHeader>
        </Card>

        {/* Test Controls */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Test
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Communication System Test</h4>
                <p className="text-sm text-gray-600">
                  This test verifies that the communication system only includes Admin and Batch Users.
                </p>
              </div>
              <Button
                onClick={testCommunicationSystem}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Test System
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results Summary */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{testResult.userCount}</div>
                    <div className="text-xs text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{testResult.roles.length}</div>
                    <div className="text-xs text-gray-600">Unique Roles</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Has Farmers:</span>
                    <Badge variant={testResult.hasFarmers ? "destructive" : "default"}>
                      {testResult.hasFarmers ? "❌ Yes" : "✅ No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Only Allowed Roles:</span>
                    <Badge variant={testResult.hasOnlyAllowedRoles ? "default" : "destructive"}>
                      {testResult.hasOnlyAllowedRoles ? "✅ Yes" : "❌ No"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-sm text-gray-800 mb-2">Found Roles:</h5>
                  <div className="flex flex-wrap gap-2">
                    {testResult.roles.map((role: string) => (
                      <Badge key={role} className={`${getRoleColor(role)} text-white`}>
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {testResult.error && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {testResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Users ({testResult.userCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {testResult.users.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {testResult.users.map((user: User) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getRoleColor(user.role)} text-white text-xs`}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-sm border-green-200">
          <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              What This Test Verifies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-green-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>No Farmers:</strong> The communication system should not include any farmers</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Only Admin & Batch Users:</strong> Only admin and batch_user roles should be present</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Clear Communication:</strong> Admin can chat with batch managers and vice versa</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Simplified Interface:</strong> Clean, focused communication between relevant parties only</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-200 p-4">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Building className="h-5 w-5" />
              How to Use the Simplified Communication System
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">For Admins:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Go to Admin Dashboard → Communication</li>
                  <li>• Select any Batch Manager to start chatting</li>
                  <li>• Send messages and receive replies</li>
                  <li>• Monitor all batch communications</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">For Batch Users:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Go to Batch Dashboard → Communication</li>
                  <li>• Select Admin to start chatting</li>
                  <li>• Send reports and ask questions</li>
                  <li>• Receive guidance from admin</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestSimpleCommunicationPage
