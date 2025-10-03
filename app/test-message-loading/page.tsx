"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, CheckCircle, XCircle, Loader } from "lucide-react"
import { toast } from "sonner"

const TestMessageLoadingPage = () => {
  const [userId, setUserId] = useState("test-user")
  const [conversationId, setConversationId] = useState("test-conversation")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testLoadMessages = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/chart/messages?userId=${userId}&conversationId=${conversationId}`)
      const data = await response.json()
      
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })

      if (response.ok) {
        toast.success(`Loaded ${data.messages?.length || 0} messages successfully!`)
      } else {
        toast.error(`Failed to load messages: ${data.error}`)
      }

    } catch (error: any) {
      setResult({
        status: 500,
        ok: false,
        error: error.message
      })
      toast.error(`Network error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Test Message Loading
            </CardTitle>
            <p className="text-purple-100 mt-2 text-lg">
              Test the message loading API with userId and conversationId parameters
            </p>
          </CardHeader>
        </Card>

        {/* Test Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Loader className="h-5 w-5" />
              Load Test Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversation ID
                  </label>
                  <Input
                    value={conversationId}
                    onChange={(e) => setConversationId(e.target.value)}
                    placeholder="Enter conversation ID..."
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={testLoadMessages}
                disabled={isLoading || !userId.trim() || !conversationId.trim()}
                className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Load Messages
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

                {result.data?.message && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Info:</strong> {result.data.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="shadow-xl border-0 bg-green-50/50 backdrop-blur-sm border-green-200">
          <CardHeader className="bg-green-100/70 border-b border-green-200 p-6">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              What This Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>userId parameter is properly included in API call</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>conversationId parameter is properly included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>API returns proper response for missing tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>No more "userId required" errors</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestMessageLoadingPage
