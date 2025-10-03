"use client"

import { useState } from "react"
import ChartCommunicationSystem from "@/components/communication/chart-communication-system"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Settings } from "lucide-react"

const TestCommunicationPage = () => {
  const [currentUserId] = useState("test-user-123")
  const [currentUserName] = useState("Test User")
  const [isAdmin] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Chart-Based Communication System Test
            </CardTitle>
            <p className="text-blue-100 mt-2 text-lg">
              Test the new chart-based communication interface
            </p>
          </CardHeader>
        </Card>

        {/* Communication System */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Communication Chart
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Interactive chart showing all users with their roles and online status
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ChartCommunicationSystem 
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isAdmin={isAdmin}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="shadow-lg border-0 bg-green-50/50 backdrop-blur-sm border-green-200">
          <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-green-700">
              <div>
                <h4 className="font-semibold mb-2">1. View User Chart</h4>
                <p className="text-sm">The left panel shows all users in a chart format with their roles (admin, farmer, user) and online status.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Switch Views</h4>
                <p className="text-sm">Toggle between "Chart" and "List" view using the buttons in the header.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Filter Users</h4>
                <p className="text-sm">Use the search bar and role/status filters to find specific users.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Start Conversations</h4>
                <p className="text-sm">Click on any user card to start a conversation with them.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5. Send Messages</h4>
                <p className="text-sm">Type messages in the chat area and press Enter or click Send.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestCommunicationPage
