"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  BarChart3,
  Database,
  FileText,
  MessageSquare,
  Shield,
  Phone,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function BatchesPage() {
  const [language, setLanguage] = useState("en")
  const router = useRouter()

  const translations = {
    en: {
      title: "TARIQ Broiler Manager",
      subtitle: "Professional Broiler Farm Management System",
      backToHome: "Back to Home",
      accessMessage: "To access the system, please contact your administrator",
      keyFeatures: "Key System Features",
      getAccess: "Get Access",
    },
    sw: {
      title: "Usimamizi wa Kuku wa Nyama wa Tariq",
      subtitle: "Mfumo wa Usimamizi wa Shamba la Kuku wa Nyama",
      backToHome: "Rudi Nyumbani",
      accessMessage: "Ili kufikia mfumo, tafadhali wasiliana na msimamizi wako",
      keyFeatures: "Vipengele Muhimu vya Mfumo",
      getAccess: "Pata Ufikiaji",
    },
  }

  const t = translations[language as keyof typeof translations]

  const keyFeatures = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live monitoring of batch performance, mortality rates, and feed conversion ratios",
      color: "bg-blue-500"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Comprehensive tracking of batches, farmers, and farm profiles",
      color: "bg-green-500"
    },
    {
      icon: FileText,
      title: "Reporting System",
      description: "Automated daily reports, health checks, and performance metrics",
      color: "bg-purple-500"
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Direct messaging between farmers and administrators",
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Simple Header */}
      <div className="pt-2 pb-1 px-3 sm:pt-4 sm:pb-2 sm:px-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-white"
            >
              <option value="en">EN</option>
              <option value="sw">SW</option>
            </select>
            <Button variant="outline" onClick={() => router.push("/")} size="sm" className="text-xs px-2 py-1 sm:px-3 sm:py-1.5">
              <ArrowLeft className="h-3 w-3 mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">{t.backToHome}</span>
              <span className="xs:hidden">Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Call Admin Section */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-2xl p-4 shadow-xl mb-4">
            <p className="text-lg text-blue-800 font-semibold">
              📞 Call Admin: <span className="font-bold">+255 614 818 024</span> - Tariq
            </p>
          </div>
          
          {/* Access Message */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 max-w-xs xs:max-w-sm sm:max-w-md md:max-w-2xl mx-auto shadow-xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-blue-800 mb-4">
                {t.accessMessage}
              </h2>
              <p className="text-blue-700 text-lg">
                This system is restricted to authorized users only. Please contact your administrator to get access credentials.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            {t.keyFeatures}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl mx-auto">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
