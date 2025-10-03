"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Users,
  Settings
} from "lucide-react"
import { toast } from "sonner"

const SetupChatSimplePage = () => {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupStatus, setSetupStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [sqlScript, setSqlScript] = useState("")
  const [tableStatus, setTableStatus] = useState<any>(null)

  const setupChatTables = async () => {
    setIsSettingUp(true)
    setSetupStatus("idle")
    setErrorMessage("")

    try {
      // Check chat tables status
      const response = await fetch('/api/setup-chat-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        setSetupStatus("success")
        setTableStatus(data.tables)
        toast.success("Chat tables are working! You can now start conversations.")
      } else {
        setSetupStatus("error")
        setErrorMessage(data.message || "Chat tables need to be set up")
        setSqlScript(data.sqlScript || "")
        setTableStatus(data.tables)
        toast.warning("Chat tables need to be set up. Please follow the instructions below.")
      }

    } catch (error: any) {
      setSetupStatus("error")
      setErrorMessage(`Setup error: ${error.message}`)
      toast.error("Setup failed")
    } finally {
      setIsSettingUp(false)
    }
  }

  const testCommunication = async () => {
    try {
      const response = await fetch('/api/communication/users')
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`Found ${data.users?.length || 0} users for communication`)
      } else {
        toast.error("Failed to load users")
      }
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Simple Chat Setup
            </CardTitle>
            <p className="text-green-100 mt-2 text-lg">
              Quick setup for the communication system
            </p>
          </CardHeader>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">Users</h3>
                  <p className="text-sm text-gray-600">From batches & profiles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">Database</h3>
                  <p className="text-sm text-gray-600">Tables setup needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">Chat</h3>
                  <p className="text-sm text-gray-600">Ready to use</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Section */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup Chat Tables
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                The communication system needs two database tables to work properly. 
                Click the button below to test if they exist, or follow the manual setup.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={setupChatTables}
                  disabled={isSettingUp}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isSettingUp ? (
                    <>
                      <Database className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Test Chat Tables
                    </>
                  )}
                </Button>

                <Button
                  onClick={testCommunication}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Test Users
                </Button>
              </div>

              {/* Status Display */}
              {setupStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Success!</strong> Chat tables are working. You can now start conversations in the communication chart.
                  </AlertDescription>
                </Alert>
              )}

              {setupStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Setup Required:</strong> {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Setup Instructions */}
        <Card className="shadow-xl border-0 bg-yellow-50/50 backdrop-blur-sm border-yellow-200">
          <CardHeader className="bg-yellow-100/70 border-b border-yellow-200 p-6">
            <CardTitle className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Manual Setup (If Needed)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-yellow-700">
              <p>If the automatic test fails, you need to create the chat tables manually:</p>
              
              <div className="bg-white rounded-lg p-4 border border-yellow-300">
                <h4 className="font-semibold mb-2">Step 1: Go to Supabase SQL Editor</h4>
                <p className="text-sm mb-3">Open your Supabase dashboard and go to the SQL Editor</p>
                
                <h4 className="font-semibold mb-2">Step 2: Run this SQL script:</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                  <pre>{sqlScript || `-- Click "Test Chat Tables" first to get the SQL script`}</pre>
                </div>
                
                <h4 className="font-semibold mb-2 mt-4">Step 3: Test Again</h4>
                <p className="text-sm">Come back here and click "Test Chat Tables" again</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-xl border-0 bg-green-50/50 backdrop-blur-sm border-green-200">
          <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-green-700">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">1</Badge>
                <span>Set up the chat tables (using the SQL script above)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">2</Badge>
                <span>Go to your communication chart</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">3</Badge>
                <span>Click "Start Chat" on any user to begin messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">4</Badge>
                <span>Enjoy your new communication system!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SetupChatSimplePage
