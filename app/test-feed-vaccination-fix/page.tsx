"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
  TestTube,
  Weight,
  Utensils,
  Syringe
} from "lucide-react"

interface BatchStats {
  id: string
  name: string
  farmerName: string
  birdCount: number
  remainingBirds: number
  mortality: number
  mortalityRate: number
  feedUsed: number
  feedConversionRatio: number
  currentWeight: number
  totalWeight: number
  vaccinations: number
  healthStatus: string
  totalReports: number
  dataSource: string
}

export default function TestFeedVaccinationFix() {
  const [batches, setBatches] = useState<BatchStats[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<string>("")

  // Form for submitting test reports
  const [testReport, setTestReport] = useState({
    batchId: "",
    reportType: "daily",
    // Weight fields
    averageWeight: 0,
    currentWeight: 0,
    // Feed fields
    feedConsumed: 0,
    feedType: "",
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
      if (testReport.reportType === "daily") {
        reportData.fields = {
          // Weight data
          averageWeight: testReport.averageWeight || 0,
          currentWeight: testReport.currentWeight || 0,
          // Feed data
          feedConsumed: testReport.feedConsumed || 0,
          feed_consumed: testReport.feedConsumed || 0,
          feedAmount: testReport.feedConsumed || 0,
          feedUsed: testReport.feedConsumed || 0,
          quantity_used: testReport.feedConsumed || 0,
          feedType: testReport.feedType || "Starter",
          // Vaccination data
          vaccinationCount: testReport.vaccinationCount || 0,
          vaccinations: testReport.vaccinationCount || 0
        }
      } else if (testReport.reportType === "vaccination") {
        reportData.fields = {
          vaccineName: testReport.vaccineName || "Test Vaccine",
          vaccinationCount: testReport.vaccinationCount || 0,
          vaccinations: testReport.vaccinationCount || 0,
          vaccineType: "Live",
          administrationMethod: "Injection",
          vaccinationDate: new Date().toISOString().split('T')[0]
        }
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
          reportType: "daily",
          averageWeight: 0,
          currentWeight: 0,
          feedConsumed: 0,
          feedType: "",
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
        <h1 className="text-3xl font-bold">🔧 Test Feed & Vaccination Fix</h1>
        <p className="text-muted-foreground">
          Test that feed reports are now processed correctly and vaccination fields are available
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Statistics */}
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
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                      <div className="text-center">
                        <div className="font-medium text-purple-600">{batch.feedUsed?.toFixed(1) || 0}kg</div>
                        <div className="text-xs text-muted-foreground">Feed Used</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{batch.feedConversionRatio?.toFixed(2) || 0}</div>
                        <div className="text-xs text-muted-foreground">Feed Conversion</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-cyan-600">{batch.vaccinations?.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground">Vaccinations</div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Processed {batch.totalReports} reports • Current Weight: {batch.currentWeight?.toFixed(1) || 0}kg • Total Weight: {batch.totalWeight?.toFixed(1) || 0}kg
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

        {/* Test Report Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Submit Test Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="vaccination">Vaccination Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight Fields */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Weight Data
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="averageWeight">Average Weight (kg)</Label>
                  <Input
                    id="averageWeight"
                    type="number"
                    step="0.1"
                    value={testReport.averageWeight}
                    onChange={(e) => setTestReport({...testReport, averageWeight: parseFloat(e.target.value) || 0})}
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={testReport.currentWeight}
                    onChange={(e) => setTestReport({...testReport, currentWeight: parseFloat(e.target.value) || 0})}
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>
            </div>

            {/* Feed Fields */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Feed Data
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="feedConsumed">Feed Consumed (kg)</Label>
                  <Input
                    id="feedConsumed"
                    type="number"
                    step="0.1"
                    value={testReport.feedConsumed}
                    onChange={(e) => setTestReport({...testReport, feedConsumed: parseFloat(e.target.value) || 0})}
                    placeholder="e.g., 50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="feedType">Feed Type</Label>
                  <Input
                    id="feedType"
                    value={testReport.feedType}
                    onChange={(e) => setTestReport({...testReport, feedType: e.target.value})}
                    placeholder="e.g., Starter"
                  />
                </div>
              </div>
            </div>

            {/* Vaccination Fields */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Vaccination Data
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="vaccinationCount">Vaccination Count</Label>
                  <Input
                    id="vaccinationCount"
                    type="number"
                    value={testReport.vaccinationCount}
                    onChange={(e) => setTestReport({...testReport, vaccinationCount: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vaccineName">Vaccine Name</Label>
                  <Input
                    id="vaccineName"
                    value={testReport.vaccineName}
                    onChange={(e) => setTestReport({...testReport, vaccineName: e.target.value})}
                    placeholder="e.g., ND Vaccine"
                  />
                </div>
              </div>
            </div>

            <Button onClick={submitTestReport} className="w-full" size="lg">
              Submit Test Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Fix Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>✅ <strong>Feed Processing Fixed:</strong> Now reads `quantity_used` field from feed reports</div>
            <div>✅ <strong>Feed Report Type Added:</strong> Added "Feed Report" to report type filter</div>
            <div>✅ <strong>Vaccination Report Added:</strong> New vaccination report type with comprehensive fields</div>
            <div>✅ <strong>Daily Report Enhanced:</strong> Added weight and vaccination fields to daily reports</div>
            <div>✅ <strong>Real-time Updates:</strong> All metrics update automatically when reports are submitted</div>
            <div>🔄 <strong>Data Source:</strong> All calculations are based on data from the reports table</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
