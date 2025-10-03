"use client"

import { useState, useEffect, useCallback } from "react"

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

interface UseUserActivityProps {
  userId: string
  userName: string
  userType?: string
  batchId?: string
  batchName?: string
}

export function useUserActivity({ 
  userId, 
  userName, 
  userType = "user", 
  batchId, 
  batchName 
}: UseUserActivityProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSeen, setLastSeen] = useState<Date>(new Date())
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online')

  // Track user activity
  const trackActivity = useCallback(async (action: string) => {
    try {
      const response = await fetch('/api/admin/user-activities-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          userType,
          batchId,
          batchName,
          action,
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent,
          isOnline: connectionStatus === 'online'
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Silent success - no console log to avoid clutter
      }
    } catch (error) {
      // Silent fail - activity tracking is non-critical
      // Don't log to console to avoid error noise
    }
  }, [userId, userName, userType, batchId, batchName, connectionStatus])

  // Get client IP address
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  // Check internet connection
  const checkConnection = useCallback(() => {
    const online = navigator.onLine
    setConnectionStatus(online ? 'online' : 'offline')
    setIsOnline(online)
    setLastSeen(new Date())
  }, [])

  // Update user status
  const updateStatus = useCallback(async (online: boolean) => {
    try {
      const response = await fetch('/api/admin/user-activities-mock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isOnline: online,
          lastAction: online ? 'online' : 'offline'
        })
      })

      if (response.ok) {
        // Silent success
      }
    } catch (error) {
      // Silent fail - status updates are non-critical
    }
  }, [userId])

  // Set up event listeners
  useEffect(() => {
    // Initial connection check
    checkConnection()

    // Track login
    trackActivity('login')

    // Set up online/offline listeners
    const handleOnline = () => {
      setConnectionStatus('online')
      setIsOnline(true)
      setLastSeen(new Date())
      updateStatus(true)
      trackActivity('online')
    }

    const handleOffline = () => {
      setConnectionStatus('offline')
      setIsOnline(false)
      setLastSeen(new Date())
      updateStatus(false)
      trackActivity('offline')
    }

    // Set up visibility change listener (tab focus/blur)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackActivity('tab_hidden')
      } else {
        trackActivity('tab_visible')
        checkConnection()
      }
    }

    // Set up beforeunload listener (page refresh/close)
    const handleBeforeUnload = () => {
      trackActivity('logout')
      updateStatus(false)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Periodic status update (every 30 seconds)
    const statusInterval = setInterval(() => {
      checkConnection()
      if (connectionStatus === 'online') {
        trackActivity('heartbeat')
      }
    }, 30000)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(statusInterval)
      
      // Track logout on cleanup
      trackActivity('logout')
      updateStatus(false)
    }
  }, [checkConnection, trackActivity, updateStatus, connectionStatus])

  return {
    isOnline,
    connectionStatus,
    lastSeen,
    trackActivity,
    updateStatus
  }
}
