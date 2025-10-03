"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  Activity, 
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
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  ShieldCheck
} from "lucide-react"
import { toast } from "sonner"

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
  batchStatus?: string
  batchColor?: string
  isApproved?: boolean
  approvedAt?: string
  approvedBy?: string
}

interface UserActivityPanelProps {
  onRefresh?: () => void
}

export default function UserActivityPanel({ onRefresh }: UserActivityPanelProps) {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Load user activities from batches table
  const loadActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/user-activities-batches')
      const data = await response.json()
      
      if (data.activities) {
        setActivities(data.activities)
        setLastRefresh(new Date())
        toast.success(`Loaded ${data.activities.length} users from batches`)
      } else {
        toast.error("Failed to load user activities from batches")
      }
    } catch (error) {
      console.error("Error loading activities from batches:", error)
      toast.error("Failed to load user activities from batches")
    } finally {
      setLoading(false)
    }
  }

  // Refresh system data
  const handleRefresh = async () => {
    await loadActivities()
    if (onRefresh) {
      onRefresh()
    }
    toast.success("System refreshed successfully")
  }

  // Approve or unapprove user
  const handleApproveUser = async (activity: UserActivity, approve: boolean) => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: activity.userId,
          approve: approve,
          adminName: 'Admin'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || `User ${approve ? 'approved' : 'unapproved'} successfully`)
        // Reload activities to reflect changes
        await loadActivities()
      } else {
        toast.error(data.error || `Failed to ${approve ? 'approve' : 'unapprove'} user`)
      }
    } catch (error) {
      console.error(`Error ${approve ? 'approving' : 'unapproving'} user:`, error)
      toast.error(`Failed to ${approve ? 'approve' : 'unapprove'} user`)
    }
  }

  // Get device icon based on user agent
  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />
    
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
  }

  // Get user type icon
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return <Building className="h-4 w-4" />
      case 'farmer':
        return <User className="h-4 w-4" />
      case 'batch':
        return <Activity className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Load activities on component mount
  useEffect(() => {
    loadActivities()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [])

  const onlineUsers = activities.filter(a => a.isOnline)
  const offlineUsers = activities.filter(a => !a.isOnline)

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">User Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline" 
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wifi className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Users</p>
                <p className="text-2xl font-bold text-green-600">{onlineUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <WifiOff className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offline Users</p>
                <p className="text-2xl font-bold text-gray-600">{offlineUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{activities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon(activity.userType)}
                        <div className="p-1 rounded-full">
                          {activity.isOnline ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-400 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{activity.userName}</p>
                          <Badge 
                            variant={activity.isOnline ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {activity.isOnline ? "Online" : "Offline"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {activity.userType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(activity.lastSeen)}
                          </div>
                          
                          {activity.batchName && (
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {activity.batchName}
                              {activity.batchStatus && (
                                <Badge variant="outline" className="text-xs ml-1">
                                  {activity.batchStatus}
                                </Badge>
                              )}
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
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(activity.userAgent || "")}
                        <Badge 
                          variant={activity.isOnline ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {activity.isOnline ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      {/* Approval Status Badge */}
                      {activity.isApproved === false ? (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pending Approval
                        </Badge>
                      ) : activity.isApproved === true ? (
                        <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-600">
                          <ShieldCheck className="h-3 w-3" />
                          Approved
                        </Badge>
                      ) : null}
                      
                      {/* Approve/Unapprove Buttons */}
                      <div className="flex gap-1">
                        {activity.isApproved === false ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveUser(activity, true)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        ) : activity.isApproved === true ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleApproveUser(activity, false)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found in batches</p>
                  <p className="text-sm">Users will appear here when batches are created</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
