"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Send, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

const TestMessageSendingPage = () => {
  const [testMessage, setTestMessage] = useState("Hello, this is a test message!")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testSendMessage = async () => {
    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/chart/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: "test-admin",
          receiverId: "test-farmer",
          senderName: "Test Admin",
          receiverName: "Test Farmer",
          message: testMessage,
          messageType: "text",
          isAdminMessage: true
        })
      })

      const data = await response.json()
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })

      if (response.ok) {
        toast.success("Message sent successfully!")
      } else {
        toast.error(`Failed to send message: ${data.error}`)
      }

    } catch (error: any) {
      setResult({
        status: 500,
        ok: false,
        error: error.message
      })
      toast.error(`Network error: ${error.message}`)
    } finally {
      setIsSending(false)
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
              Test Message Sending
            </CardTitle>
            <p className="text-green-100 mt-2 text-lg">
              Test the message sending API with correct parameters
            </p>
          </CardHeader>
        </Card>

        {/* Test Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Test Message
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter your test message..."
                  className="w-full"
                />
              </div>

              <Button
                onClick={testSendMessage}
                disabled={isSending || !testMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Message
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {result.ok ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Status Code:</span>
                    <p className="text-gray-600">{result.status}</p>
                  </div>
                  <div>
                    <span className="font-medium">Success:</span>
                    <p className="text-gray-600">{result.ok ? "Yes" : "No"}</p>
                  </div>
                </div>

                {result.data && (
                  <div>
                    <span className="font-medium">Response Data:</span>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {result.error && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Error:</strong> {result.error}
                    </AlertDescription>
                  </Alert>
                )}

                {result.data?.error && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <XCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>API Error:</strong> {result.data.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="shadow-xl border-0 bg-blue-50/50 backdrop-blur-sm border-blue-200">
          <CardHeader className="bg-blue-100/70 border-b border-blue-200 p-6">
            <CardTitle className="text-xl font-semibold text-blue-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              What This Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-blue-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Parameter names (camelCase vs snake_case)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>API connectivity and response handling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Error handling for missing tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span>Message sending functionality</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestMessageSendingPage
