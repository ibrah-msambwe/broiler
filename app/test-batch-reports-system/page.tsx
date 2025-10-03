"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  Activity, 
  BarChart3, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Database
} from "lucide-react"

interface Batch {
  id: string
  name: string
  farmerName: string
  birdCount: number
  remainingBirds: number
  mortality: number
  mortalityRate: number
  healthStatus: string
  totalReports: number
  dataSource: string
}

export default function TestBatchReportsSystem() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Form for submitting test reports
  const [testReport, setTestReport] = useState({
    batchId: "",
    reportType: "mortality",
    mortalityCount: 0,
    cause: "",
    location: ""
  })

  // Load batches with real-time statistics
  const loadBatches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/batches-with-stats')
      const data = await response.json()
      
      if (data.batches) {
        setBatches(data.batches)
        toast.success(`Loaded ${data.batches.length} batches with real-time statistics`)
      } else {
        toast.error("Failed to load batches")
      }
    } catch (error) {
      console.error("Error loading batches:", error)
      toast.error("Failed to load batches")
    } finally {
      setLoading(false)
    }
  }

  // Submit test mortality report
  const submitTestReport = async () => {
    if (!testReport.batchId || !testReport.mortalityCount) {
      toast.error("Please select a batch and enter mortality count")
      return
    }

    try {
      const response = await fetch('/api/user/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: testReport.batchId,
          type: testReport.reportType,
          title: `Test ${testReport.reportType} Report`,
          content: `Test report with ${testReport.mortalityCount} deaths`,
          priority: "Normal",
          fields: {
            mortalityCount: testReport.mortalityCount,
            deathCount: testReport.mortalityCount, // Support both field names
            deathCause: testReport.cause,
            deathLocation: testReport.location
          },
          batchName: batches.find(b => b.id === testReport.batchId)?.name || "Unknown",
          farmerName: batches.find(b => b.id === testReport.batchId)?.farmerName || "Unknown"
        })
      })

      const data = await response.json()
      
      if (data.report) {
        toast.success("Test report submitted successfully!")
        setTestReport({ batchId: "", reportType: "mortality", mortalityCount: 0, cause: "", location: "" })
        // Reload batches to see updated statistics
        await loadBatches()
      } else {
        toast.error("Failed to submit report: " + data.error)
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      toast.error("Failed to submit report")
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadBatches()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🧪 Test Batch-Reports System</h1>
        <p className="text-muted-foreground">
          Test the complete relationship between reports and batches with real-time updates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="batches">Batch Statistics</TabsTrigger>
          <TabsTrigger value="test">Test Reports</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Relationship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Reports Table</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Batches Table</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Automatic Triggers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time Updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Automatic Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>1. User submits mortality report</div>
                  <div>2. Database trigger fires</div>
                  <div>3. Batch statistics recalculated</div>
                  <div>4. Dashboard updates automatically</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Real-time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Remaining birds count</div>
                  <div>• Total mortality from reports</div>
                  <div>• Mortality rate calculation</div>
                  <div>• Health status updates</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{batches.length}</div>
                  <div className="text-sm text-blue-600">Total Batches</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {batches.reduce((sum, b) => sum + b.remainingBirds, 0)}
                  </div>
                  <div className="text-sm text-green-600">Remaining Birds</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-800">
                    {batches.reduce((sum, b) => sum + b.mortality, 0)}
                  </div>
                  <div className="text-sm text-red-600">Total Mortality</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">
                    {batches.reduce((sum, b) => sum + b.totalReports, 0)}
                  </div>
                  <div className="text-sm text-purple-600">Total Reports</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Statistics Tab */}
        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-time Batch Statistics
                <Button onClick={loadBatches} disabled={loading} variant="outline" size="sm">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {batches.length > 0 ? (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div key={batch.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{batch.name}</div>
                          <div className="text-sm text-muted-foreground">{batch.farmerName}</div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={batch.healthStatus === 'Excellent' ? 'default' : 
                                       batch.healthStatus === 'Good' ? 'secondary' : 
                                       batch.healthStatus === 'Fair' ? 'outline' : 'destructive'}>
                            {batch.healthStatus}
                          </Badge>
                          <Badge variant="outline">{batch.dataSource}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{batch.birdCount}</div>
                          <div className="text-xs text-muted-foreground">Total Chicks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{batch.remainingBirds}</div>
                          <div className="text-xs text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{batch.mortality}</div>
                          <div className="text-xs text-muted-foreground">Mortality</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">{batch.mortalityRate}%</div>
                          <div className="text-xs text-muted-foreground">Mortality Rate</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        Processed {batch.totalReports} reports • Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No batch data available</p>
                  <p className="text-sm">Click "Refresh" to load data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Reports Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Submit Test Mortality Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchId">Select Batch</Label>
                  <Select value={testReport.batchId} onValueChange={(value) => setTestReport({...testReport, batchId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} - {batch.farmerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mortalityCount">Mortality Count</Label>
                  <Input
                    id="mortalityCount"
                    type="number"
                    value={testReport.mortalityCount}
                    onChange={(e) => setTestReport({...testReport, mortalityCount: parseInt(e.target.value) || 0})}
                    placeholder="Enter number of deaths"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cause">Cause of Death</Label>
                  <Input
                    id="cause"
                    value={testReport.cause}
                    onChange={(e) => setTestReport({...testReport, cause: e.target.value})}
                    placeholder="Enter cause of death"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={testReport.location}
                    onChange={(e) => setTestReport({...testReport, location: e.target.value})}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <Button onClick={submitTestReport} className="w-full" size="lg">
                Submit Test Mortality Report
              </Button>

              <div className="bg-muted p-4 rounded-lg">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                <span className="text-sm font-medium">What happens when you submit:</span>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Report is saved to the reports table</li>
                  <li>Database trigger automatically fires</li>
                  <li>Batch statistics are recalculated from all reports</li>
                  <li>Remaining birds count is updated</li>
                  <li>Mortality rate and health status are recalculated</li>
                  <li>Dashboard will show updated statistics immediately</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
