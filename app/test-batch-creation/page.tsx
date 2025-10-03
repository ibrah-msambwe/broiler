"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Plus, CheckCircle, XCircle, Loader2, Users } from "lucide-react"
import { toast } from "sonner"

const TestBatchCreationPage = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [farmers, setFarmers] = useState<any[]>([])
  const [newBatch, setNewBatch] = useState({
    name: "",
    farmerId: "",
    birdCount: "",
    startDate: "",
    username: "",
    password: "",
    color: "bg-blue-500",
    notes: "",
  })

  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500"
  ]

  // Load farmers on component mount
  useEffect(() => {
    loadFarmers()
  }, [])

  const loadFarmers = async () => {
    try {
      const response = await fetch('/api/admin/farmers')
      const data = await response.json()
      if (response.ok) {
        setFarmers(data.farmers || [])
        console.log('Farmers loaded:', data.farmers?.length || 0)
      } else {
        console.error('Failed to load farmers:', data.error)
      }
    } catch (error) {
      console.error('Error loading farmers:', error)
    }
  }

  const createBatch = async () => {
    // Validation
    if (!newBatch.name.trim()) {
      toast.error('Please enter a batch name')
      return
    }
    if (!newBatch.farmerId) {
      toast.error('Please select a farmer')
      return
    }
    if (!newBatch.birdCount || Number.parseInt(newBatch.birdCount) <= 0) {
      toast.error('Please enter a valid bird count')
      return
    }
    if (!newBatch.startDate) {
      toast.error('Please select a start date')
      return
    }
    if (!newBatch.username.trim()) {
      toast.error('Please enter a username for the batch')
      return
    }
    if (!newBatch.password.trim()) {
      toast.error('Please enter a password for the batch')
      return
    }

    setIsCreating(true)
    setResult(null)

    try {
      const selectedFarmer = farmers.find((f) => f.id === newBatch.farmerId)
      if (!selectedFarmer) {
        toast.error('Selected farmer not found')
        return
      }

      console.log('Creating batch with data:', {
        name: newBatch.name.trim(),
        farmerName: selectedFarmer.name,
        startDate: newBatch.startDate,
        birdCount: Number.parseInt(newBatch.birdCount),
        username: newBatch.username.trim(),
        password: newBatch.password.trim(),
        color: newBatch.color,
        notes: newBatch.notes.trim() || null,
      })

      const response = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBatch.name.trim(),
          farmerName: selectedFarmer.name,
          startDate: newBatch.startDate,
          birdCount: Number.parseInt(newBatch.birdCount),
          username: newBatch.username.trim(),
          password: newBatch.password.trim(),
          color: newBatch.color,
          notes: newBatch.notes.trim() || null,
        })
      })

      const data = await response.json()
      console.log('Batch creation response:', data)

      setResult({
        success: response.ok,
        status: response.status,
        data: data,
        error: data.error
      })

      if (response.ok && data.batch) {
        toast.success(`✅ Batch "${data.batch.name}" created successfully!`)
        
        // Reset form
        setNewBatch({
          name: '',
          farmerId: '',
          birdCount: '',
          startDate: '',
          username: '',
          password: '',
          color: 'bg-blue-500',
          notes: '',
        })
      } else {
        toast.error(`❌ Failed to create batch: ${data.error || 'Unknown error'}`)
      }

    } catch (error: any) {
      console.error('Error creating batch:', error)
      setResult({
        success: false,
        status: 0,
        data: null,
        error: error.message
      })
      toast.error(`❌ Error creating batch: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Building className="h-8 w-8" />
              Test Batch Creation
            </CardTitle>
            <p className="text-purple-100 mt-2 text-lg">
              Test the batch creation functionality with enhanced validation
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Batch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="batchName">Batch Name *</Label>
                <Input
                  id="batchName"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  placeholder="e.g., Premium Alpha Batch"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="farmerSelect">Select Farmer *</Label>
                <Select
                  value={newBatch.farmerId}
                  onValueChange={(value) => setNewBatch({ ...newBatch, farmerId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {farmers.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No farmers found. Please add farmers first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birdCount">Bird Count *</Label>
                  <Input
                    id="birdCount"
                    type="number"
                    value={newBatch.birdCount}
                    onChange={(e) => setNewBatch({ ...newBatch, birdCount: e.target.value })}
                    placeholder="1000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newBatch.username}
                    onChange={(e) => setNewBatch({ ...newBatch, username: e.target.value })}
                    placeholder="batch_username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newBatch.password}
                    onChange={(e) => setNewBatch({ ...newBatch, password: e.target.value })}
                    placeholder="secure_password"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="colorSelect">Select Color</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color} ${
                        newBatch.color === color ? "ring-2 ring-gray-400 ring-offset-2" : ""
                      } hover:scale-110 transition-transform`}
                      onClick={() => setNewBatch({ ...newBatch, color })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newBatch.notes}
                  onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                  placeholder="Additional batch information..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={createBatch}
                disabled={isCreating || farmers.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Batch...
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4 mr-2" />
                    Create Batch
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                {result ? (
                  result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )
                ) : (
                  <Building className="h-5 w-5" />
                )}
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {result ? (
                <div className="space-y-4">
                  <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                      {result.success ? "✅ Batch created successfully!" : "❌ Batch creation failed"}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Status Code:</span>
                      <span className={result.success ? "text-green-600" : "text-red-600"}>
                        {result.status}
                      </span>
                    </div>
                    
                    {result.data?.batch && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Created Batch:</h4>
                        <div className="space-y-1 text-xs">
                          <div><strong>ID:</strong> {result.data.batch.id}</div>
                          <div><strong>Name:</strong> {result.data.batch.name}</div>
                          <div><strong>Farmer:</strong> {result.data.batch.farmer_name}</div>
                          <div><strong>Bird Count:</strong> {result.data.batch.bird_count}</div>
                          <div><strong>Start Date:</strong> {result.data.batch.start_date}</div>
                          <div><strong>Username:</strong> {result.data.batch.username}</div>
                          <div><strong>Status:</strong> {result.data.batch.status}</div>
                        </div>
                      </div>
                    )}

                    {result.error && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                        <p className="text-red-700 text-xs">{result.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Fill out the form and click "Create Batch" to test</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Farmers Info */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-200 p-4">
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Farmers ({farmers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {farmers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {farmers.map((farmer) => (
                  <div key={farmer.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="font-semibold">{farmer.name}</div>
                    <div className="text-gray-600">{farmer.email}</div>
                    <div className="text-xs text-gray-500">ID: {farmer.id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No farmers found. Please add farmers first in the admin dashboard.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestBatchCreationPage
