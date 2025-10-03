"use client"

import SimpleChartTest from "@/components/communication/simple-chart-test"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Bug } from "lucide-react"

const TestChartButtonsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Bug className="h-8 w-8" />
              Debug: Chart Buttons Test
            </CardTitle>
            <p className="text-red-100 mt-2 text-lg">
              Testing if the "Start Chat" buttons are visible and working
            </p>
          </CardHeader>
        </Card>

        {/* Test Component */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Simple Chart Test
            </CardTitle>
            <p className="text-gray-600 text-sm">
              This is a simplified version to test if buttons are showing up
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <SimpleChartTest />
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="shadow-lg border-0 bg-yellow-50/50 backdrop-blur-sm border-yellow-200">
          <CardHeader className="bg-yellow-100/70 border-b border-yellow-200 p-6">
            <CardTitle className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-yellow-700">
              <div>
                <h4 className="font-semibold mb-2">What to look for:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 4 user cards should be visible in a 2x2 grid</li>
                  <li>• Each card should have a blue "Start Chat" button at the bottom</li>
                  <li>• Buttons should be clickable and show an alert when clicked</li>
                  <li>• Cards should have different colored avatars (red, green, blue, purple)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">If buttons are NOT visible:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Check browser console for errors</li>
                  <li>• Make sure the component is rendering</li>
                  <li>• Check if CSS is loading properly</li>
                  <li>• Try refreshing the page</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Expected behavior:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Clicking a card should show an alert with user info</li>
                  <li>• Clicking "Start Chat" button should also show an alert</li>
                  <li>• Hover effects should work (cards should scale up slightly)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestChartButtonsPage
