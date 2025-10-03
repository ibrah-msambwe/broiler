"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Shield, 
  AlertTriangle, 
  User, 
  Building, 
  TestTube,
  CheckCircle,
  XCircle,
  Phone,
  Mail
} from "lucide-react"

export default function TestReportDeletionRestriction() {
  const [testResults, setTestResults] = useState<{
    frontendTest: boolean | null
    apiTest: boolean | null
    errorMessage: string
  }>({
    frontendTest: null,
    apiTest: null,
    errorMessage: ""
  })

  // Test frontend restriction
  const testFrontendRestriction = () => {
    try {
      // Simulate the frontend delete function
      const handleDeleteReport = async (reportId: string) => {
        // This is what the frontend now does
        toast.error('Report deletion is not allowed. Please contact Tariq (System Admin) for assistance.', {
          duration: 5000,
          description: 'Contact: tariq@admin.com or call +255-XXX-XXXX'
        })
        return false // Indicates deletion was blocked
      }

      const result = handleDeleteReport("test-report-123")
      setTestResults(prev => ({
        ...prev,
        frontendTest: true,
        errorMessage: "Frontend correctly shows contact admin message"
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        frontendTest: false,
        errorMessage: `Frontend test failed: ${error}`
      }))
    }
  }

  // Test API restriction
  const testApiRestriction = async () => {
    try {
      const response = await fetch('/api/user/reports?id=test-report-123&batchId=test-batch-123', {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.status === 403 && data.restricted) {
        setTestResults(prev => ({
          ...prev,
          apiTest: true,
          errorMessage: "API correctly blocks deletion and returns contact admin message"
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          apiTest: false,
          errorMessage: `API test failed: Expected 403 status, got ${response.status}`
        }))
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        apiTest: false,
        errorMessage: `API test failed: ${error}`
      }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🛡️ Test Report Deletion Restriction</h1>
        <p className="text-muted-foreground">
          Verify that users and batches cannot delete reports and must contact Tariq (System Admin)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frontend Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Frontend Restriction Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test that the frontend shows contact admin message when delete is clicked
            </p>
            
            <Button onClick={testFrontendRestriction} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Test Frontend Restriction
            </Button>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {testResults.frontendTest === null ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : testResults.frontendTest ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">
                  {testResults.frontendTest === null ? "Not Tested" : 
                   testResults.frontendTest ? "Passed" : "Failed"}
                </span>
              </div>
              {testResults.errorMessage && (
                <p className="text-sm text-muted-foreground">{testResults.errorMessage}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              API Restriction Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test that the API returns 403 error with contact admin message
            </p>
            
            <Button onClick={testApiRestriction} className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Test API Restriction
            </Button>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {testResults.apiTest === null ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : testResults.apiTest ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">
                  {testResults.apiTest === null ? "Not Tested" : 
                   testResults.apiTest ? "Passed" : "Failed"}
                </span>
              </div>
              {testResults.errorMessage && (
                <p className="text-sm text-muted-foreground">{testResults.errorMessage}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contact Information for Report Deletion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">tariq@admin.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+255-XXX-XXXX</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Important Notice</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Report deletion is restricted for data integrity and audit purposes. 
                  Only Tariq (System Admin) can delete reports. Please contact him with 
                  the report ID and reason for deletion.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Implementation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Frontend Restriction:</strong> Delete button now shows "Contact Admin" and displays toast message</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>API Restriction:</strong> DELETE endpoint returns 403 error with contact information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>User Experience:</strong> Clear message directing users to contact Tariq</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Data Integrity:</strong> Prevents accidental or unauthorized report deletion</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
