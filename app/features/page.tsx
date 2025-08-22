"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, BarChart3, Shield, Smartphone, Cloud, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function FeaturesPage() {
  const router = useRouter()

  const features = [
    {
      icon: Users,
      title: "Batch Management",
      description: "Comprehensive tracking and management of poultry batches from chick to harvest",
      color: "bg-blue-500",
      benefits: ["Real-time monitoring", "Growth tracking", "Health records", "Feed management"],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed analytics and reporting for informed decision making",
      color: "bg-green-500",
      benefits: ["Performance metrics", "Financial reports", "Trend analysis", "Export capabilities"],
    },
    {
      icon: Shield,
      title: "Admin Controls",
      description: "Powerful administrative tools for farm management and user control",
      color: "bg-purple-500",
      benefits: ["User management", "System settings", "Access control", "Data backup"],
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Responsive design that works perfectly on all devices",
      color: "bg-orange-500",
      benefits: ["Mobile optimized", "Touch friendly", "Offline capable", "Cross-platform"],
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Secure cloud-based data storage with automatic backups",
      color: "bg-cyan-500",
      benefits: ["Data security", "Auto backups", "Remote access", "Scalable storage"],
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Smart notifications for important farm events and milestones",
      color: "bg-red-500",
      benefits: ["Real-time alerts", "Custom notifications", "Email integration", "Mobile push"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-lg transform translate-x-1 translate-y-1"></div>
                <Image
                  src="/images/chick-hero.png"
                  alt="Ramsa Family Farm"
                  width={40}
                  height={40}
                  className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110"
                  style={{
                    filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3)) drop-shadow(0 3px 6px rgba(255,165,0,0.4))",
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
                    Ramsa Family Farm
                  </span>
                </h1>
                <p className="text-sm text-gray-500">System Features</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-lg transform translate-x-2 translate-y-2"></div>
            <Image
              src="/images/chick-hero.png"
              alt="Features"
              width={120}
              height={120}
              className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110 mx-auto"
              style={{
                filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.3)) drop-shadow(0 6px 12px rgba(255,165,0,0.4))",
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 relative">
            <span
              className="relative z-10"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              System Features
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful features that make Ramsa Family Farm the perfect solution for modern poultry
            management
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Built with Modern Technology</CardTitle>
            <CardDescription className="text-gray-600">
              Our system is built using cutting-edge technologies for reliability and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Next.js", description: "React Framework" },
                { name: "TypeScript", description: "Type Safety" },
                { name: "Tailwind CSS", description: "Modern Styling" },
                { name: "Supabase", description: "Database & Auth" },
              ].map((tech, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <Badge className="mb-2">{tech.name}</Badge>
                  <p className="text-xs text-gray-600">{tech.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join Ramsa Family Farm today and experience the future of poultry management. Our system is designed to
                help you maximize productivity and profitability.
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => router.push("/batches")}
                  className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-8 py-3 text-lg"
                >
                  Register Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/farmer-login")}
                  className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg"
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
