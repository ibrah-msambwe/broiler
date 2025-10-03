"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Activity, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

export default function TestAdminDashboard() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadBatches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/batches-with-stats')
      const data = await response.json()
      
      if (data.batches) {
        setBatches(data.batches)
        console.log("📊 Loaded batches:", data.batches)
      }
    } catch (error) {
      console.error("Error loading batches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [])

  // Calculate totals
  const totalChicks = batches.reduce((sum, batch) => sum + (batch.birdCount || 0), 0)
  const totalMortality = batches.reduce((sum, batch) => sum + (batch.mortality || 0), 0)
  const totalRemainingBirds = batches.reduce((sum, batch) => sum + (batch.remainingBirds || 0), 0)
  const activeFarmersCount = Array.from(new Set(batches.map((b) => b.farmerName).filter(Boolean))).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🧪 Test Admin Dashboard Display</h1>
        <p className="text-muted-foreground">
          Testing the updated admin dashboard with real-time statistics
        </p>
        <Button onClick={loadBatches} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh Data
        </Button>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Current Birds Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-blue-600 text-sm font-semibold">Current Birds</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-800">{totalRemainingBirds.toLocaleString()}</p>
                <p className="text-xs text-blue-600 flex items-center mt-2">
                  <Activity className="h-3 w-3 mr-1" />
                  of {totalChicks.toLocaleString()} total
                </p>
                {totalChicks > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Survival Rate</span>
                      <span>{((totalRemainingBirds / totalChicks) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(totalRemainingBirds / totalChicks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Batches Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-green-600 text-sm font-semibold">Total Batches</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-800">{batches.length}</p>
                <p className="text-xs text-green-600 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All monitored
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Mortality Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-red-600 text-sm font-semibold">Total Mortality</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-800">{totalMortality.toLocaleString()}</p>
                <p className="text-xs text-red-600 flex items-center mt-2">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {totalChicks > 0 ? ((totalMortality / totalChicks) * 100).toFixed(2) : '0.00'}% mortality rate
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Farmers Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-purple-600 text-sm font-semibold">Active Farmers</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-800">{activeFarmersCount}</p>
                <p className="text-xs text-purple-600 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Managing batches
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Details */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Details</CardTitle>
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
                    Processed {batch.totalReports} reports • Last updated: {new Date(batch.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No batch data available</p>
              <p className="text-sm">Click "Refresh Data" to load</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
