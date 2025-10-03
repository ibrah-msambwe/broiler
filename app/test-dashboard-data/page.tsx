"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Activity, AlertTriangle, TrendingUp } from "lucide-react"

export default function TestDashboardData() {
  const [batchData, setBatchData] = useState<any>(null)
  const [realTimeStats, setRealTimeStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const batchId = "7dd74051-ad2d-45e2-8bf7-1cabe76a4772" // Msambwe batch

  const loadData = async () => {
    setLoading(true)
    try {
      // Load batch data
      const batchRes = await fetch(`/api/user/batch?batchId=${batchId}`)
      const batchJson = await batchRes.json()
      setBatchData(batchJson.batch)

      // Load real-time stats
      const statsRes = await fetch(`/api/batch/real-time-stats?batchId=${batchId}`)
      const statsJson = await statsRes.json()
      setRealTimeStats(statsJson.statistics)

    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🧪 Test Dashboard Data</h1>
        <p className="text-muted-foreground">
          Testing batch data vs real-time statistics from reports
        </p>
        <Button onClick={loadData} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batch Data from Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Batch Data (Database)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {batchData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{batchData.bird_count || 0}</div>
                    <div className="text-sm text-blue-600">Total Chicks</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">{batchData.mortality || 0}</div>
                    <div className="text-sm text-red-600">Mortality (DB)</div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {batchData.name}</div>
                  <div><strong>Farmer:</strong> {batchData.farmer_name}</div>
                  <div><strong>Status:</strong> {batchData.status}</div>
                  <div><strong>Health Status:</strong> {batchData.health_status}</div>
                  <div><strong>Start Date:</strong> {batchData.start_date}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
                <p className="mt-2">Loading batch data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Stats from Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Real-time Stats (Reports)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {realTimeStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{realTimeStats.totalChicks || 0}</div>
                    <div className="text-sm text-blue-600">Total Chicks</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">{realTimeStats.remainingBirds || 0}</div>
                    <div className="text-sm text-green-600">Remaining Birds</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">{realTimeStats.totalMortality || 0}</div>
                    <div className="text-sm text-red-600">Total Mortality</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800">{realTimeStats.mortalityRate || 0}%</div>
                    <div className="text-sm text-purple-600">Mortality Rate</div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div><strong>Health Status:</strong> 
                    <Badge className={realTimeStats.healthStatus === 'Excellent' ? 'bg-green-100 text-green-800' : 
                                   realTimeStats.healthStatus === 'Good' ? 'bg-blue-100 text-blue-800' : 
                                   realTimeStats.healthStatus === 'Fair' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-red-100 text-red-800'}>
                      {realTimeStats.healthStatus}
                    </Badge>
                  </div>
                  <div><strong>Reports Processed:</strong> {realTimeStats.totalReports}</div>
                  <div><strong>Data Source:</strong> {realTimeStats.dataSource}</div>
                  <div><strong>Last Updated:</strong> {new Date(realTimeStats.lastUpdated).toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
                <p className="mt-2">Loading real-time stats...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison */}
      {batchData && realTimeStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Data Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold mb-2">Mortality Count</div>
                  <div className="text-2xl font-bold text-red-600">
                    DB: {batchData.mortality || 0} → Reports: {realTimeStats.totalMortality || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {realTimeStats.totalMortality > (batchData.mortality || 0) ? 
                      `+${realTimeStats.totalMortality - (batchData.mortality || 0)} more deaths in reports` : 
                      'Data matches'}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold mb-2">Remaining Birds</div>
                  <div className="text-2xl font-bold text-green-600">
                    {realTimeStats.remainingBirds || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Calculated from reports
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold mb-2">Mortality Rate</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {realTimeStats.mortalityRate || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on total deaths
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
