"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, CheckCircle, X, Clock, User, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  batch_id: string
  report_id: string
  priority: string
  status: "unread" | "read"
  created_at: string
  urgency: "high" | "normal"
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "read" })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: "read" } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        toast({
          title: "Notification marked as read",
          description: "The notification has been marked as read."
        })
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (notifications.find(n => n.id === id)?.status === "unread") {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast({
          title: "Notification deleted",
          description: "The notification has been removed."
        })
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "normal": return "bg-blue-500"
      case "low": return "bg-gray-500"
      default: return "bg-blue-500"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    return urgency === "high" ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-blue-500" />
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8 w-8 sm:h-9 sm:w-9"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="w-fit">
                  {unreadCount} unread
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="text-center py-4 text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see new reports here</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.status === "unread" 
                            ? "bg-blue-50 border-blue-200" 
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getUrgencyIcon(notification.urgency)}
                              <span className="font-medium text-sm">
                                {notification.title}
                              </span>
                              <Badge 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {notification.message.split(" submitted:")[0]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Batch ID: {notification.batch_id}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTime(notification.created_at)}
                              </span>
                              <div className="flex gap-1">
                                {notification.status === "unread" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 