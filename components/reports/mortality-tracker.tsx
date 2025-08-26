"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, TrendingDown, Users, Calendar, MapPin, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface MortalityRecord {
  id: string
  batch_id: string
  death_count: number
  bird_age: number
  cause: string
  location: string
  description: string
  report_date: string
  created_at: string
}

interface MortalityStatistics {
  totalMortality: number
  currentBirdCount: number
  mortalityRate: number
  originalBirdCount: number
}

interface MortalityTrackerProps {
  batchId: string
  batchName: string
  originalBirdCount: number
}

export default function MortalityTracker({ batchId, batchName, originalBirdCount }: MortalityTrackerProps) {
  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>([])
  const [statistics, setStatistics] = useState<MortalityStatistics>({
    totalMortality: 0,
    currentBirdCount: originalBirdCount,
    mortalityRate: 0
  })
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMortality, setNewMortality] = useState({
    deathCount: 0,
    birdAge: 0,
    cause: "",
    location: "",
    description: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchMortalityData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/mortality?batchId=${encodeURIComponent(batchId)}`)
      if (response.ok) {
        const data = await response.json()
        setMortalityRecords(data.mortalityRecords || [])
        setStatistics(data.statistics || statistics)
      }
    } catch (error) {
      console.error("Failed to fetch mortality data:", error)
      toast({
        title: "Error",
        description: "Failed to load mortality data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMortalityData()
  }, [batchId])

  const handleAddMortality = async () => {
    if (!newMortality.deathCount || newMortality.deathCount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of deaths",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/user/mortality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          deathCount: newMortality.deathCount,
          birdAge: newMortality.birdAge,
          cause: newMortality.cause,
          location: newMortality.location,
          description: newMortality.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Mortality Recorded",
          description: `Successfully recorded ${newMortality.deathCount} deaths`,
        })
        
        // Reset form and refresh data
        setNewMortality({
          deathCount: 0,
          birdAge: 0,
          cause: "",
          location: "",
          description: ""
        })
        setShowAddForm(false)
        fetchMortalityData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to record mortality",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to add mortality record:", error)
      toast({
        title: "Error",
        description: "Failed to record mortality",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getMortalityTrend = () => {
    if (mortalityRecords.length < 2) return "stable"
    const recent = mortalityRecords.slice(0, 3).reduce((sum, r) => sum + r.death_count, 0)
    const older = mortalityRecords.slice(3, 6).reduce((sum, r) => sum + r.death_count, 0)
    if (recent > older) return "increasing"
    if (recent < older) return "decreasing"
    return "stable"
  }

  const getMortalityTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing": return "text-red-600"
      case "decreasing": return "text-green-600"
      default: return "text-blue-600"
    }
  }

  const getMortalityTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return "↗️"
      case "decreasing": return "↘️"
      default: return "→"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Mortality Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Original Count</p>
                <p className="text-2xl font-bold text-blue-800">{statistics.originalBirdCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Mortality</p>
                <p className="text-2xl font-bold text-red-800">{statistics.totalMortality}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Current Count</p>
                <p className="text-2xl font-bold text-green-800">{statistics.currentBirdCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Mortality Rate</p>
                <p className="text-2xl font-bold text-orange-800">{statistics.mortalityRate}%</p>
              </div>
              <div className="text-2xl">{getMortalityTrendIcon(getMortalityTrend())}</div>
            </div>
            <p className={`text-xs mt-1 ${getMortalityTrendColor(getMortalityTrend())}`}>
              Trend: {getMortalityTrend()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Mortality Record */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Mortality Tracking
            </CardTitle>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
              size="sm"
            >
              {showAddForm ? "Cancel" : "Add Mortality Record"}
            </Button>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Number of Deaths *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2"
                  value={newMortality.deathCount}
                  onChange={(e) => setNewMortality(prev => ({ ...prev, deathCount: Number(e.target.value) }))}
                  min="1"
                />
              </div>
              <div>
                <Label>Age of Birds (Days)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={newMortality.birdAge}
                  onChange={(e) => setNewMortality(prev => ({ ...prev, birdAge: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Cause of Death</Label>
                <Select
                  value={newMortality.cause}
                  onValueChange={(value) => setNewMortality(prev => ({ ...prev, cause: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Natural">Natural</SelectItem>
                    <SelectItem value="Disease">Disease</SelectItem>
                    <SelectItem value="Accident">Accident</SelectItem>
                    <SelectItem value="Heat Stress">Heat Stress</SelectItem>
                    <SelectItem value="Cold Stress">Cold Stress</SelectItem>
                    <SelectItem value="Feed Issue">Feed Issue</SelectItem>
                    <SelectItem value="Water Issue">Water Issue</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location in House</Label>
                <Input
                  placeholder="e.g., Section A, Corner"
                  value={newMortality.location}
                  onChange={(e) => setNewMortality(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Detailed Description</Label>
              <Textarea
                rows={3}
                placeholder="Describe the circumstances, symptoms, or any other relevant details..."
                value={newMortality.description}
                onChange={(e) => setNewMortality(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMortality}
                disabled={submitting || !newMortality.deathCount}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? "Recording..." : "Record Mortality"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mortality Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mortality Records ({mortalityRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading mortality data...</p>
            </div>
          ) : mortalityRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No mortality records yet</p>
              <p className="text-sm">All birds are healthy!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mortalityRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="text-sm">
                        {record.death_count} Death{record.death_count !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {record.cause}
                      </Badge>
                      {record.bird_age > 0 && (
                        <Badge variant="secondary" className="text-sm">
                          Day {record.bird_age}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(record.report_date)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {record.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{record.location}</span>
                      </div>
                    )}
                    {record.description && (
                      <div className="md:col-span-2">
                        <p className="text-gray-700">{record.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mortality Alert */}
      {statistics.mortalityRate > 5 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Mortality Alert:</strong> Current mortality rate is {statistics.mortalityRate}%. 
            This exceeds the normal 5% threshold. Please review management practices and consider 
            consulting with a veterinarian if the trend continues.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 