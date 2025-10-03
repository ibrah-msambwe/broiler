"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, MessageSquare, Database, Users, Bell, BarChart3, FileText, Settings } from "lucide-react"
import { toast } from "sonner"

const SetupCommunicationPage = () => {
  const [status, setStatus] = useState<"idle" | "setting-up" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [setupStats, setSetupStats] = useState<any>(null)

  const setupCommunicationSystem = async () => {
    setStatus("setting-up")
    setErrorMessage(null)
    
    try {
      const response = await fetch('/api/migrations/setup-communication-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setSetupStats(data.stats)
        toast.success("Communication system set up successfully!")
      } else {
        setStatus("error")
        setErrorMessage(data.message || data.error || "Setup failed")
        setSetupStats(data.stats)
        toast.error(data.message || "Communication system setup failed")
      }
    } catch (error: any) {
      console.error("Error setting up communication system:", error)
      setStatus("error")
      setErrorMessage(error.message || "An unexpected error occurred")
      toast.error("Error setting up communication system")
    }
  }

  const features = [
    {
      icon: Users,
      title: "User Management",
      description: "Enhanced user profiles with online status, roles, and preferences"
    },
    {
      icon: MessageSquare,
      title: "Rich Messaging",
      description: "Text, images, files, voice messages with reactions and threading"
    },
    {
      icon: Database,
      title: "Conversations",
      description: "Direct messages, group chats, and broadcast messaging"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Real-time notifications with priority levels and user preferences"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Communication statistics and user activity tracking"
    },
    {
      icon: FileText,
      title: "Templates",
      description: "Message templates for quick replies and common responses"
    }
  ]

  const tables = [
    "communication_users",
    "user_communication_preferences", 
    "conversations",
    "group_conversation_participants",
    "messages",
    "message_reactions",
    "message_attachments",
    "user_notifications",
    "system_announcements",
    "communication_stats",
    "message_templates"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Communication System Setup
            </CardTitle>
            <p className="text-blue-100 mt-2 text-lg">
              Set up a comprehensive chart-based communication system for your broiler management app
            </p>
          </CardHeader>
        </Card>

        {/* Status Section */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                {status === "setting-up" && <Loader2 className="h-7 w-7 animate-spin text-blue-500" />}
                {status === "success" && <CheckCircle className="h-7 w-7 text-green-500" />}
                {status === "error" && <XCircle className="h-7 w-7 text-red-500" />}
                {status === "idle" && <Database className="h-7 w-7 text-gray-500" />}
                <div>
                  <p className="text-xl font-semibold text-gray-800">
                    {status === "idle" && "Ready to Setup"}
                    {status === "setting-up" && "Setting Up Communication System..."}
                    {status === "success" && "Setup Complete!"}
                    {status === "error" && "Setup Failed"}
                  </p>
                  {setupStats && (
                    <p className="text-sm text-gray-600">
                      {setupStats.successful} tables created successfully
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={setupCommunicationSystem}
                disabled={status === "setting-up"}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-base"
              >
                {status === "setting-up" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Setup Communication System"
                )}
              </Button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 mt-4">
                <XCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Error:</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3 mt-4">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Success!</p>
                  <p className="text-sm">Communication system has been set up successfully. You can now use the chart-based messaging system.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Tables */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Tables
            </CardTitle>
            <p className="text-gray-600 text-sm">The following tables will be created for the communication system</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tables.map((table, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <code className="text-sm font-mono text-gray-700">{table}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {status === "success" && (
          <Card className="shadow-xl border-0 bg-green-50/50 backdrop-blur-sm border-green-200">
            <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
              <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ol className="list-decimal list-inside space-y-2 text-green-700">
                <li>Verify all tables were created in your Supabase dashboard</li>
                <li>Check that Row Level Security (RLS) policies are active</li>
                <li>Test the communication system in your app</li>
                <li>Set up user data migration from existing tables</li>
                <li>Configure notification settings and preferences</li>
                <li>Test the chart-based messaging interface</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SetupCommunicationPage
