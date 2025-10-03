"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"

export default function SetupCommunicationTable() {
  const [isChecking, setIsChecking] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [messageCount, setMessageCount] = useState<number>(0)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const checkTable = async () => {
    setIsChecking(true)
    setError("")

    try {
      const response = await fetch('/api/setup/chat-table')
      const data = await response.json()

      if (data.tableExists) {
        setTableExists(true)
        setMessageCount(data.messageCount || 0)
        toast.success("Table exists and is ready!")
      } else {
        setTableExists(false)
        setError(data.error || "Table does not exist")
        toast.error("Table does not exist")
      }
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to check table")
    } finally {
      setIsChecking(false)
    }
  }

  const createTable = async () => {
    setIsCreating(true)
    setError("")

    try {
      const response = await fetch('/api/setup/chat-table', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setTableExists(true)
        toast.success("Table created successfully!")
        // Check again to get the count
        await checkTable()
      } else {
        setError(data.error || "Failed to create table")
        toast.error("Failed to create table")
      }
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to create table")
    } finally {
      setIsCreating(false)
    }
  }

  const sqlScript = `-- Run this in your Supabase SQL Editor
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

CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    toast.success("SQL script copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Communication System Setup</h1>
          <p className="text-gray-600">Set up the chat_messages table for the messaging system</p>
        </div>

        {/* Status Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              Table Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Check if the chart_messages table exists</p>
                {tableExists !== null && (
                  <div className="flex items-center gap-2">
                    {tableExists ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-700 font-medium">
                          Table exists with {messageCount} messages
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-700 font-medium">Table does not exist</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={checkTable} 
                disabled={isChecking}
                variant="outline"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Status"
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Create Table Card */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Option 1: Automatic Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Click the button below to automatically create the chart_messages table.
            </p>
            <Button 
              onClick={createTable} 
              disabled={isCreating || tableExists === true}
              className="bg-blue-600 hover:bg-blue-700 w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Table...
                </>
              ) : tableExists ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Table Already Exists
                </>
              ) : (
                "Create Table Automatically"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Setup Card */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Option 2: Manual Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              If automatic setup doesn't work, copy the SQL script below and run it in your Supabase SQL Editor:
            </p>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {sqlScript}
              </pre>
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2"
                size="sm"
                variant="secondary"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy SQL
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Go to your Supabase Dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Paste the SQL script above</li>
                <li>Click "Run" to execute</li>
                <li>Return here and click "Check Status" to verify</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {tableExists && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Success!</strong> Your communication system is ready to use. 
              You can now go to the Admin Dashboard → Communication tab to start chatting with batch users.
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/admin-dashboard'}
            variant="outline"
          >
            Go to Admin Dashboard
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
