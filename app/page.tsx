"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, LogIn, Shield, Monitor, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LandingPage() {
  const [language, setLanguage] = useState<"en" | "sw">("en")
  const router = useRouter()

  const translations = {
    en: {
      title: "Tariq Broiler Management",
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
      title: "Usimamizi wa Kuku wa Nyama wa Tariq",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-green-400 rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 bg-purple-400 rounded-full"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
          <Button
            variant={language === "en" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLanguage("en")}
            className="text-xs font-medium"
          >
            EN
          </Button>
          <Button
            variant={language === "sw" ? "default" : "ghost"}
            size="sm"
            onClick={() => setLanguage("sw")}
            className="text-xs font-medium"
          >
            SW
          </Button>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 3D Letterhead Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200/50 py-4">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex-shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 to-orange-400/50 rounded-full blur-xl transform translate-x-2 translate-y-2"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 to-orange-300/40 rounded-full blur-lg transform translate-x-1 translate-y-1"></div>
                <Image
                  src="/images/chick-hero.png"
                  alt="Tariq Broiler Management Logo"
                  width={60}
                  height={60}
                  className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110"
                  style={{
                    filter:
                      "drop-shadow(0 10px 20px rgba(0,0,0,0.4)) drop-shadow(0 6px 12px rgba(255,165,0,0.5)) drop-shadow(0 3px 6px rgba(255,140,0,0.3))",
                  }}
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 relative">
                  {/* Multiple 3D shadow layers with reduced sizing */}
                  <span className="absolute inset-0 blur-lg opacity-40 transform translate-x-2 translate-y-2">
                    <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent font-black">
                      TARIQ
                    </span>
                    <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                      {" "}
                      BROILER{" "}
                    </span>
                    <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-bold">
                      MANAGEMENT
                    </span>
                  </span>
                  <span className="absolute inset-0 blur-md opacity-50 transform translate-x-1 translate-y-1">
                    <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-black">
                      TARIQ
                    </span>
                    <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-bold">
                      {" "}
                      BROILER{" "}
                    </span>
                    <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                      MANAGEMENT
                    </span>
                  </span>
                  <span className="absolute inset-0 blur-sm opacity-60 transform translate-x-0.5 translate-y-0.5">
                    <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent font-black">
                      TARIQ
                    </span>
                    <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                      {" "}
                      BROILER{" "}
                    </span>
                    <span className="bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 bg-clip-text text-transparent font-bold">
                      MANAGEMENT
                    </span>
                  </span>
                  {/* Main text with reduced uniform sizing */}
                  <span
                    className="relative z-10"
                    style={{
                      textShadow:
                        "3px 3px 6px rgba(0,0,0,0.4), 0 0 15px rgba(59,130,246,0.5), 0 0 30px rgba(34,197,94,0.3), 2px 2px 4px rgba(255,165,0,0.6)",
                    }}
                  >
                    <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent font-black tracking-wider">
                      TARIQ
                    </span>
                    <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                      {" "}
                      BROILER{" "}
                    </span>
                    <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                      MANAGEMENT
                    </span>
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          {/* 2x2 Grid Navigation Cards */}
          <div className="w-full max-w-2xl">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* Broiler Batches Card */}
              <Card
                className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden"
                onClick={() => handleNavigation("/batches")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-4 sm:p-6 text-center relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t.batches}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{t.batchesDesc}</p>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mx-auto group-hover:translate-x-1 transition-transform duration-300" />
                </CardContent>
              </Card>

              {/* Farmer Login Card */}
              <Card
                className="bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden"
                onClick={() => handleNavigation("/farmer-login")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-4 sm:p-6 text-center relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t.farmerLogin}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{t.farmerLoginDesc}</p>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mx-auto group-hover:translate-x-1 transition-transform duration-300" />
                </CardContent>
              </Card>

              {/* Admin Login Card */}
              <Card
                className="bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden"
                onClick={() => handleNavigation("/admin-login")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-4 sm:p-6 text-center relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t.adminLogin}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{t.adminLoginDesc}</p>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mx-auto group-hover:translate-x-1 transition-transform duration-300" />
                </CardContent>
              </Card>

              {/* Features Card */}
              <Card
                className="bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group relative overflow-hidden"
                onClick={() => handleNavigation("/features")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-4 sm:p-6 text-center relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t.features}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{t.featuresDesc}</p>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mx-auto group-hover:translate-x-1 transition-transform duration-300" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 py-3">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-center text-gray-500 text-xs">
              © 2025{" "}
              <span className="font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                TARIQ
              </span>{" "}
              Broiler Management. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
