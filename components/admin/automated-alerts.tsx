"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Thermometer,
  Heart,
  X,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { playNotificationSound, playCriticalAlert } from "@/lib/audio-notifications"

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  batchName: string
  timestamp: Date
  read: boolean
  actionable: boolean
}

interface AutomatedAlertsProps {
  batches: any[]
  reports: any[]
  onAlertClick?: (alert: Alert) => void
}

export default function AutomatedAlerts({ batches, reports, onAlertClick }: AutomatedAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Monitoring system - runs every 30 seconds
  useEffect(() => {
    const checkForAlerts = () => {
      const newAlerts: Alert[] = []
      const seenAlertIds = new Set<string>()
      const timestamp = Date.now()

      batches.forEach(batch => {
        const totalChicks = batch.totalChicks || batch.birdCount
        const mortalityRate = totalChicks > 0 ? (batch.mortality / totalChicks) * 100 : 0
        const fcr = parseFloat(batch.feedConversionRatio) || 0
        const age = Math.floor((Date.now() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24))

        // 1. Critical Mortality Alert
        if (mortalityRate > 15) {
          const alertId = `critical-mortality-${batch.id}`
          const uniqueId = `${alertId}-${timestamp}`
          if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
            seenAlertIds.add(alertId)
            newAlerts.push({
              id: uniqueId,
              type: 'critical',
              title: '🚨 CRITICAL: Very High Mortality!',
              message: `${batch.name} has ${mortalityRate.toFixed(1)}% mortality rate! Immediate action required. Contact veterinarian ASAP.`,
              batchName: batch.name,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
            playCriticalAlert()
            toast.error(`🚨 CRITICAL ALERT: ${batch.name}`, {
              description: `Mortality rate: ${mortalityRate.toFixed(1)}%`,
              duration: 10000
            })
          }
        } else if (mortalityRate > 10) {
          const alertId = `high-mortality-${batch.id}`
          const uniqueId = `${alertId}-${timestamp}`
          if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
            seenAlertIds.add(alertId)
            newAlerts.push({
              id: uniqueId,
              type: 'warning',
              title: '⚠️ High Mortality Alert',
              message: `${batch.name} mortality at ${mortalityRate.toFixed(1)}%. Above 10% threshold. Review health immediately.`,
              batchName: batch.name,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
            playNotificationSound()
          }
        }

        // 2. Poor FCR Alert
        if (fcr > 2.2) {
          const alertId = `poor-fcr-${batch.id}`
          const uniqueId = `${alertId}-${timestamp}`
          if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
            seenAlertIds.add(alertId)
            newAlerts.push({
              id: uniqueId,
              type: 'warning',
              title: '📊 Poor Feed Conversion',
              message: `${batch.name} FCR is ${fcr.toFixed(2)}, significantly above target. Check feed quality and bird health.`,
              batchName: batch.name,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
          }
        }

        // 3. Poor Health Status
        if (batch.healthStatus === 'Poor') {
          const alertId = `poor-health-${batch.id}`
          const uniqueId = `${alertId}-${timestamp}`
          // Check both existing alerts and newAlerts to prevent duplicates
          if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
            seenAlertIds.add(alertId)
            newAlerts.push({
              id: uniqueId,
              type: 'critical',
              title: '🏥 Poor Health Status',
              message: `${batch.name} health status is POOR. Immediate veterinary consultation recommended.`,
              batchName: batch.name,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
            playCriticalAlert()
          }
        }

        // 4. Batch Aging Alert (35+ days - consider harvest)
        if (age >= 35 && age <= 42 && batch.status === 'Active') {
          const alertId = `harvest-ready-${batch.id}`
          const uniqueId = `${alertId}-${timestamp}`
          if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
            seenAlertIds.add(alertId)
            newAlerts.push({
              id: uniqueId,
              type: 'info',
              title: '📅 Harvest Window Approaching',
              message: `${batch.name} is ${age} days old. Consider market readiness and harvest planning.`,
              batchName: batch.name,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
          }
        }

        // 5. Overdue Batch Alert (45+ days)
        if (age > 45 && batch.status === 'Active') {
          const alertId = `overdue-${batch.id}`
          const uniqueId = `${alertId}-${timestamp}`
          if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
            seenAlertIds.add(alertId)
            newAlerts.push({
              id: uniqueId,
              type: 'warning',
              title: '⏰ Batch Overdue for Harvest',
              message: `${batch.name} is ${age} days old. Delayed harvest may reduce profitability.`,
              batchName: batch.name,
              timestamp: new Date(),
              read: false,
              actionable: true
            })
          }
        }

        // 6. Sudden Mortality Spike (check recent reports)
        const batchReports = reports
          .filter(r => r.batchId === batch.id)
          .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
          .slice(0, 3)

        if (batchReports.length >= 2) {
          const recentMortalities = batchReports.map(r => r.data?.mortalityCount || 0)
          const avgRecent = recentMortalities.reduce((a, b) => a + b, 0) / recentMortalities.length
          
          if (avgRecent > 20) {
            const alertId = `mortality-spike-${batch.id}`
            const uniqueId = `${alertId}-${timestamp}`
            if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
              seenAlertIds.add(alertId)
              newAlerts.push({
                id: uniqueId,
                type: 'critical',
                title: '📈 Mortality Spike Detected',
                message: `${batch.name} showing sudden increase in daily mortality (avg ${avgRecent.toFixed(0)} birds/day). Investigate immediately.`,
                batchName: batch.name,
                timestamp: new Date(),
                read: false,
                actionable: true
              })
              playCriticalAlert()
            }
          }
        }
      })

      // 7. Critical Reports Pending
      const criticalPending = reports.filter(r => r.priority === 'Critical' && r.status === 'Pending')
      if (criticalPending.length > 0) {
        const alertId = `critical-reports-pending`
        const uniqueId = `${alertId}-${timestamp}`
        if (!alerts.find(a => a.id.startsWith(alertId)) && !seenAlertIds.has(alertId)) {
          seenAlertIds.add(alertId)
          newAlerts.push({
            id: uniqueId,
            type: 'critical',
            title: '📋 Critical Reports Awaiting Review',
            message: `${criticalPending.length} critical report(s) need immediate admin attention.`,
            batchName: 'Multiple Batches',
            timestamp: new Date(),
            read: false,
            actionable: true
          })
        }
      }

      if (newAlerts.length > 0) {
        // Remove duplicates from newAlerts based on ID
        const uniqueNewAlerts = newAlerts.filter((alert, index, self) => 
          index === self.findIndex(a => a.id === alert.id)
        )
        
        setAlerts(prev => [...uniqueNewAlerts, ...prev].slice(0, 50)) // Keep last 50 alerts
        setUnreadCount(prev => prev + uniqueNewAlerts.length)
      }
    }

    // Initial check
    checkForAlerts()

    // Check every 30 seconds
    const interval = setInterval(checkForAlerts, 30000)

    return () => clearInterval(interval)
  }, [batches, reports])

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ))
    const wasUnread = alerts.find(a => a.id === alertId && !a.read)
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const dismissAlert = (alertId: string) => {
    const wasUnread = alerts.find(a => a.id === alertId && !a.read)
    setAlerts(prev => prev.filter(a => a.id !== alertId))
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
    setUnreadCount(0)
  }

  const getAlertColor = (type: string) => {
    switch(type) {
      case 'critical': return 'bg-red-50 border-red-300 text-red-900'
      case 'warning': return 'bg-orange-50 border-orange-300 text-orange-900'
      case 'info': return 'bg-blue-50 border-blue-300 text-blue-900'
      default: return 'bg-gray-50 border-gray-300 text-gray-900'
    }
  }

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning': return <TrendingUp className="h-5 w-5 text-orange-600" />
      case 'info': return <Activity className="h-5 w-5 text-blue-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Alerts Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Automated Alerts</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount} New</Badge>
          )}
        </div>
        {alerts.length > 0 && (
          <Button size="sm" variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">All Clear!</p>
              <p className="text-sm text-gray-500">No alerts at this time. System is monitoring...</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-l-4 transition-all ${getAlertColor(alert.type)} ${!alert.read ? 'shadow-md' : 'opacity-75'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Badge variant="outline" className="text-xs">{alert.batchName}</Badge>
                        <span>•</span>
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!alert.read && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {alert.actionable && (
                  <Button 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => onAlertClick?.(alert)}
                  >
                    Take Action
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

