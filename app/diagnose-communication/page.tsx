"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react"

export default function DiagnoseCommunication() {
  const [isChecking, setIsChecking] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)

  const runDiagnostics = async () => {
    setIsChecking(true)
    setDiagnostics(null)

    try {
      const response = await fetch('/api/debug/check-messages-table')
      const data = await response.json()
      setDiagnostics(data)
    } catch (err: any) {
      setDiagnostics({
        error: err.message,
        overallStatus: "❌ DIAGNOSTIC FAILED"
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Communication System Diagnostics</h1>
          <p className="text-gray-600">Check what's wrong with the messaging system</p>
        </div>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Run Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDiagnostics} 
              disabled={isChecking}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Run Full Diagnostic Check
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {diagnostics && (
          <>
            {/* Overall Status */}
            <Alert className={
              diagnostics.overallStatus?.includes("PASSED") 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }>
              <AlertDescription className={
                diagnostics.overallStatus?.includes("PASSED") 
                  ? "text-green-800" 
                  : "text-red-800"
              }>
                <strong className="text-lg">{diagnostics.overallStatus}</strong>
                <p className="mt-2">{diagnostics.message}</p>
              </AlertDescription>
            </Alert>

            {/* Individual Checks */}
            {diagnostics.checks && (
              <Card>
                <CardHeader>
                  <CardTitle>Diagnostic Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diagnostics.checks.map((check: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {check.status === "PASSED" ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        <h3 className="font-semibold text-lg">{check.name}</h3>
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                          check.status === "PASSED" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {check.status}
                        </span>
                      </div>
                      {check.details && (
                        <p className="text-gray-600 text-sm mb-2">{check.details}</p>
                      )}
                      {check.count !== undefined && (
                        <p className="text-sm text-gray-600">Messages in table: {check.count}</p>
                      )}
                      {check.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                          <p className="text-red-800 text-sm font-mono">{check.error}</p>
                        </div>
                      )}
                      {check.hint && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                          <p className="text-yellow-800 text-sm">💡 {check.hint}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendation */}
            {diagnostics.recommendation && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Recommendation:</strong>
                  <p className="mt-2">{diagnostics.recommendation}</p>
                  {diagnostics.sqlScript && (
                    <p className="mt-2 font-mono text-sm bg-white p-2 rounded border border-orange-300">
                      File: {diagnostics.sqlScript}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Solution */}
            {diagnostics.issue === "RLS_POLICY_BLOCKING" && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">🚨 Issue Found: RLS Policy Blocking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-red-700">
                    Row Level Security (RLS) policies are preventing message insertion.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold mb-2">Quick Fix:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Open your Supabase Dashboard</li>
                      <li>Go to SQL Editor</li>
                      <li>Copy and paste the content from: <code className="bg-gray-100 px-2 py-1 rounded">fix-communication-table-complete.sql</code></li>
                      <li>Click "Run"</li>
                      <li>Come back here and run diagnostics again</li>
                    </ol>
                  </div>
                  <Button 
                    onClick={() => window.open('/setup-communication-table', '_blank')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Go to Setup Page
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/setup-communication-table'}
            variant="outline"
          >
            Setup Page
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin-dashboard'}
            variant="outline"
          >
            Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
