"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Server, Key, Database, LogOut, Download, RefreshCw, CheckCircle, User } from "lucide-react"
import { useRouter } from "next/navigation"
import DeviceManager from "@/components/device-manager"
import CredentialManager from "@/components/credential-manager"
import BackupManager from "@/components/backup-manager"

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    devices: 0,
    credentials: 0,
    lastBackup: null as string | null,
  })
  const [syncStatus, setSyncStatus] = useState("synced")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    loadStats()

    // Auto-sync every 30 seconds
    const syncInterval = setInterval(loadStats, 30000)
    return () => clearInterval(syncInterval)
  }, [router])

  const loadStats = async () => {
    try {
      setSyncStatus("syncing")
      const [devicesRes, credentialsRes, backupRes] = await Promise.all([
        fetch(`/api/user/devices?email=${user?.email}`),
        fetch(`/api/user/credentials?email=${user?.email}`),
        fetch("/api/backup/status"),
      ])

      const devices = await devicesRes.json()
      const credentials = await credentialsRes.json()
      const backup = await backupRes.json()

      setStats({
        devices: devices.length || 0,
        credentials: credentials.length || 0,
        lastBackup: backup.lastBackup,
      })
      setSyncStatus("synced")
    } catch (error) {
      console.error("Failed to load user stats:", error)
      setSyncStatus("error")
    }
  }

  const exportUserData = async () => {
    try {
      setSyncStatus("exporting")
      const response = await fetch("/api/user/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user?.email }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        // Use email instead of name for the filename
        a.download = `SecureVault-${user?.email?.replace(/[@.]/g, "-")}-${new Date().toISOString().split("T")[0]}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSyncStatus("synced")
      }
    } catch (error) {
      console.error("Failed to export user data:", error)
      setSyncStatus("error")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your secure vault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SecureVault Pro
                </h1>
                <p className="text-xs text-gray-500">Personal Password Manager</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Indicators */}
              <div className="flex items-center space-x-3">
                <Badge
                  variant={
                    syncStatus === "synced"
                      ? "default"
                      : syncStatus === "syncing" || syncStatus === "exporting"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-xs"
                >
                  {syncStatus === "synced" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {(syncStatus === "syncing" || syncStatus === "exporting") && (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  )}
                  {syncStatus === "synced"
                    ? "Synced"
                    : syncStatus === "syncing"
                      ? "Syncing"
                      : syncStatus === "exporting"
                        ? "Exporting"
                        : "Sync Error"}
                </Badge>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-700">{user.email}</p>
                  <p className="text-xs text-blue-600">{user.email}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportUserData}
                    disabled={syncStatus === "exporting"}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 h-8 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {syncStatus === "exporting" ? "Exporting..." : "Export Data"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800">Welcome back!</h3>
              <p className="text-sm text-blue-700">
                Your secure vault is ready. All data is encrypted with AES-256 and synced to the cloud.
              </p>
            </div>
          </div>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">My Devices</CardTitle>
              <Server className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.devices}</div>
              <p className="text-xs text-blue-600 mt-1">Registered devices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">My Credentials</CardTitle>
              <Key className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.credentials}</div>
              <p className="text-xs text-purple-600 mt-1">Stored passwords</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : "Never"}
              </div>
              <p className="text-xs text-green-600 mt-1">Cloud backup</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="credentials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 p-1 h-12">
            <TabsTrigger
              value="credentials"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              My Passwords
            </TabsTrigger>
            <TabsTrigger
              value="devices"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              My Devices
            </TabsTrigger>
            <TabsTrigger
              value="backup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              Backup & Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            <CredentialManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="devices">
            <DeviceManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="backup">
            <BackupManager onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2025 <span className="font-semibold text-blue-600">Msambwe Pro</span> • SecureVault Pro Personal Edition
          </p>
          <p className="text-xs text-gray-500 mt-1">
            User: {user.email} ({user.email}) • AES-256 Encrypted • Cloud Synchronized
          </p>
        </footer>
      </main>
    </div>
  )
}
