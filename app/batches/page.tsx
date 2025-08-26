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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-xl transform translate-x-2 translate-y-2"></div>
                <Image
                  src="/images/chick-hero.png"
                  alt="TARIQ Broiler Manager"
                  width={40}
                  height={40}
                  className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110"
                  style={{
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(255,165,0,0.4))",
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 relative">
                  <span
                    className="relative z-10"
                    style={{
                      textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                      TARIQ
                    </span>{" "}
                    Broiler Manager
                  </span>
                </h1>
                <p className="text-sm text-gray-500">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white/80"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
              <Button variant="outline" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToHome}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Call Admin Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-2xl p-6 shadow-xl mb-8">
            <p className="text-lg text-blue-800 font-semibold">
              📞 Call Admin: <span className="font-bold">+255 614 818 024</span> - Tariq
            </p>
          </div>
          
          {/* Access Message */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 max-w-2xl mx-auto shadow-xl">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
