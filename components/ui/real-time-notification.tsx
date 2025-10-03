"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Bell, AlertTriangle, CheckCircle, MessageSquare, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'report' | 'message' | 'mortality' | 'batch_update'
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  timestamp: string
}

interface RealTimeNotificationProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  className?: string
}

export default function RealTimeNotification({ 
  notifications, 
  onDismiss, 
  className 
}: RealTimeNotificationProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Add new notifications to visible list
    const newNotifications = notifications.filter(
      n => !visibleNotifications.some(vn => vn.id === n.id)
    )
    
    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [...newNotifications, ...prev])
      
      // Auto-dismiss after 5 seconds for non-critical notifications
      newNotifications.forEach(notification => {
        if (notification.priority !== 'critical') {
          setTimeout(() => {
            onDismiss(notification.id)
          }, 5000)
        }
      })
    }
  }, [notifications, visibleNotifications, onDismiss])

  const getIcon = (type: string) => {
    switch (type) {
      case 'report': return <FileText className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'mortality': return <AlertTriangle className="h-4 w-4" />
      case 'batch_update': return <CheckCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'normal': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
      default: return 'bg-blue-500 text-white'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-2 max-w-sm", className)}>
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id}
          className={cn(
            "shadow-lg border-l-4 animate-in slide-in-from-right duration-300",
            notification.priority === 'critical' ? 'border-red-500' :
            notification.priority === 'high' ? 'border-orange-500' :
            'border-blue-500'
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-1.5 rounded-full",
                getPriorityColor(notification.priority)
              )}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {notification.title}
                  </h4>
                  <Badge 
                    variant="secondary" 
                    className="text-xs ml-2"
                  >
                    {formatTime(notification.timestamp)}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      notification.priority === 'critical' ? 'border-red-500 text-red-600' :
                      notification.priority === 'high' ? 'border-orange-500 text-orange-600' :
                      'border-blue-500 text-blue-600'
                    )}
                  >
                    {notification.priority.toUpperCase()}
                  </Badge>
                  
                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
