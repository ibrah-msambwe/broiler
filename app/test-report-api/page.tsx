"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function TestReportAPI() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testReportsAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reports')
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        toast.success("Reports API working!")
      } else {
        setResult({ error: data.error, status: response.status })
        toast.error("Reports API error: " + data.error)
      }
    } catch (error) {
      setResult({ error: (error as Error).message })
      toast.error("Network error: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const testReportApproval = async () => {
    setLoading(true)
    try {
      // First get a report to approve
      const reportsResponse = await fetch('/api/admin/reports')
      const reportsData = await reportsResponse.json()
      
      if (reportsData.reports && reportsData.reports.length > 0) {
        const report = reportsData.reports[0]
        
        const response = await fetch('/api/admin/reports', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: report.id,
            status: 'Approved',
            admin_comment: 'Test approval'
          })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setResult({ approval: data })
          toast.success("Report approval working!")
        } else {
          setResult({ approvalError: data.error, status: response.status })
          toast.error("Report approval error: " + data.error)
        }
      } else {
        setResult({ error: "No reports found to test approval" })
        toast.error("No reports found to test approval")
      }
    } catch (error) {
      setResult({ error: (error as Error).message })
      toast.error("Network error: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🧪 Test Report API</h1>
        <p className="text-muted-foreground">Test the report approval and deletion functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Reports API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testReportsAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test GET /api/admin/reports"}
            </Button>
            
            <Button 
              onClick={testReportApproval} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Testing..." : "Test Report Approval"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
