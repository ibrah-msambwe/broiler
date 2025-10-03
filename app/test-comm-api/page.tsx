"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, RefreshCw, CheckCircle, XCircle } from "lucide-react"

const TestCommApiPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setIsLoading(true)
    setApiStatus("loading")
    setError(null)

    try {
      const response = await fetch('/api/communication/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setApiStatus("success")
        console.log("API Response:", data)
      } else {
        setApiStatus("error")
        setError(data.error || "API Error")
      }
    } catch (err: any) {
      setApiStatus("error")
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const populateSampleUsers = async () => {
    try {
      const response = await fetch('/api/communication/populate-sample-users', {
        method: 'POST'
      })
      const data = await response.json()

      if (response.ok) {
        alert("Sample users created successfully!")
        testApi() // Refresh the user list
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  useEffect(() => {
    testApi()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Communication API Test
            </CardTitle>
            <p className="text-green-100 mt-2 text-lg">
              Test the communication users API and see the results
            </p>
          </CardHeader>
        </Card>

        {/* API Test Controls */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              API Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={testApi}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test API
                  </>
                )}
              </Button>
              
              <Button
                onClick={populateSampleUsers}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Add Sample Users
              </Button>
            </div>

            {/* API Status */}
            <div className="flex items-center gap-2 mb-4">
              {apiStatus === "loading" && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}
              {apiStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {apiStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
              <span className="font-medium">
                {apiStatus === "idle" && "Ready to test"}
                {apiStatus === "loading" && "Testing API..."}
                {apiStatus === "success" && `Found ${users.length} users`}
                {apiStatus === "error" && "API Error"}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Display */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users Found ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found. Try adding sample users or check the API.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, index) => (
                  <Card key={user.id || index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold`}>
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {user.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email || "No email"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {user.role?.toUpperCase() || "USER"}
                            </Badge>
                            {user.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="shadow-lg border-0 bg-yellow-50/50 backdrop-blur-sm border-yellow-200">
          <CardHeader className="bg-yellow-100/70 border-b border-yellow-200 p-6">
            <CardTitle className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-yellow-700">
              <div>
                <h4 className="font-semibold mb-2">API Status:</h4>
                <p className="text-sm">Status: {apiStatus}</p>
                <p className="text-sm">Users found: {users.length}</p>
                <p className="text-sm">Error: {error || "None"}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ul className="text-sm space-y-1">
                  <li>• If you see users above, the API is working</li>
                  <li>• If no users, click "Add Sample Users" button</li>
                  <li>• Then go back to the communication chart</li>
                  <li>• The chart should now show users with "Start Chat" buttons</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestCommApiPage
