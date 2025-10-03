"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, MessageSquare, Database, Copy } from "lucide-react"

export default function SetupChatPage() {
  const [status, setStatus] = useState<"idle" | "checking" | "creating" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [tableExists, setTableExists] = useState(false)
  const [showSQL, setShowSQL] = useState(false)

  const sqlScript = `-- Run this in Supabase SQL Editor if automatic setup fails
CREATE TABLE IF NOT EXISTS chart_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    conversation_id UUID,
    batch_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chart_messages_batch ON chart_messages(batch_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_is_read ON chart_messages(is_read);

-- Disable RLS for now
ALTER TABLE chart_messages DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON chart_messages TO authenticated;
GRANT ALL ON chart_messages TO anon;
GRANT ALL ON chart_messages TO postgres;`

  const checkTables = async () => {
    setStatus("checking")
    setMessage("Checking if chat tables exist...")
    
    try {
      const response = await fetch("/api/setup/chat-system", {
        method: "GET"
      })
      
      const data = await response.json()
      
      if (data.tableExists) {
        setStatus("success")
        setTableExists(true)
        setMessage(`✅ Chat tables already exist! Message count: ${data.messageCount}`)
      } else {
        setStatus("idle")
        setTableExists(false)
        setMessage("⚠️ Chat tables not found. Click 'Create Tables' to set them up.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("❌ Error checking tables: " + (error as Error).message)
    }
  }

  const createTables = async () => {
    setStatus("creating")
    setMessage("Creating chat tables...")
    
    try {
      const response = await fetch("/api/setup/chat-system", {
        method: "POST"
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus("success")
        setTableExists(true)
        setMessage("✅ " + data.message)
      } else {
        setStatus("error")
        setMessage("❌ " + data.error)
        setShowSQL(true)
      }
    } catch (error) {
      setStatus("error")
      setMessage("❌ Error creating tables: " + (error as Error).message)
      setShowSQL(true)
    }
  }

  const copySQL = () => {
    navigator.clipboard.writeText(sqlScript)
    alert("SQL script copied! Paste it in your Supabase SQL Editor.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Chat System Setup</CardTitle>
              <p className="text-sm text-blue-100 mt-1">Initialize database tables for communication</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Status Message */}
          {message && (
            <Alert className={
              status === "success" ? "bg-green-50 border-green-200" :
              status === "error" ? "bg-red-50 border-red-200" :
              "bg-blue-50 border-blue-200"
            }>
              <AlertDescription className="flex items-center gap-2">
                {status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                {(status === "checking" || status === "creating") && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                <span className="text-sm">{message}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={checkTables}
              disabled={status === "checking" || status === "creating"}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {status === "checking" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Check Tables
                </>
              )}
            </Button>

            <Button
              onClick={createTables}
              disabled={status === "checking" || status === "creating" || tableExists}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {status === "creating" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Tables
                </>
              )}
            </Button>
          </div>

          {/* Success Actions */}
          {tableExists && status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🎉 All Set!</h3>
              <p className="text-sm text-green-700 mb-3">
                Your chat system is ready to use. You can now:
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.href = "/admin-dashboard"}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Go to Admin Dashboard
                </Button>
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  size="sm"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          )}

          {/* Manual SQL Instructions */}
          {showSQL && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Manual Setup Required</h3>
                <Button
                  onClick={copySQL}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy SQL
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Automatic setup failed. Please copy this SQL and run it in your Supabase SQL Editor:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto">
                <pre>{sqlScript}</pre>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <strong>Steps:</strong>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Click on "SQL Editor" in the left sidebar</li>
                  <li>Click "New Query"</li>
                  <li>Paste the SQL above</li>
                  <li>Click "Run" or press Ctrl+Enter</li>
                  <li>Come back here and click "Check Tables"</li>
                </ol>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ What this does</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Creates the <code className="bg-blue-100 px-1 rounded">chart_messages</code> table</li>
              <li>• Adds indexes for better performance</li>
              <li>• Sets up permissions for messaging</li>
              <li>• Enables real-time chat functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
