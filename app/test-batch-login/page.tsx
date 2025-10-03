"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestBatchLoginPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const tests = [
      {
        name: "Test API Endpoint",
        test: async () => {
          const response = await fetch('/api/test')
          return response.ok
        }
      },
      {
        name: "Create Test Batch",
        test: async () => {
          const response = await fetch('/api/test/create-test-batch', { method: 'POST' })
          const data = await response.json()
          return response.ok && data.success
        }
      },
      {
        name: "Test Mock Batch Login - Valid Credentials",
        test: async () => {
          const response = await fetch('/api/test/mock-batch-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test001', password: 'test123' })
          })
          const data = await response.json()
          return response.ok && data.user
        }
      },
      {
        name: "Test Mock Batch Login - Invalid Credentials",
        test: async () => {
          const response = await fetch('/api/test/mock-batch-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'invalid', password: 'invalid' })
          })
          return !response.ok && response.status === 401
        }
      },
      {
        name: "Test Real Batch Login - Valid Credentials",
        test: async () => {
          const response = await fetch('/api/auth/batch-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test001', password: 'test123' })
          })
          const data = await response.json()
          return response.ok && data.user
        }
      },
      {
        name: "Test Real Batch Login - Invalid Credentials",
        test: async () => {
          const response = await fetch('/api/auth/batch-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'invalid', password: 'invalid' })
          })
          return !response.ok && response.status === 401
        }
      }
    ]

    for (const test of tests) {
      try {
        const result = await test.test()
        setTestResults(prev => [...prev, {
          name: test.name,
          status: result ? 'success' : 'failure',
          timestamp: new Date().toLocaleTimeString()
        }])
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        }])
      }
    }
    
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Batch Login System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={runTests} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setTestResults([])}
                disabled={isRunning}
              >
                Clear Results
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                        className={result.status === 'success' ? 'bg-green-500' : 'bg-red-500'}
                      >
                        {result.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Test Credentials</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Mock Batch 1:</strong> test001 / test123</div>
                <div><strong>Mock Batch 2:</strong> demo001 / demo123</div>
                <div><strong>Real Batch:</strong> test001 / test123 (if created successfully)</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                <li>Click "Run All Tests" to test the batch login system</li>
                <li>If all tests pass, you can use the test credentials to login</li>
                <li>Go to <code className="bg-yellow-200 px-1 rounded">/batch-login</code> to test the login form</li>
                <li>Use the credentials above to login and verify the dashboard loads</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
