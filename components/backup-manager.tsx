"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Database, Calendar, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface BackupStatus {
  lastBackup: string | null
  nextScheduled: string | null
  totalBackups: number
  autoBackupEnabled: boolean
  lastBackupSize: string
}

interface BackupManagerProps {
  onStatsUpdate: () => void
}

export default function BackupManager({ onStatsUpdate }: BackupManagerProps) {
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    lastBackup: null,
    nextScheduled: null,
    totalBackups: 0,
    autoBackupEnabled: true,
    lastBackupSize: "0 KB",
  })
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)

  useEffect(() => {
    loadBackupStatus()
    // Set up daily backup check
    const interval = setInterval(checkDailyBackup, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const loadBackupStatus = async () => {
    try {
      const response = await fetch("/api/backup/status")
      if (response.ok) {
        const data = await response.json()
        setBackupStatus(data)
        onStatsUpdate()
      }
    } catch (error) {
      console.error("Failed to load backup status:", error)
    }
  }

  const checkDailyBackup = async () => {
    try {
      const response = await fetch("/api/backup/check-daily")
      if (response.ok) {
        const data = await response.json()
        if (data.shouldBackup) {
          performAutomaticBackup()
        }
      }
    } catch (error) {
      console.error("Failed to check daily backup:", error)
    }
  }

  const performAutomaticBackup = async () => {
    if (isBackingUp) return

    setIsBackingUp(true)
    setBackupProgress(0)

    try {
      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/backup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "automatic" }),
      })

      clearInterval(progressInterval)
      setBackupProgress(100)

      if (response.ok) {
        setTimeout(() => {
          loadBackupStatus()
          setIsBackingUp(false)
          setBackupProgress(0)
        }, 1000)
      }
    } catch (error) {
      console.error("Backup failed:", error)
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  const performManualBackup = async () => {
    if (isBackingUp) return

    setIsBackingUp(true)
    setBackupProgress(0)

    try {
      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 300)

      const response = await fetch("/api/backup/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "manual" }),
      })

      clearInterval(progressInterval)
      setBackupProgress(100)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `password-manager-backup-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setTimeout(() => {
          loadBackupStatus()
          setIsBackingUp(false)
          setBackupProgress(0)
        }, 1000)
      }
    } catch (error) {
      console.error("Backup failed:", error)
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  const toggleAutoBackup = async () => {
    try {
      const response = await fetch("/api/backup/toggle-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !backupStatus.autoBackupEnabled }),
      })

      if (response.ok) {
        loadBackupStatus()
      }
    } catch (error) {
      console.error("Failed to toggle auto backup:", error)
    }
  }

  const getNextBackupTime = () => {
    if (!backupStatus.autoBackupEnabled) return "Disabled"

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0) // 2 AM next day

    return tomorrow.toLocaleString()
  }

  const isBackupOverdue = () => {
    if (!backupStatus.lastBackup) return true

    const lastBackup = new Date(backupStatus.lastBackup)
    const now = new Date()
    const daysSinceBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)

    return daysSinceBackup > 1
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Backup & Storage</h2>
        <p className="text-muted-foreground">Manage your data backups and ensure permanent storage</p>
      </div>

      {/* Backup Status Alert */}
      {isBackupOverdue() && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your data hasn't been backed up in over 24 hours. Consider creating a backup to ensure data safety.
          </AlertDescription>
        </Alert>
      )}

      {/* Backup Progress */}
      {isBackingUp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Creating Backup...</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={backupProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {backupProgress < 100 ? `Backing up data... ${backupProgress}%` : "Finalizing backup..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Backup Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupStatus.lastBackup ? new Date(backupStatus.lastBackup).toLocaleDateString() : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">
              {backupStatus.lastBackup ? `Size: ${backupStatus.lastBackupSize}` : "No backups created"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStatus.autoBackupEnabled ? "Daily" : "Disabled"}</div>
            <p className="text-xs text-muted-foreground">{getNextBackupTime()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backupStatus.totalBackups}</div>
            <p className="text-xs text-muted-foreground">Backup history count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Backup</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={backupStatus.autoBackupEnabled ? "default" : "secondary"}>
                {backupStatus.autoBackupEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Daily automatic backups</p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manual Backup</CardTitle>
            <CardDescription>Create an immediate backup and download it to your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={performManualBackup} disabled={isBackingUp} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {isBackingUp ? "Creating Backup..." : "Create & Download Backup"}
            </Button>
            <p className="text-sm text-muted-foreground">
              This will create a complete backup of all your devices, credentials, and settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatic Backup</CardTitle>
            <CardDescription>Configure daily automatic backups to ensure data safety</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={toggleAutoBackup}
              variant={backupStatus.autoBackupEnabled ? "destructive" : "default"}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {backupStatus.autoBackupEnabled ? "Disable Auto Backup" : "Enable Auto Backup"}
            </Button>
            <p className="text-sm text-muted-foreground">
              {backupStatus.autoBackupEnabled
                ? "Automatic backups run daily at 2:00 AM and store data permanently."
                : "Enable automatic backups to ensure your data is backed up daily."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Storage & Persistence</CardTitle>
          <CardDescription>Information about how your data is stored and protected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Local Storage</h4>
              <p className="text-sm text-muted-foreground">
                All data is stored locally in a SQLite database with encrypted passwords using bcrypt hashing.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Daily Backups</h4>
              <p className="text-sm text-muted-foreground">
                Automatic daily backups ensure your data is preserved and can be restored if needed.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Data Persistence</h4>
              <p className="text-sm text-muted-foreground">
                Your email, password, and all stored credentials are permanently saved and persist across sessions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Security</h4>
              <p className="text-sm text-muted-foreground">
                All sensitive data is encrypted and protected with industry-standard security measures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
