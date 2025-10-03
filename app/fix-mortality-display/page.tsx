"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ProcessingResult {
  batchId: string
  success: boolean
  error?: string
  originalBirdCount?: number
  totalMortality?: number
  remainingBirds?: number
  mortalityRate?: number
  reportsProcessed?: number
}

interface ProcessingResponse {
  success: boolean
  message: string
  totalReports: number
  totalProcessed: number
  results: ProcessingResult[]
}

export default function FixMortalityDisplay() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ProcessingResponse | null>(null)

  const processAllMortality = async () => {
    setIsProcessing(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/process-all-mortality', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)
        toast.success(`Successfully processed ${data.totalProcessed} mortality reports!`)
      } else {
        toast.error("Failed to process mortality reports: " + data.error)
      }
    } catch (error) {
      console.error("Error processing mortality:", error)
      toast.error("Failed to process mortality reports")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔧 Fix Mortality Display</h1>
        <p className="text-muted-foreground">
          Process all existing mortality reports to update batch statistics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Issue Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Problem:</strong> You have many mortality reports in the reports table, 
              but the dashboard still shows zero mortality and the original chick count. 
              This happens when reports are submitted but the batch table isn't updated.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What this tool does:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Finds all mortality reports in the database</li>
              <li>Groups them by batch ID</li>
              <li>Calculates total mortality for each batch</li>
              <li>Updates the batch table with correct statistics</li>
              <li>Calculates remaining birds and mortality rates</li>
              <li>Updates health status based on mortality rate</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Process All Mortality Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={processAllMortality} 
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Process All Mortality Reports
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{results.totalReports}</div>
                  <div className="text-sm text-blue-600">Total Reports</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{results.totalProcessed}</div>
                  <div className="text-sm text-green-600">Processed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">{results.results.length}</div>
                  <div className="text-sm text-purple-600">Batches Updated</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Batch Results:</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {results.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">Batch {result.batchId.slice(0, 8)}...</div>
                          <div className="text-sm text-muted-foreground">
                            {result.reportsProcessed} reports
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {result.success ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{result.remainingBirds}</span> remaining
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{result.totalMortality}</span> mortality
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{result.mortalityRate}%</span> rate
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Badge variant={results.totalProcessed === results.totalReports ? "default" : "destructive"}>
                  {results.totalProcessed === results.totalReports ? "All reports processed successfully!" : "Some reports failed to process"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">1. Click "Process All Mortality Reports" above</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">2. Wait for processing to complete</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">3. Go back to your dashboard to see updated statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">4. Future mortality reports will update automatically</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
