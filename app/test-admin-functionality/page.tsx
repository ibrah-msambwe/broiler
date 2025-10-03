"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function TestAdminFunctionality() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testServerConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (response.ok) {
        setResult({ health: data, status: "Server is running" })
        toast.success("Server is running!")
      } else {
        setResult({ error: data.error, status: response.status })
        toast.error("Server error: " + data.error)
      }
    } catch (error) {
      setResult({ error: (error as Error).message, status: "Connection failed" })
      toast.error("Connection failed: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const testReportsAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reports-mock')
      const data = await response.json()
      
      if (response.ok) {
        setResult({ reports: data, status: "Reports API working" })
        toast.success("Reports API working!")
      } else {
        setResult({ error: data.error, status: response.status })
        toast.error("Reports API error: " + data.error)
      }
    } catch (error) {
      setResult({ error: (error as Error).message, status: "API failed" })
      toast.error("API failed: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const testReportApproval = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reports-mock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: "1",
          status: 'Approved',
          admin_comment: 'Test approval'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({ approval: data, status: "Approval working" })
        toast.success("Report approval working!")
      } else {
        setResult({ error: data.error, status: response.status })
        toast.error("Approval error: " + data.error)
      }
    } catch (error) {
      setResult({ error: (error as Error).message, status: "Approval failed" })
      toast.error("Approval failed: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const testReportDeletion = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reports-mock?id=2', {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({ deletion: data, status: "Deletion working" })
        toast.success("Report deletion working!")
      } else {
        setResult({ error: data.error, status: response.status })
        toast.error("Deletion error: " + data.error)
      }
    } catch (error) {
      setResult({ error: (error as Error).message, status: "Deletion failed" })
      toast.error("Deletion failed: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🧪 Test Admin Functionality</h1>
        <p className="text-muted-foreground">Test report approval and deletion functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Functions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testServerConnection} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test Server Connection"}
            </Button>
            
            <Button 
              onClick={testReportsAPI} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Testing..." : "Test Reports API"}
            </Button>

            <Button 
              onClick={testReportApproval} 
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? "Testing..." : "Test Report Approval"}
            </Button>

            <Button 
              onClick={testReportDeletion} 
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? "Testing..." : "Test Report Deletion"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>✅ <strong>Report Approval:</strong> Fixed API endpoint with PUT method</div>
            <div>✅ <strong>Delete Confirmation:</strong> Added confirmation dialogs for all deletions</div>
            <div>✅ <strong>Error Handling:</strong> Improved error messages and logging</div>
            <div>✅ <strong>Mock API:</strong> Created working mock API for testing</div>
            <div>🔄 <strong>Database Connection:</strong> May need Supabase configuration check</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
