"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageSquare, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Settings,
  Bug
} from "lucide-react"

interface DebugInfo {
  timestamp: string
  tables: Record<string, {
    exists: boolean
    error: string | null
    count: number
  }>
  usersApi: {
    status: number
    success: boolean
    userCount: number
    source: string
    error: string | null
  }
  recommendations: string[]
}

const DebugCommunicationPage = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const runDebug = async () => {
    setIsLoading(true)
    setActionResult(null)

    try {
      const response = await fetch('/api/communication/debug')
      const data = await response.json()

      if (response.ok) {
        setDebugInfo(data)
        setActionResult("Debug completed successfully")
      } else {
        setActionResult(`Debug failed: ${data.error}`)
      }
    } catch (err: any) {
      setActionResult(`Debug error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createSampleUsers = async () => {
    try {
      const response = await fetch('/api/communication/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_sample_users' })
      })

      const data = await response.json()

      if (response.ok) {
        setActionResult(`Sample users created: ${data.users?.length || 0} users`)
        runDebug() // Refresh debug info
      } else {
        setActionResult(`Failed to create sample users: ${data.error}`)
      }
    } catch (err: any) {
      setActionResult(`Error creating sample users: ${err.message}`)
    }
  }

  const testUsersApi = async () => {
    try {
      const response = await fetch('/api/communication/users')
      const data = await response.json()

      if (response.ok) {
        setActionResult(`Users API working: Found ${data.users?.length || 0} users from ${data.source || 'unknown'} source`)
      } else {
        setActionResult(`Users API failed: ${data.error}`)
      }
    } catch (err: any) {
      setActionResult(`Users API error: ${err.message}`)
    }
  }

  useEffect(() => {
    runDebug()
  }, [])

  const getTableStatusIcon = (table: any) => {
    if (!table.exists) return <XCircle className="h-5 w-5 text-red-500" />
    if (table.error) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getTableStatusColor = (table: any) => {
    if (!table.exists) return "bg-red-50 border-red-200"
    if (table.error) return "bg-yellow-50 border-yellow-200"
    return "bg-green-50 border-green-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Bug className="h-8 w-8" />
              Communication System Debug
            </CardTitle>
            <p className="text-red-100 mt-2 text-lg">
              Diagnose and fix communication system issues
            </p>
          </CardHeader>
        </Card>

        {/* Action Buttons */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Debug Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <Button
                onClick={runDebug}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Debug...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Debug
                  </>
                )}
              </Button>
              
              <Button
                onClick={createSampleUsers}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Create Sample Users
              </Button>

              <Button
                onClick={testUsersApi}
                variant="outline"
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Users API
              </Button>
            </div>

            {actionResult && (
              <Alert className={actionResult.includes("failed") || actionResult.includes("error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{actionResult}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Database Tables Status */}
        {debugInfo && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Tables Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(debugInfo.tables).map(([tableName, table]) => (
                  <Card key={tableName} className={`border-2 ${getTableStatusColor(table)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {getTableStatusIcon(table)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm capitalize">
                            {tableName.replace('_', ' ')}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {table.exists ? `${table.count} records` : "Not found"}
                          </p>
                          {table.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {table.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users API Status */}
        {debugInfo && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Users API Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {debugInfo.usersApi.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      API Status: {debugInfo.usersApi.status}
                    </span>
                  </div>
                  <Badge variant={debugInfo.usersApi.success ? "default" : "destructive"}>
                    {debugInfo.usersApi.success ? "Working" : "Failed"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Users Found:</span>
                    <p className="text-gray-600">{debugInfo.usersApi.userCount}</p>
                  </div>
                  <div>
                    <span className="font-medium">Source:</span>
                    <p className="text-gray-600">{debugInfo.usersApi.source}</p>
                  </div>
                  <div>
                    <span className="font-medium">Success:</span>
                    <p className="text-gray-600">{debugInfo.usersApi.success ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Error:</span>
                    <p className="text-gray-600">{debugInfo.usersApi.error || "None"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {debugInfo && debugInfo.recommendations.length > 0 && (
          <Card className="shadow-xl border-0 bg-yellow-50/50 backdrop-blur-sm border-yellow-200">
            <CardHeader className="bg-yellow-100/70 border-b border-yellow-200 p-6">
              <CardTitle className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {debugInfo.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-yellow-700">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Fixes */}
        <Card className="shadow-xl border-0 bg-green-50/50 backdrop-blur-sm border-green-200">
          <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Fixes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-green-700">
              <div>
                <h4 className="font-semibold mb-2">If no users are showing:</h4>
                <ol className="text-sm space-y-1 ml-4">
                  <li>1. Click "Create Sample Users" button above</li>
                  <li>2. Go to your communication chart</li>
                  <li>3. You should now see users with "Start Chat" buttons</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">If tables don't exist:</h4>
                <ol className="text-sm space-y-1 ml-4">
                  <li>1. Go to Supabase SQL Editor</li>
                  <li>2. Run the step-by-step-setup.sql script</li>
                  <li>3. Or use the setup-communication page</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">If still having issues:</h4>
                <ol className="text-sm space-y-1 ml-4">
                  <li>1. Check the browser console for errors</li>
                  <li>2. Verify your Supabase connection</li>
                  <li>3. Make sure all environment variables are set</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DebugCommunicationPage
