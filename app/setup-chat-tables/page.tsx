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
  Loader2, 
  MessageSquare,
  Users,
  Settings,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

const SetupChatTablesPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)

  const setupChatTables = async () => {
    setIsLoading(true)
    setSetupResult(null)

    try {
      console.log("🔄 Setting up chat tables...")

      // First, try to create the tables using the migration API
      const response = await fetch('/api/migrations/create-chart-messages-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log("📡 Setup API Response:", data)

      if (response.ok) {
        setSetupResult({
          success: true,
          message: "Chat tables setup completed successfully!",
          details: data
        })
        toast.success("✅ Chat tables created successfully!")
      } else {
        setSetupResult({
          success: false,
          error: data.error || "Failed to setup chat tables",
          details: data
        })
        toast.error(`❌ Setup failed: ${data.error}`)
      }

    } catch (error: any) {
      console.error("💥 Error setting up chat tables:", error)
      setSetupResult({
        success: false,
        error: error.message,
        details: null
      })
      toast.error(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testChatSystem = async () => {
    try {
      console.log("🧪 Testing chat system...")

      // Test users API
      const usersResponse = await fetch('/api/communication/users')
      const usersData = await usersResponse.json()

      // Test messages API
      const messagesResponse = await fetch('/api/chart/messages?userId=test-user&conversationId=test-conv')
      const messagesData = await messagesResponse.json()

      console.log("📡 Test Results:", { usersData, messagesData })

      if (usersResponse.ok && messagesResponse.ok) {
        toast.success("✅ Chat system is working!")
        return true
      } else {
        toast.error("❌ Chat system test failed")
        return false
      }

    } catch (error: any) {
      console.error("💥 Error testing chat system:", error)
      toast.error(`❌ Test failed: ${error.message}`)
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Database className="h-8 w-8" />
              Setup Chat Tables
            </CardTitle>
            <p className="text-blue-100 mt-2 text-lg">
              Initialize the communication system database tables
            </p>
          </CardHeader>
        </Card>

        {/* Setup Instructions */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              What This Setup Does
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Tables Created
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>conversations</strong> - Chat conversation management</li>
                    <li>• <strong>chart_messages</strong> - Individual messages storage</li>
                    <li>• <strong>Indexes</strong> - Performance optimization</li>
                    <li>• <strong>Triggers</strong> - Auto-update conversation info</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    Features Enabled
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Admin ↔ Batch User messaging</li>
                    <li>• Real-time conversation tracking</li>
                    <li>• Unread message counting</li>
                    <li>• Message history storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Controls */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Create Chat Tables</h4>
                <p className="text-sm text-gray-600">
                  This will create the necessary database tables for the communication system.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={testChatSystem}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Test System
                </Button>
                <Button
                  onClick={setupChatTables}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Setup Tables
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Results */}
        {setupResult && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className={`border-b ${setupResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} p-4`}>
              <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${setupResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {setupResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Setup Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {setupResult.success ? (
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {setupResult.message}
                    </AlertDescription>
                  </Alert>
                  
                  {setupResult.details && (
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-800">Tables Created:</h5>
                      <div className="flex flex-wrap gap-2">
                        {setupResult.details.tables_created?.map((table: string) => (
                          <Badge key={table} className="bg-green-100 text-green-800">
                            {table}
                          </Badge>
                        ))}
                      </div>
                      
                      <h5 className="font-semibold text-gray-800">Features Enabled:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {setupResult.details.features?.map((feature: string, index: number) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {setupResult.error}
                    </AlertDescription>
                  </Alert>
                  
                  {setupResult.details && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-2">Error Details:</h5>
                      <pre className="text-xs text-gray-600 overflow-auto">
                        {JSON.stringify(setupResult.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Setup Instructions */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50 backdrop-blur-sm border-yellow-200">
          <CardHeader className="bg-yellow-100/70 border-b border-yellow-200 p-6">
            <CardTitle className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Manual Setup (If Automatic Setup Fails)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-yellow-700">
              <p className="font-semibold">If the automatic setup fails, you can manually create the tables:</p>
              
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">SQL Commands:</h5>
                <pre className="text-xs text-yellow-800 overflow-auto whitespace-pre-wrap">
{`-- Run these commands in your Supabase SQL editor:

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID NOT NULL,
    participant_2_id UUID NOT NULL,
    participant_1_name VARCHAR(200) NOT NULL,
    participant_2_name VARCHAR(200) NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count_1 INTEGER DEFAULT 0,
    unread_count_2 INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id)
);

-- 2. Create chart_messages table
CREATE TABLE IF NOT EXISTS chart_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    sender_name VARCHAR(200) NOT NULL,
    receiver_name VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_conversation ON chart_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);`}
                </pre>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  <strong>Note:</strong> Make sure you have the necessary permissions to create tables in your Supabase database.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-200 p-4">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              After Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-blue-700">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">What to do next:</h4>
              <ul className="text-sm space-y-1">
                <li>• Go to Admin Dashboard → Communication to test messaging</li>
                <li>• Create conversations between Admin and Batch Users</li>
                <li>• Send test messages to verify the system works</li>
                <li>• Check that messages are stored and retrieved correctly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SetupChatTablesPage
