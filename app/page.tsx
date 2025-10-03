"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, LogIn, Shield, Monitor, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "sw">("en")

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("app_language") as "en" | "sw"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language when it changes
  const handleLanguageChange = (newLang: "en" | "sw") => {
    setLanguage(newLang)
    localStorage.setItem("app_language", newLang)
    window.dispatchEvent(new CustomEvent("languageChange", { detail: newLang }))
  }

  const translations = {
    en: {
      title: "TARIQ Broiler Manager",
      batches: "Broiler Batches",
      batchesDesc: "Register and manage broiler batches",
      farmerLogin: "Farmer Login",
      farmerLoginDesc: "Access your broiler dashboard",
      adminLogin: "Admin Login",
      adminLoginDesc: "Manage broiler system",
      features: "Features",
      featuresDesc: "Broiler management overview",
    },
    sw: {
      title: "Msimamizi wa Kuku wa Nyama wa TARIQ",
      batches: "Makundi ya Kuku wa Nyama",
      batchesDesc: "Sajili na simamia makundi ya kuku wa nyama",
      farmerLogin: "Kuingia Mkulima",
      farmerLoginDesc: "Fikia dashibodi yako ya kuku wa nyama",
      adminLogin: "Kuingia Msimamizi",
      adminLoginDesc: "Simamia mfumo wa kuku wa nyama",
      features: "Vipengele",
      featuresDesc: "Muhtasari wa usimamizi wa kuku wa nyama",
    },
  }

  const t = translations[language]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
            <Button
              variant={language === "en" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLanguageChange("en")}
              className="text-xs font-medium"
            >
              EN
            </Button>
            <Button
              variant={language === "sw" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleLanguageChange("sw")}
              className="text-xs font-medium"
            >
              SW
            </Button>
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Simple Title */}
          <div className="pt-4 pb-2 px-4">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t.title}
                </span>
              </h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {/* 2x2 Grid Navigation Cards */}
            <div className="w-full max-w-2xl">
              <div className="grid grid-cols-2 gap-6">
              {/* Broiler Batches Card */}
              <Card
                className="bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer aspect-square sm:aspect-auto"
                onClick={() => handleNavigation("/batches")}
              >
                <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">{t.batches}</h3>
                  <p className="text-xs text-gray-600 mb-2 flex-1 sm:flex-none">{t.batchesDesc}</p>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mx-auto" />
                </CardContent>
              </Card>

              {/* Farmer Login Card */}
              <Card
                className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer aspect-square sm:aspect-auto"
                onClick={() => handleNavigation("/farmer-login")}
              >
                <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">{t.farmerLogin}</h3>
                  <p className="text-xs text-gray-600 mb-2 flex-1 sm:flex-none">{t.farmerLoginDesc}</p>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mx-auto" />
                </CardContent>
              </Card>

              {/* Admin Login Card */}
              <Card
                className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer aspect-square sm:aspect-auto"
                onClick={() => handleNavigation("/admin-login")}
              >
                <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">{t.adminLogin}</h3>
                  <p className="text-xs text-gray-600 mb-2 flex-1 sm:flex-none">{t.adminLoginDesc}</p>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mx-auto" />
                </CardContent>
              </Card>

              {/* Features Card */}
              <Card
                className="bg-gradient-to-br from-orange-100 to-orange-200 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer aspect-square sm:aspect-auto"
                onClick={() => handleNavigation("/features")}
              >
                <CardContent className="p-3 sm:p-4 text-center h-full flex flex-col justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1">{t.features}</h3>
                  <p className="text-xs text-gray-600 mb-2 flex-1 sm:flex-none">{t.featuresDesc}</p>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 mx-auto" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

          {/* Simple Footer */}
          <div className="py-2">
            <p className="text-center text-gray-400 text-xs">
              © 2025 TARIQ Broiler Management
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View - Flutter-style Android App */}
      <div className="md:hidden min-h-screen bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col">
        {/* Modern App Header */}
        <div className="px-4 py-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
                <p className="text-xs text-blue-100">Broiler Management System</p>
              </div>
            </div>
            {/* Language Toggle */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1">
          <Button
            variant={language === "en" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleLanguageChange("en")}
            className={`h-7 px-3 text-xs rounded-full ${language === "en" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}`}
          >
            EN
          </Button>
          <Button
            variant={language === "sw" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleLanguageChange("sw")}
            className={`h-7 px-3 text-xs rounded-full ${language === "sw" ? "bg-white text-blue-600" : "text-white hover:bg-white/20"}`}
          >
            SW
          </Button>
            </div>
          </div>
        </div>

        {/* Main Card Content Area */}
        <div className="flex-1 bg-gray-50 rounded-t-[32px] px-4 py-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Access</h2>
          
          {/* Navigation Cards - Flutter Material Design Style */}
          <div className="space-y-3">
            {/* Broiler Batches Card */}
            <div
              onClick={() => handleNavigation("/batches")}
              className="bg-white rounded-2xl p-4 shadow-md active:shadow-lg active:scale-[0.98] transition-all duration-150"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{t.batches}</h3>
                  <p className="text-xs text-gray-500">{t.batchesDesc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>

            {/* Farmer Login Card */}
            <div
              onClick={() => handleNavigation("/farmer-login")}
              className="bg-white rounded-2xl p-4 shadow-md active:shadow-lg active:scale-[0.98] transition-all duration-150"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <LogIn className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{t.farmerLogin}</h3>
                  <p className="text-xs text-gray-500">{t.farmerLoginDesc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>

            {/* Admin Login Card */}
            <div
              onClick={() => handleNavigation("/admin-login")}
              className="bg-white rounded-2xl p-4 shadow-md active:shadow-lg active:scale-[0.98] transition-all duration-150"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{t.adminLogin}</h3>
                  <p className="text-xs text-gray-500">{t.adminLoginDesc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>

            {/* Features Card */}
            <div
              onClick={() => handleNavigation("/features")}
              className="bg-white rounded-2xl p-4 shadow-md active:shadow-lg active:scale-[0.98] transition-all duration-150"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <Monitor className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-800 mb-1">{t.features}</h3>
                  <p className="text-xs text-gray-500">{t.featuresDesc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 mb-4">
            <p className="text-center text-gray-400 text-xs">
              © 2025 TARIQ Broiler Management
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
