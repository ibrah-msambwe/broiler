"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Activity, 
  Users, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Monitor,
  Smartphone,
  Tablet,
  User,
  Building,
  TestTube,
  Database
} from "lucide-react"
import { useUserActivity } from "@/hooks/use-user-activity"

interface UserActivity {
  id: string
  userId: string
  userName: string
  userType: string
  batchId?: string
  batchName?: string
  lastAction: string
  lastSeen: string
  ipAddress?: string
  userAgent?: string
  isOnline: boolean
  createdAt: string
  updatedAt: string
}

export default function TestUserActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [testUser, setTestUser] = useState({
    userId: "test-user-001",
    userName: "Test User",
    userType: "farmer",
    batchId: "8eba521a-a83f-4cc1-b876-3e0fcf70cac7",
    batchName: "Pemba"
  })

  // Use the user activity hook
  const { isOnline, connectionStatus, trackActivity } = useUserActivity({
    userId: testUser.userId,
    userName: testUser.userName,
    userType: testUser.userType,
    batchId: testUser.batchId,
    batchName: testUser.batchName
  })

  // Load user activities
  const loadActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/user-activities')
      const data = await response.json()
      
      if (data.activities) {
        setActivities(data.activities)
        toast.success(`Loaded ${data.activities.length} user activities`)
      } else {
        toast.error("Failed to load user activities")
      }
    } catch (error) {
      console.error("Error loading activities:", error)
      toast.error("Failed to load user activities")
    } finally {
      setLoading(false)
    }
  }

  // Test different user types
  const testUserTypes = [
    { id: "admin-001", name: "Admin User", type: "admin", batchId: null, batchName: null },
    { id: "farmer-001", name: "John Doe", type: "farmer", batchId: "8eba521a-a83f-4cc1-b876-3e0fcf70cac7", batchName: "Pemba" },
    { id: "farmer-002", name: "Jane Smith", type: "farmer", batchId: "7dd74051-ad2d-45e2-8bf7-1cabe76a4772", batchName: "Msambwe" },
    { id: "batch-001", name: "Pemba Batch", type: "batch", batchId: "8eba521a-a83f-4cc1-b876-3e0fcf70cac7", batchName: "Pemba" }
  ]

  // Simulate user login
  const simulateLogin = async (user: typeof testUserTypes[0]) => {
    try {
      const response = await fetch('/api/admin/user-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userType: user.type,
          batchId: user.batchId,
          batchName: user.batchName,
          action: 'login',
          isOnline: true
        })
      })

      if (response.ok) {
        toast.success(`${user.name} logged in successfully`)
        await loadActivities()
      } else {
        toast.error("Failed to simulate login")
      }
    } catch (error) {
      console.error("Error simulating login:", error)
      toast.error("Failed to simulate login")
    }
  }

  // Simulate user logout
  const simulateLogout = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/user-activities?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("User logged out successfully")
        await loadActivities()
      } else {
        toast.error("Failed to simulate logout")
      }
    } catch (error) {
      console.error("Error simulating logout:", error)
      toast.error("Failed to simulate logout")
    }
  }

  // Test activity tracking
  const testActivity = async (action: string) => {
    await trackActivity(action)
    toast.success(`Activity '${action}' tracked`)
  }

  // Load activities on component mount
  useEffect(() => {
    loadActivities()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadActivities, 10000)
    return () => clearInterval(interval)
  }, [])

  const onlineUsers = activities.filter(a => a.isOnline)
  const offlineUsers = activities.filter(a => !a.isOnline)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">👥 Test User Activity Tracking</h1>
        <p className="text-muted-foreground">
          Test user login tracking, online/offline status, and activity monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">{testUser.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {testUser.userType} • {testUser.batchName || 'No batch'}
                  </p>
                </div>
              </div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>Test User Type</Label>
              <Select 
                value={testUser.userType} 
                onValueChange={(value) => setTestUser({...testUser, userType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Test Activities</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => testActivity('page_view')} variant="outline" size="sm">
                  Page View
                </Button>
                <Button onClick={() => testActivity('button_click')} variant="outline" size="sm">
                  Button Click
                </Button>
                <Button onClick={() => testActivity('form_submit')} variant="outline" size="sm">
                  Form Submit
                </Button>
                <Button onClick={() => testActivity('data_refresh')} variant="outline" size="sm">
                  Data Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulate Different Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Simulate User Logins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testUserTypes.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.type} • {user.batchName || 'No batch'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => simulateLogin(user)} 
                    size="sm" 
                    variant="outline"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => simulateLogout(user.id)} 
                    size="sm" 
                    variant="destructive"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            All User Activities
            <Button onClick={loadActivities} disabled={loading} variant="outline" size="sm">
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{onlineUsers.length}</div>
              <div className="text-sm text-green-600">Online Users</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{offlineUsers.length}</div>
              <div className="text-sm text-gray-600">Offline Users</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {activity.userType === 'admin' ? <Building className="h-4 w-4" /> :
                       activity.userType === 'farmer' ? <User className="h-4 w-4" /> :
                       activity.userType === 'batch' ? <Activity className="h-4 w-4" /> :
                       <User className="h-4 w-4" />}
                      <div className={`w-3 h-3 rounded-full ${activity.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{activity.userName}</p>
                        <Badge variant={activity.isOnline ? "default" : "secondary"}>
                          {activity.isOnline ? "Online" : "Offline"}
                        </Badge>
                        <Badge variant="outline">{activity.userType}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.lastSeen).toLocaleTimeString()}
                        </div>
                        
                        {activity.batchName && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {activity.batchName}
                          </div>
                        )}
                        
                        {activity.ipAddress && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.ipAddress}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Last action: {activity.lastAction}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {activity.userAgent?.includes('Mobile') ? <Smartphone className="h-4 w-4" /> :
                     activity.userAgent?.includes('Tablet') ? <Tablet className="h-4 w-4" /> :
                     <Monitor className="h-4 w-4" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No user activities found</p>
                <p className="text-sm">Simulate some user logins to see activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
