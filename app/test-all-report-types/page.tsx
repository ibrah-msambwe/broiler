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
  Database,
  TestTube
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

export default function TestAllReportTypes() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Form for submitting test reports
  const [testReport, setTestReport] = useState({
    batchId: "",
    reportType: "mortality",
    // Mortality fields
    mortalityCount: 0,
    cause: "",
    location: "",
    // Feed fields
    feedAmount: 0,
    feedType: "",
    // Health fields
    temperature: 0,
    humidity: 0,
    symptoms: "",
    // Vaccination fields
    vaccinationCount: 0,
    vaccineName: ""
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

  // Submit test report
  const submitTestReport = async () => {
    if (!testReport.batchId) {
      toast.error("Please select a batch")
      return
    }

    try {
      const reportData = {
        batchId: testReport.batchId,
        type: testReport.reportType,
        title: `Test ${testReport.reportType} Report`,
        content: `Test ${testReport.reportType} report submitted`,
        priority: "Normal",
        fields: {}
      }

      // Add fields based on report type
      switch (testReport.reportType) {
        case "mortality":
          if (!testReport.mortalityCount) {
            toast.error("Please enter mortality count")
            return
          }
          reportData.fields = {
            mortalityCount: testReport.mortalityCount,
            deathCount: testReport.mortalityCount,
            death_count: testReport.mortalityCount,
            deathCause: testReport.cause,
            cause_of_death: testReport.cause,
            deathLocation: testReport.location,
            location: testReport.location
          }
          break
        case "feed":
          if (!testReport.feedAmount) {
            toast.error("Please enter feed amount")
            return
          }
          reportData.fields = {
            feedAmount: testReport.feedAmount,
            feedUsed: testReport.feedAmount,
            feed_amount: testReport.feedAmount,
            feedType: testReport.feedType,
            feed_type: testReport.feedType
          }
          break
        case "health":
          if (!testReport.temperature && !testReport.humidity) {
            toast.error("Please enter temperature or humidity")
            return
          }
          reportData.fields = {
            temperature: testReport.temperature,
            humidity: testReport.humidity,
            symptoms: testReport.symptoms,
            overallHealth: "Good",
            health_status: "Good"
          }
          break
        case "vaccination":
          if (!testReport.vaccinationCount) {
            toast.error("Please enter vaccination count")
            return
          }
          reportData.fields = {
            vaccinationCount: testReport.vaccinationCount,
            vaccinations: testReport.vaccinationCount,
            vaccineName: testReport.vaccineName,
            vaccine_name: testReport.vaccineName
          }
          break
        case "daily":
          reportData.fields = {
            mortalityCount: testReport.mortalityCount || 0,
            deathCount: testReport.mortalityCount || 0,
            death_count: testReport.mortalityCount || 0,
            feedAmount: testReport.feedAmount || 0,
            feedUsed: testReport.feedAmount || 0,
            feed_amount: testReport.feedAmount || 0,
            temperature: testReport.temperature || 0,
            humidity: testReport.humidity || 0,
            vaccinationCount: testReport.vaccinationCount || 0,
            vaccinations: testReport.vaccinationCount || 0
          }
          break
      }

      const response = await fetch('/api/user/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          batchName: batches.find(b => b.id === testReport.batchId)?.name || "Unknown",
          farmerName: batches.find(b => b.id === testReport.batchId)?.farmerName || "Unknown"
        })
      })

      const data = await response.json()
      
      if (data.report) {
        toast.success(`${testReport.reportType} report submitted successfully!`)
        // Reset form
        setTestReport({
          batchId: "",
          reportType: "mortality",
          mortalityCount: 0,
          cause: "",
          location: "",
          feedAmount: 0,
          feedType: "",
          temperature: 0,
          humidity: 0,
          symptoms: "",
          vaccinationCount: 0,
          vaccineName: ""
        })
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
        <h1 className="text-3xl font-bold">🧪 Test All Report Types</h1>
        <p className="text-muted-foreground">
          Test that all report types automatically update batch statistics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Batch Stats</TabsTrigger>
          <TabsTrigger value="test">Test Reports</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Report Types Supported
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Mortality Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Feed Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Health Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Vaccination Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Daily Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm">Environment Reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Automatic Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>• Mortality updates remaining birds</div>
                  <div>• Feed reports update feed usage</div>
                  <div>• Health reports update temperature/humidity</div>
                  <div>• Vaccination reports update vaccination count</div>
                  <div>• All reports update health status</div>
                  <div>• Real-time dashboard updates</div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                          <div className="font-medium text-blue-600">{batch.birdCount?.toLocaleString() || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Chicks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{batch.remainingBirds?.toLocaleString() || 0}</div>
                          <div className="text-xs text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{batch.mortality?.toLocaleString() || 0}</div>
                          <div className="text-xs text-muted-foreground">Mortality</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">{batch.mortalityRate?.toFixed(2) || 0}%</div>
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
                <TestTube className="h-5 w-5" />
                Submit Test Report
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
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={testReport.reportType} onValueChange={(value) => setTestReport({...testReport, reportType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mortality">Mortality Report</SelectItem>
                      <SelectItem value="feed">Feed Report</SelectItem>
                      <SelectItem value="health">Health Report</SelectItem>
                      <SelectItem value="vaccination">Vaccination Report</SelectItem>
                      <SelectItem value="daily">Daily Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic fields based on report type */}
              {testReport.reportType === "mortality" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              )}

              {testReport.reportType === "feed" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedAmount">Feed Amount (kg)</Label>
                    <Input
                      id="feedAmount"
                      type="number"
                      value={testReport.feedAmount}
                      onChange={(e) => setTestReport({...testReport, feedAmount: parseFloat(e.target.value) || 0})}
                      placeholder="Enter feed amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedType">Feed Type</Label>
                    <Input
                      id="feedType"
                      value={testReport.feedType}
                      onChange={(e) => setTestReport({...testReport, feedType: e.target.value})}
                      placeholder="Enter feed type"
                    />
                  </div>
                </div>
              )}

              {testReport.reportType === "health" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={testReport.temperature}
                      onChange={(e) => setTestReport({...testReport, temperature: parseFloat(e.target.value) || 0})}
                      placeholder="Enter temperature"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      value={testReport.humidity}
                      onChange={(e) => setTestReport({...testReport, humidity: parseFloat(e.target.value) || 0})}
                      placeholder="Enter humidity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <Input
                      id="symptoms"
                      value={testReport.symptoms}
                      onChange={(e) => setTestReport({...testReport, symptoms: e.target.value})}
                      placeholder="Enter symptoms"
                    />
                  </div>
                </div>
              )}

              {testReport.reportType === "vaccination" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vaccinationCount">Vaccination Count</Label>
                    <Input
                      id="vaccinationCount"
                      type="number"
                      value={testReport.vaccinationCount}
                      onChange={(e) => setTestReport({...testReport, vaccinationCount: parseInt(e.target.value) || 0})}
                      placeholder="Enter vaccination count"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vaccineName">Vaccine Name</Label>
                    <Input
                      id="vaccineName"
                      value={testReport.vaccineName}
                      onChange={(e) => setTestReport({...testReport, vaccineName: e.target.value})}
                      placeholder="Enter vaccine name"
                    />
                  </div>
                </div>
              )}

              {testReport.reportType === "daily" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mortalityCount">Mortality Count (optional)</Label>
                    <Input
                      id="mortalityCount"
                      type="number"
                      value={testReport.mortalityCount}
                      onChange={(e) => setTestReport({...testReport, mortalityCount: parseInt(e.target.value) || 0})}
                      placeholder="Enter mortality count"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedAmount">Feed Amount (optional)</Label>
                    <Input
                      id="feedAmount"
                      type="number"
                      value={testReport.feedAmount}
                      onChange={(e) => setTestReport({...testReport, feedAmount: parseFloat(e.target.value) || 0})}
                      placeholder="Enter feed amount"
                    />
                  </div>
                </div>
              )}

              <Button onClick={submitTestReport} className="w-full" size="lg">
                Submit {testReport.reportType} Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Submit test reports to see results here</p>
                <p className="text-sm">All report types will automatically update batch statistics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
