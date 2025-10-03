"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  BarChart3,
  Activity,
  TrendingUp
} from "lucide-react"

interface SetupStatus {
  triggersReady: boolean
  components: {
    triggerFunction: boolean
    trigger: boolean
  }
  message: string
}

interface BatchStats {
  batchId: string
  batchName: string
  totalChicks: number
  remainingBirds: number
  totalMortality: number
  mortalityRate: number
  healthStatus: string
  reportsProcessed: number
}

export default function SetupBatchReportsRelationship() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [batchStats, setBatchStats] = useState<BatchStats[]>([])
  const [activeTab, setActiveTab] = useState("setup")

  // Check setup status
  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup-batch-triggers')
      const data = await response.json()
      setSetupStatus(data)
    } catch (error) {
      console.error("Error checking setup status:", error)
      toast.error("Failed to check setup status")
    }
  }

  // Setup triggers
  const setupTriggers = async () => {
    setIsSettingUp(true)
    try {
      const response = await fetch('/api/admin/setup-batch-triggers', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success("Batch triggers setup successfully!")
        await checkSetupStatus()
      } else {
        toast.error("Setup failed: " + data.error)
      }
    } catch (error) {
      console.error("Error setting up triggers:", error)
      toast.error("Failed to setup triggers")
    } finally {
      setIsSettingUp(false)
    }
  }

  // Update all batches from reports
  const updateAllBatches = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/batch/update-from-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceUpdate: true })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Updated ${data.totalUpdated} batches from reports!`)
        await loadBatchStats()
      } else {
        toast.error("Update failed: " + data.error)
      }
    } catch (error) {
      console.error("Error updating batches:", error)
      toast.error("Failed to update batches")
    } finally {
      setIsUpdating(false)
    }
  }

  // Load batch statistics
  const loadBatchStats = async () => {
    try {
      // Get all batches first
      const batchesResponse = await fetch('/api/admin/batches')
      const batchesData = await batchesResponse.json()
      
      if (batchesData.batches && batchesData.batches.length > 0) {
        const statsPromises = batchesData.batches.map(async (batch: any) => {
          try {
            const statsResponse = await fetch(`/api/batch/real-time-stats?batchId=${batch.id}`)
            const statsData = await statsResponse.json()
            
            if (statsData.success) {
              return {
                batchId: batch.id,
                batchName: batch.name,
                totalChicks: statsData.statistics.totalChicks,
                remainingBirds: statsData.statistics.remainingBirds,
                totalMortality: statsData.statistics.totalMortality,
                mortalityRate: statsData.statistics.mortalityRate,
                healthStatus: statsData.statistics.healthStatus,
                reportsProcessed: statsData.statistics.totalReports
              }
            }
          } catch (error) {
            console.error(`Error loading stats for batch ${batch.id}:`, error)
          }
          return null
        })
        
        const stats = (await Promise.all(statsPromises)).filter(Boolean)
        setBatchStats(stats)
      }
    } catch (error) {
      console.error("Error loading batch stats:", error)
      toast.error("Failed to load batch statistics")
    }
  }

  // Load data on component mount
  useEffect(() => {
    checkSetupStatus()
    loadBatchStats()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔗 Setup Batch-Reports Relationship</h1>
        <p className="text-muted-foreground">
          Establish automatic relationship between reports and batches for real-time statistics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup Triggers</TabsTrigger>
          <TabsTrigger value="update">Update Batches</TabsTrigger>
          <TabsTrigger value="monitor">Monitor Results</TabsTrigger>
        </TabsList>

        {/* Setup Triggers Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Triggers Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {setupStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {setupStatus.triggersReady ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {setupStatus.triggersReady ? "Triggers Ready" : "Triggers Not Ready"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {setupStatus.components.triggerFunction ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Trigger Function</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {setupStatus.components.trigger ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Database Trigger</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {setupStatus.message}
                  </p>

                  {!setupStatus.triggersReady && (
                    <Button onClick={setupTriggers} disabled={isSettingUp} className="w-full">
                      {isSettingUp ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Setup Database Triggers
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading setup status...</p>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>What triggers do:</strong> Automatically update batch statistics whenever a mortality, 
                  feed, or daily report is submitted. This ensures real-time data consistency between reports and batches.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Update Batches Tab */}
        <TabsContent value="update" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Update All Batches from Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">This will:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Scan all reports in the database</li>
                  <li>Calculate total mortality for each batch</li>
                  <li>Update remaining bird counts</li>
                  <li>Calculate mortality rates and health status</li>
                  <li>Update feed usage from reports</li>
                  <li>Ensure dashboard shows correct statistics</li>
                </ul>
              </div>

              <Button onClick={updateAllBatches} disabled={isUpdating} className="w-full" size="lg">
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating All Batches...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update All Batches from Reports
                  </>
                )}
              </Button>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Safe to run:</strong> This operation only reads from reports and updates batches. 
                  It won't delete or modify any existing data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitor Results Tab */}
        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Batch Statistics from Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Showing real-time statistics calculated from reports
                  </span>
                  <Button onClick={loadBatchStats} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {batchStats.length > 0 ? (
                  <div className="space-y-2">
                    {batchStats.map((batch, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{batch.batchName}</div>
                          <Badge variant={batch.healthStatus === 'Excellent' ? 'default' : 
                                       batch.healthStatus === 'Good' ? 'secondary' : 
                                       batch.healthStatus === 'Fair' ? 'outline' : 'destructive'}>
                            {batch.healthStatus}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">{batch.totalChicks}</div>
                            <div className="text-xs text-muted-foreground">Total Chicks</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">{batch.remainingBirds}</div>
                            <div className="text-xs text-muted-foreground">Remaining</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">{batch.totalMortality}</div>
                            <div className="text-xs text-muted-foreground">Mortality</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-purple-600">{batch.mortalityRate}%</div>
                            <div className="text-xs text-muted-foreground">Mortality Rate</div>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Processed {batch.reportsProcessed} reports
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No batch statistics available</p>
                    <p className="text-sm">Click "Refresh" to load data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold mb-2">Reports Submitted</h4>
              <p className="text-sm text-muted-foreground">
                User submits mortality report with death count
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="font-semibold mb-2">Automatic Update</h4>
              <p className="text-sm text-muted-foreground">
                Database trigger automatically updates batch statistics
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-semibold mb-2">Real-time Display</h4>
              <p className="text-sm text-muted-foreground">
                Dashboard shows updated remaining birds and mortality
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
