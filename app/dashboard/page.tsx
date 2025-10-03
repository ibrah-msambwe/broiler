"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Server,
  Key,
  Database,
  LogOut,
  FolderSyncIcon as Sync,
  Cloud,
  Download,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import DeviceManager from "@/components/device-manager"
import CredentialManager from "@/components/credential-manager"
import BackupManager from "@/components/backup-manager"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    devices: 0,
    credentials: 0,
    lastBackup: null as string | null,
  })
  const [syncStatus, setSyncStatus] = useState("synced")
  const [cloudStatus, setCloudStatus] = useState("connected")
  const [onlineDataVerified, setOnlineDataVerified] = useState(false)
  const [language, setLanguage] = useState<"en" | "sw">("en")
  const router = useRouter()

  // Translations
  const translations = {
    en: {
      title: "TARIQ System Dashboard",
      welcome: "Welcome to System Management",
      totalDevices: "Total Devices/Systems",
      storedCredentials: "Stored Credentials",
      lastBackup: "Last Backup",
      never: "Never",
      deviceManagement: "Device & System Management",
      credentialVault: "Credential Vault",
      backupStorage: "Backup & Storage",
      logout: "Logout",
      exportCredentials: "Export Credentials"
    },
    sw: {
      title: "Jopo la Mfumo wa TARIQ",
      welcome: "Karibu kwenye Usimamizi wa Mfumo",
      totalDevices: "Jumla ya Vifaa/Mifumo",
      storedCredentials: "Hati za Usajili Zilizohifadhiwa",
      lastBackup: "Nakala ya Mwisho",
      never: "Kamwe",
      deviceManagement: "Usimamizi wa Vifaa na Mifumo",
      credentialVault: "Chumba cha Hati za Usajili",
      backupStorage: "Nakala na Uhifadhi",
      logout: "Ondoka",
      exportCredentials: "Hamisha Hati za Usajili"
    }
  }

  const t = translations[language]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Ensure we're working with the correct user
    if (parsedUser.email !== "ibrahim8msambwe@gmail.com") {
      console.warn("User email mismatch, updating to correct email")
      parsedUser.email = "ibrahim8msambwe@gmail.com"
      localStorage.setItem("user", JSON.stringify(parsedUser))
    }

    loadStats()
    verifySupabaseConnection()

    // Auto-sync every 30 seconds
    const syncInterval = setInterval(syncData, 30000)
    return () => clearInterval(syncInterval)
  }, [router])

  const loadStats = async () => {
    try {
      setSyncStatus("syncing")
      const [devicesRes, credentialsRes, backupRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/credentials"),
        fetch("/api/backup/status"),
      ])

      if (!devicesRes.ok || !credentialsRes.ok || !backupRes.ok) {
        throw new Error("Failed to fetch data from one or more endpoints")
      }

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
      console.error("Failed to load stats:", error)
      setSyncStatus("error")
      setStats({
        devices: 0,
        credentials: 0,
        lastBackup: null,
      })
    }
  }

  const verifySupabaseConnection = async () => {
    try {
      const response = await fetch(`/api/user/stats`)
      if (response.ok) {
        const data = await response.json()
        setOnlineDataVerified(true)
        setCloudStatus("connected")
        console.log("Supabase connection verified:", {
          devices: data.total_devices,
          credentials: data.total_credentials,
          account_age: data.account_age_days,
        })
      } else {
        setOnlineDataVerified(false)
        setCloudStatus("error")
      }
    } catch (error) {
      console.error("Failed to verify Supabase connection:", error)
      setOnlineDataVerified(false)
      setCloudStatus("error")
    }
  }

  const syncData = async () => {
    try {
      setSyncStatus("syncing")
      // Just reload stats to verify connection
      await loadStats()
      setSyncStatus("synced")
    } catch (error) {
      console.error("Sync failed:", error)
      setSyncStatus("error")
    }
  }

  const exportCredentialsPDF = async () => {
    try {
      setSyncStatus("exporting")
      const response = await fetch("/api/export/credentials-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user?.email }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `PasswordManager-Export-${user?.email?.split("@")[0]}-${new Date().toISOString().split("T")[0]}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSyncStatus("synced")
      } else {
        setSyncStatus("error")
        alert("Failed to export PDF. Please try again.")
      }
    } catch (error) {
      console.error("Failed to export PDF:", error)
      setSyncStatus("error")
      alert("Export failed. Please check your connection and try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your secure vault from Supabase cloud...</p>
          <p className="text-sm text-gray-500 mt-2">Permanent storage accessible from any device</p>
          <p className="text-xs text-gray-400 mt-1">Powered by Msambwe Pro</p>
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
                  Password Manager
                </h1>
                <p className="text-xs text-gray-500">Created by Msambwe Pro • Supabase Cloud Storage</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Status Indicators */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Cloud className="h-4 w-4 text-gray-400" />
                  <Badge variant={cloudStatus === "connected" ? "default" : "destructive"} className="text-xs">
                    {cloudStatus === "connected" ? "Supabase Connected" : "Storage Error"}
                  </Badge>
                </div>

                {onlineDataVerified && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Data Verified
                    </Badge>
                  </div>
                )}

                <div className="flex items-center space-x-1">
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
                    {syncStatus === "synced" && <Sync className="h-3 w-3 mr-1" />}
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
              </div>

              {/* Language Switcher - HESK Blue Style */}
              <div className="flex items-center gap-0 bg-blue-50 border border-blue-300">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setLanguage("en")}
                  className={cn("h-8 px-3 text-xs font-normal border-0 rounded-none", language === "en" ? "bg-white border-r border-blue-300 text-blue-800" : "hover:bg-white/50 text-blue-700")}
                >
                  EN
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setLanguage("sw")}
                  className={cn("h-8 px-3 text-xs font-normal border-0 rounded-none", language === "sw" ? "bg-white text-blue-800" : "hover:bg-white/50 text-blue-700")}
                >
                  SW
                </Button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Ibrahim M.</p>
                  <p className="text-xs text-gray-500">ibrahim8msambwe@gmail.com</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCredentialsPDF}
                    disabled={syncStatus === "exporting"}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 h-8 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {syncStatus === "exporting" ? "Exporting..." : "Export HTML"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    {t.logout}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supabase Status */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">
                  {onlineDataVerified ? "✅ Supabase Cloud Database Active" : "⚠️ Verifying Database Connection"}
                </h3>
                <p className="text-sm text-green-700">
                  Your data is permanently stored in Supabase cloud database for:{" "}
                  <strong>ibrahim8msambwe@gmail.com</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">Powered by Msambwe Pro • Permanent Cloud Storage</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={verifySupabaseConnection}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">{t.totalDevices}</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg">
                <Server className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.devices}</div>
              <p className="text-xs text-blue-600 mt-1">Stored in Supabase</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">{t.storedCredentials}</CardTitle>
              <div className="p-2 bg-purple-600 rounded-lg">
                <Key className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.credentials}</div>
              <p className="text-xs text-purple-600 mt-1">Encrypted in cloud</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">{t.lastBackup}</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg">
                <Database className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : t.never}
              </div>
              <p className="text-xs text-green-600 mt-1">Supabase backup</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Security Status</CardTitle>
              <div className="p-2 bg-orange-600 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">Secure</Badge>
              </div>
              <p className="text-xs text-orange-600 mt-1">Cloud protected</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="devices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50 p-1 h-12">
            <TabsTrigger
              value="devices"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              {t.deviceManagement}
            </TabsTrigger>
            <TabsTrigger
              value="credentials"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              {t.credentialVault}
            </TabsTrigger>
            <TabsTrigger
              value="backup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              {t.backupStorage}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices">
            <DeviceManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="credentials">
            <CredentialManager onStatsUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="backup">
            <BackupManager onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2025 <span className="font-semibold text-blue-600">Msambwe Pro</span> • Password Manager Enterprise
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Powered by Supabase Cloud Database • Enterprise Security Standards
          </p>
        </footer>
      </main>
    </div>
  )
}
