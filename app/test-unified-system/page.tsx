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
  Users, 
  Database, 
  BarChart3, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  RefreshCw
} from "lucide-react"

interface SystemStatus {
  systemReady: boolean
  components: {
    unifiedUsersTable: boolean
    databaseFunctions: boolean
    databaseTriggers: boolean
  }
  message: string
}

interface User {
  id: string
  name: string
  email: string
  userType: string
  batchName?: string
  farmerName?: string
  isActive: boolean
  isOnline: boolean
  status: string
  createdAt: string
}

interface Batch {
  id: string
  name: string
  farmerName: string
  birdCount: number
  remainingBirds: number
  totalMortality: number
  mortalityRate: number
  healthScore: number
  healthStatus: string
  status: string
  createdAt: string
}

export default function TestUnifiedSystem() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("status")

  // Form states
  const [newUser, setNewUser] = useState({
    userType: "admin",
    name: "",
    email: "",
    phone: "",
    username: "",
    batchId: ""
  })

  const [newBatch, setNewBatch] = useState({
    name: "",
    farmerName: "",
    startDate: "",
    birdCount: 1000,
    expectedHarvestDate: ""
  })

  const [newReport, setNewReport] = useState({
    batchId: "",
    reportType: "mortality",
    mortalityCount: 0,
    cause: "",
    location: ""
  })

  // Check system status
  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/unified/setup')
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error("Error checking system status:", error)
      toast.error("Failed to check system status")
    }
  }

  // Initialize system
  const initializeSystem = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/unified/setup', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success("System initialized successfully!")
        await checkSystemStatus()
      } else {
        toast.error("System initialization failed: " + data.message)
      }
    } catch (error) {
      console.error("Error initializing system:", error)
      toast.error("Failed to initialize system")
    } finally {
      setLoading(false)
    }
  }

  // Load users
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/unified/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load users")
    }
  }

  // Load batches
  const loadBatches = async () => {
    try {
      const response = await fetch('/api/unified/batches')
      const data = await response.json()
      setBatches(data.batches || [])
    } catch (error) {
      console.error("Error loading batches:", error)
      toast.error("Failed to load batches")
    }
  }

  // Create user
  const createUser = async () => {
    if (!newUser.name) {
      toast.error("Name is required")
      return
    }

    try {
      const response = await fetch('/api/unified/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success("User created successfully!")
        setNewUser({ userType: "admin", name: "", email: "", phone: "", username: "", batchId: "" })
        await loadUsers()
      } else {
        toast.error("Failed to create user: " + data.error)
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Failed to create user")
    }
  }

  // Create batch
  const createBatch = async () => {
    if (!newBatch.name || !newBatch.farmerName) {
      toast.error("Name and farmer name are required")
      return
    }

    try {
      const response = await fetch('/api/unified/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch)
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success("Batch created successfully!")
        setNewBatch({ name: "", farmerName: "", startDate: "", birdCount: 1000, expectedHarvestDate: "" })
        await loadBatches()
      } else {
        toast.error("Failed to create batch: " + data.error)
      }
    } catch (error) {
      console.error("Error creating batch:", error)
      toast.error("Failed to create batch")
    }
  }

  // Submit report
  const submitReport = async () => {
    if (!newReport.batchId || !newReport.mortalityCount) {
      toast.error("Batch ID and mortality count are required")
      return
    }

    try {
      const response = await fetch('/api/unified/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: newReport.batchId,
          reportType: newReport.reportType,
          fields: {
            mortalityCount: newReport.mortalityCount,
            cause: newReport.cause,
            location: newReport.location
          }
        })
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success("Report submitted and batch updated automatically!")
        setNewReport({ batchId: "", reportType: "mortality", mortalityCount: 0, cause: "", location: "" })
        await loadBatches() // Refresh batches to see updated statistics
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
    checkSystemStatus()
    loadUsers()
    loadBatches()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🐔 Unified Broiler Management System</h1>
        <p className="text-muted-foreground">
          Complete self-contained system with automatic calculations and real-time updates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {systemStatus.systemReady ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {systemStatus.systemReady ? "System Ready" : "System Not Ready"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {systemStatus.components.unifiedUsersTable ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Users Table</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemStatus.components.databaseFunctions ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Functions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemStatus.components.databaseTriggers ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Triggers</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {systemStatus.message}
                  </p>

                  {!systemStatus.systemReady && (
                    <Button onClick={initializeSystem} disabled={loading} className="w-full">
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Initialize System
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading system status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create User Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Create User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">User Type</Label>
                  <Select value={newUser.userType} onValueChange={(value) => setNewUser({...newUser, userType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="batch_user">Batch User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone"
                  />
                </div>

                <Button onClick={createUser} className="w-full">
                  Create User
                </Button>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{user.userType}</Badge>
                          {user.batchName && <Badge variant="secondary">{user.batchName}</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div className="text-xs text-muted-foreground">{user.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Batch Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Create Batch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchName">Batch Name *</Label>
                  <Input
                    id="batchName"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                    placeholder="Enter batch name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmerName">Farmer Name *</Label>
                  <Input
                    id="farmerName"
                    value={newBatch.farmerName}
                    onChange={(e) => setNewBatch({...newBatch, farmerName: e.target.value})}
                    placeholder="Enter farmer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birdCount">Bird Count</Label>
                  <Input
                    id="birdCount"
                    type="number"
                    value={newBatch.birdCount}
                    onChange={(e) => setNewBatch({...newBatch, birdCount: parseInt(e.target.value) || 0})}
                    placeholder="Enter bird count"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({...newBatch, startDate: e.target.value})}
                  />
                </div>

                <Button onClick={createBatch} className="w-full">
                  Create Batch
                </Button>
              </CardContent>
            </Card>

            {/* Batches List */}
            <Card>
              <CardHeader>
                <CardTitle>Batches ({batches.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batches.map((batch) => (
                    <div key={batch.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{batch.name}</div>
                      <div className="text-sm text-muted-foreground">{batch.farmerName}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>Birds: {batch.remainingBirds}/{batch.birdCount}</div>
                        <div>Mortality: {batch.totalMortality}</div>
                        <div>Rate: {batch.mortalityRate.toFixed(2)}%</div>
                        <div>Health: {batch.healthScore}/100</div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={batch.healthStatus === 'Excellent' ? 'default' : batch.healthStatus === 'Good' ? 'secondary' : 'destructive'}>
                          {batch.healthStatus}
                        </Badge>
                        <Badge variant="outline">{batch.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Submit Mortality Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportBatchId">Batch *</Label>
                <Select value={newReport.batchId} onValueChange={(value) => setNewReport({...newReport, batchId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
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
                <Label htmlFor="mortalityCount">Mortality Count *</Label>
                <Input
                  id="mortalityCount"
                  type="number"
                  value={newReport.mortalityCount}
                  onChange={(e) => setNewReport({...newReport, mortalityCount: parseInt(e.target.value) || 0})}
                  placeholder="Enter number of deaths"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cause">Cause</Label>
                <Input
                  id="cause"
                  value={newReport.cause}
                  onChange={(e) => setNewReport({...newReport, cause: e.target.value})}
                  placeholder="Enter cause of death"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newReport.location}
                  onChange={(e) => setNewReport({...newReport, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>

              <Button onClick={submitReport} className="w-full">
                Submit Report (Auto-Updates Batch)
              </Button>

              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                This will automatically:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Subtract deaths from remaining birds</li>
                  <li>Add deaths to total mortality</li>
                  <li>Calculate new mortality rate</li>
                  <li>Update health score and status</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
