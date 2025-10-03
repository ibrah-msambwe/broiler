"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  User, 
  Globe, 
  Moon, 
  Sun, 
  Mail,
  Save,
  CheckCircle
} from "lucide-react"
import { useLanguageStorage } from "@/lib/language-context"
import { useThemeStorage } from "@/lib/theme-context"
import { toast } from "sonner"

interface UserSettingsPanelProps {
  currentUser?: {
    id?: string
    name?: string
    email?: string
    username?: string
  }
}

export default function UserSettingsPanel({ currentUser }: UserSettingsPanelProps) {
  const { language, setLanguage } = useLanguageStorage()
  const { theme, toggleTheme } = useThemeStorage()
  const [name, setName] = useState(currentUser?.name || currentUser?.username || "")
  const [email, setEmail] = useState(currentUser?.email || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleLanguageChange = (newLang: "en" | "sw") => {
    setLanguage(newLang)
    toast.success(`Language changed to ${newLang === "en" ? "English" : "Swahili"}`)
  }

  const handleThemeToggle = () => {
    toggleTheme()
    toast.success(`Theme changed to ${theme === "light" ? "dark" : "light"} mode`)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    toast.info("Saving profile...")

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const translations = {
    en: {
      title: "User Settings",
      subtitle: "Manage your personal preferences",
      profile: "Profile Information",
      profileDesc: "Update your personal details",
      name: "Name",
      email: "Email",
      save: "Save Changes",
      language: "Language",
      languageDesc: "Choose your preferred language",
      theme: "Theme",
      themeDesc: "Switch between light and dark mode",
      english: "English",
      swahili: "Swahili",
      lightMode: "Light Mode",
      darkMode: "Dark Mode"
    },
    sw: {
      title: "Mipangilio ya Mtumiaji",
      subtitle: "Simamia mapendeleo yako binafsi",
      profile: "Taarifa za Wasifu",
      profileDesc: "Sasisha maelezo yako binafsi",
      name: "Jina",
      email: "Barua pepe",
      save: "Hifadhi Mabadiliko",
      language: "Lugha",
      languageDesc: "Chagua lugha unayopendelea",
      theme: "Mandhari",
      themeDesc: "Badilisha kati ya hali ya mwanga na giza",
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

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>{t.profile}</CardTitle>
              <CardDescription>{t.profileDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600" />
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
    </div>
  )
}

