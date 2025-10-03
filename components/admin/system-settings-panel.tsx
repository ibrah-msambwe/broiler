"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  RefreshCw, 
  Trash2, 
  AlertTriangle,
  Database,
  CheckCircle,
  Loader2,
  Timer,
  X
} from "lucide-react"
import { useLanguageStorage } from "@/lib/language-context"
import { useThemeStorage } from "@/lib/theme-context"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SystemSettingsPanel() {
  const { language, setLanguage } = useLanguageStorage()
  const { theme, toggleTheme } = useThemeStorage()
  const [isResetting, setIsResetting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)

  const handleLanguageChange = (newLang: "en" | "sw") => {
    setLanguage(newLang)
    toast.success(`Language changed to ${newLang === "en" ? "English" : "Swahili"}`)
  }

  const handleThemeToggle = () => {
    toggleTheme()
    toast.success(`Theme changed to ${theme === "light" ? "dark" : "light"} mode`)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    toast.info("Refreshing system...")
    
    try {
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      
      // Reload page
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error refreshing:", error)
      toast.error("Failed to refresh system")
      setIsRefreshing(false)
    }
  }

  const handlePasswordVerification = async () => {
    if (!adminPassword.trim()) {
      setPasswordError(language === "en" ? "Please enter your password" : "Tafadhali ingiza nywila yako")
      return
    }

    setPasswordError("")
    setIsResetting(true)

    try {
      // Verify admin password
      const verifyResponse = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyData.valid) {
        setPasswordError(language === "en" ? "Incorrect password. Access denied." : "Nywila si sahihi. Imekataliwa.")
        setIsResetting(false)
        toast.error(language === "en" ? "Incorrect password" : "Nywila si sahihi")
        return
      }

      // Password is correct, start countdown
      toast.success(language === "en" ? "Password verified! Starting reset countdown..." : "Nywila imethibitishwa! Inaanza hesabu...")
      setShowCountdown(true)
      setIsResetting(false)
      setCountdown(10)
      
      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            executeSystemReset()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setCountdownInterval(interval)

    } catch (error) {
      console.error("Error verifying password:", error)
      toast.error(language === "en" ? "Failed to verify password" : "Imeshindwa kuthibitisha nywila")
      setIsResetting(false)
    }
  }

  const executeSystemReset = async () => {
    setIsResetting(true)
    toast.info(language === "en" ? "Resetting system..." : "Inaondoa mfumo...")

    try {
      const resetResponse = await fetch('/api/admin/system-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })

      const resetData = await resetResponse.json()

      if (resetResponse.ok) {
        toast.success(language === "en" ? "System reset completed! All data deleted. Redirecting..." : "Mfumo umewekwa upya! Data yote imefutwa. Inaelekeza...")
        
        // Clear local storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Close dialog
        setShowPasswordDialog(false)
        setShowCountdown(false)
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          window.location.href = "/"
        }, 3000)
      } else {
        toast.error(resetData.error || (language === "en" ? "Failed to reset system" : "Imeshindwa kuweka upya mfumo"))
        setIsResetting(false)
        setShowPasswordDialog(false)
        setShowCountdown(false)
      }
    } catch (error) {
      console.error("Error resetting system:", error)
      toast.error(language === "en" ? "Failed to reset system" : "Imeshindwa kuweka upya mfumo")
      setIsResetting(false)
      setShowPasswordDialog(false)
      setShowCountdown(false)
    }
  }

  const handleCancelCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    setShowCountdown(false)
    setCountdown(10)
    setAdminPassword("")
    setPasswordError("")
    toast.info(language === "en" ? "System reset cancelled" : "Ondoa mfumo imeghairiwa")
  }

  const handleResetClick = () => {
    setAdminPassword("")
    setPasswordError("")
    setShowCountdown(false)
    setCountdown(10)
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    setShowPasswordDialog(true)
  }

  const translations = {
    en: {
      title: "System Settings",
      subtitle: "Manage system configuration and preferences",
      language: "Language",
      languageDesc: "Choose your preferred language",
      theme: "Theme",
      themeDesc: "Switch between light and dark mode",
      refresh: "Refresh System",
      refreshDesc: "Clear cache and reload the application",
      reset: "System Reset",
      resetDesc: "⚠️ Delete all data and reset to defaults",
      resetWarning: "⚠️ CRITICAL WARNING ⚠️",
      resetWarningDesc: "This will permanently delete EVERYTHING in your system:",
      resetList1: "• All batches and farmer information",
      resetList2: "• All reports and historical data",
      resetList3: "• All messages and communications",
      resetList4: "• All user activities and logs",
      resetList5: "• All profiles and accounts",
      resetNote: "You will need to register everything again from scratch.",
      enterPassword: "Enter Admin Password to Confirm",
      passwordPlaceholder: "Enter your admin password",
      cancel: "Cancel",
      confirm: "Yes, Delete Everything",
      incorrectPassword: "Incorrect password",
      verifying: "Verifying password...",
      resetting: "Deleting all data...",
      countdownTitle: "⏰ Final Countdown",
      countdownMessage: "System reset will begin in",
      seconds: "seconds",
      cancelCountdown: "Cancel Reset",
      countdownWarning: "This is your last chance to cancel!",
      english: "English",
      swahili: "Swahili",
      lightMode: "Light Mode",
      darkMode: "Dark Mode"
    },
    sw: {
      title: "Mipangilio ya Mfumo",
      subtitle: "Simamia usanidi na mapendeleo ya mfumo",
      language: "Lugha",
      languageDesc: "Chagua lugha unayopendelea",
      theme: "Mandhari",
      themeDesc: "Badilisha kati ya hali ya mwanga na giza",
      refresh: "Onyesha Upya Mfumo",
      refreshDesc: "Futa akiba na pakia upya programu",
      reset: "Weka Upya Mfumo",
      resetDesc: "⚠️ Futa data yote na weka upya kwa chaguo-msingi",
      resetWarning: "⚠️ ONYO MUHIMU ⚠️",
      resetWarningDesc: "Hii itafuta KILA KITU katika mfumo wako:",
      resetList1: "• Makundi yote na taarifa za wakulima",
      resetList2: "• Ripoti zote na data za kihistoria",
      resetList3: "• Ujumbe wote na mawasiliano",
      resetList4: "• Shughuli zote za watumiaji na rekodi",
      resetList5: "• Wasifu wote na akaunti",
      resetNote: "Utahitaji kusajili kila kitu tena kuanzia mwanzo.",
      enterPassword: "Ingiza Nywila ya Msimamizi Kuthibitisha",
      passwordPlaceholder: "Ingiza nywila yako ya msimamizi",
      cancel: "Ghairi",
      confirm: "Ndiyo, Futa Kila Kitu",
      incorrectPassword: "Nywila si sahihi",
      verifying: "Inathibitisha nywila...",
      resetting: "Inafuta data yote...",
      countdownTitle: "⏰ Hesabu ya Mwisho",
      countdownMessage: "Uondoaji wa mfumo utaanza baada ya",
      seconds: "sekunde",
      cancelCountdown: "Ghairi Ondoa",
      countdownWarning: "Hii ni fursa yako ya mwisho kughairi!",
      english: "Kiingereza",
      swahili: "Kiswahili",
      lightMode: "Hali ya Mwanga",
      darkMode: "Hali ya Giza"
    }
  }

  const t = translations[language]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>{t.language}</CardTitle>
              <CardDescription>{t.languageDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={language === "en" ? "default" : "outline"}
              onClick={() => handleLanguageChange("en")}
              className="flex-1"
            >
              {t.english}
            </Button>
            <Button
              variant={language === "sw" ? "default" : "outline"}
              onClick={() => handleLanguageChange("sw")}
              className="flex-1"
            >
              {t.swahili}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-purple-600" />
              ) : (
                <Moon className="h-5 w-5 text-purple-600" />
              )}
            </div>
            <div>
              <CardTitle>{t.theme}</CardTitle>
              <CardDescription>{t.themeDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="flex items-center gap-2 cursor-pointer">
              {theme === "light" ? t.lightMode : t.darkMode}
            </Label>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>{t.refresh}</CardTitle>
              <CardDescription>{t.refreshDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.refresh}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-600">{t.reset}</CardTitle>
              <CardDescription>{t.resetDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={isResetting}
                onClick={handleResetClick}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.resetting}
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t.reset}
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-lg">
              {!showCountdown ? (
                <>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-xl">
                      <AlertTriangle className="h-6 w-6" />
                      {t.resetWarning}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-4 text-left text-sm text-muted-foreground">
                        <div className="font-semibold text-red-600">{t.resetWarningDesc}</div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 text-sm">
                          <div className="text-red-900">{t.resetList1}</div>
                          <div className="text-red-900">{t.resetList2}</div>
                          <div className="text-red-900">{t.resetList3}</div>
                          <div className="text-red-900">{t.resetList4}</div>
                          <div className="text-red-900">{t.resetList5}</div>
                        </div>
                        <div className="font-semibold text-orange-600">{t.resetNote}</div>
                        
                        {/* Password Input */}
                        <div className="space-y-2 pt-4 border-t">
                          <Label htmlFor="admin-password" className="text-gray-900 font-semibold">
                            {t.enterPassword}
                          </Label>
                          <Input
                            id="admin-password"
                            type="password"
                            value={adminPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setAdminPassword(e.target.value)
                              setPasswordError("")
                            }}
                            placeholder={t.passwordPlaceholder}
                            className={passwordError ? "border-red-500" : ""}
                            disabled={isResetting}
                          />
                          {passwordError && (
                            <div className="text-red-600 text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {passwordError}
                            </div>
                          )}
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isResetting}>{t.cancel}</AlertDialogCancel>
                    <Button
                      onClick={handlePasswordVerification}
                      disabled={isResetting || !adminPassword.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.verifying}
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.confirm}
                        </>
                      )}
                    </Button>
                  </AlertDialogFooter>
                </>
              ) : (
                <>
                  {/* Countdown Screen */}
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center justify-center gap-2 text-orange-600 text-2xl">
                      <Timer className="h-8 w-8" />
                      {t.countdownTitle}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-6 text-center py-8">
                        {/* Circular Countdown */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Progress Circle */}
                            <svg className="w-40 h-40 transform -rotate-90">
                              <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="#fee2e2"
                                strokeWidth="10"
                                fill="none"
                              />
                              <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="#dc2626"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - countdown / 10)}`}
                                className="transition-all duration-1000 ease-linear"
                              />
                            </svg>
                            {/* Countdown Number */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-6xl font-bold text-red-600">{countdown}</div>
                            </div>
                          </div>
                          <div className="mt-4 text-lg font-semibold text-gray-700">
                            {t.countdownMessage}
                          </div>
                          <div className="text-sm text-gray-500">
                            {countdown} {t.seconds}
                          </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                          <div className="flex items-center justify-center gap-2 text-orange-700 font-semibold">
                            <AlertTriangle className="h-5 w-5" />
                            {t.countdownWarning}
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button
                      onClick={handleCancelCountdown}
                      variant="outline"
                      className="w-full text-lg py-6 border-2 border-green-500 text-green-600 hover:bg-green-50"
                      disabled={isResetting}
                    >
                      <X className="mr-2 h-5 w-5" />
                      {t.cancelCountdown}
                    </Button>
                  </AlertDialogFooter>
                </>
              )}
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
