"use client"

import { useState } from "react"
import ChartCommunicationSystem from "@/components/communication/chart-communication-system"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Settings, 
  ArrowRight, 
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"

const CommunicationDemoPage = () => {
  const [currentUserId] = useState("demo-user-123")
  const [currentUserName] = useState("Demo User")
  const [isAdmin] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  const demoSteps = [
    {
      title: "Welcome to Chart Communication",
      description: "This is a visual communication system where you can see all users in a chart format.",
      action: "Look at the user chart on the left side"
    },
    {
      title: "View User Information",
      description: "Each user card shows their name, role, online status, and a 'Start Chat' button.",
      action: "Notice the different colored avatars and role badges"
    },
    {
      title: "Start a Conversation",
      description: "Click on any user card or the 'Start Chat' button to begin messaging.",
      action: "Click on any user to start chatting"
    },
    {
      title: "Send Messages",
      description: "Type your message in the input box and press Enter or click Send.",
      action: "Try sending a message to the selected user"
    },
    {
      title: "Switch Views",
      description: "Toggle between Chart view and List view using the buttons in the header.",
      action: "Try switching between Chart and List views"
    },
    {
      title: "Filter Users",
      description: "Use the search bar and role/status filters to find specific users.",
      action: "Try searching for users or filtering by role"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Chart Communication System Demo
            </CardTitle>
            <p className="text-blue-100 mt-2 text-lg">
              Interactive demonstration of the chart-based communication interface
            </p>
          </CardHeader>
        </Card>

        {/* Demo Steps */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Demo Steps
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Follow these steps to learn how to use the communication system
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
                  disabled={demoStep === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoStep(Math.min(demoSteps.length - 1, demoStep + 1))}
                  disabled={demoStep === demoSteps.length - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDemoStep(0)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {demoStep + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {demoSteps[demoStep].title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {demoSteps[demoStep].description}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium">
                      <ArrowRight className="h-4 w-4 inline mr-1" />
                      {demoSteps[demoStep].action}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{demoStep + 1} of {demoSteps.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((demoStep + 1) / demoSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication System */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Live Communication Chart
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Try the interactive chart below - click on users to start conversations
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

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Visual Chart</h3>
              </div>
              <p className="text-gray-600 text-sm">
                See all users in an interactive chart with their roles, status, and online indicators.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Easy Chatting</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Click any user card or "Start Chat" button to instantly begin a conversation.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Smart Filters</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Search and filter users by name, role, or status to find exactly who you need.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CommunicationDemoPage
