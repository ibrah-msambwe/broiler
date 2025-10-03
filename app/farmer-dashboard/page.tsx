"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Heart,
  LogOut,
  Plus,
  Eye,
  Thermometer,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface User {
  email: string
  role: string
  name: string
  id: string
}

interface Batch {
  id: string
  name: string
  startDate: string
  birdCount: number
  age: number
  status: "Active" | "Pending" | "Completed"
  mortality: number
  temperature: number
  humidity: number
  healthStatus: "Excellent" | "Good" | "Fair" | "Poor"
  feedUsed: number
  currentWeight: number
  feedConversionRatio: number
  vaccinations: number
  lastHealthCheck: string
  notes?: string
}

interface Report {
  id: string
  type: "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination"
  batchId: string
  title: string
  content: string
  status: "Sent" | "Draft" | "Approved" | "Rejected"
  date: string
  priority: "Normal" | "High" | "Urgent"
  adminComment?: string
}

interface Message {
  id: string
  from: string
  to: string
  subject: string
  content: string
  priority: "Normal" | "High" | "Urgent"
  status: "Read" | "Unread"
  date: string
  time: string
  type: "Sent" | "Received"
}

export default function FarmerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [language, setLanguage] = useState<"en" | "sw">("en")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const router = useRouter()

  // Enhanced sample data
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "A-001",
      name: "Premium Batch Alpha",
      startDate: "2025-01-01",
      birdCount: 2000,
      age: 21,
      status: "Active",
      mortality: 50,
      temperature: 32,
      humidity: 65,
      healthStatus: "Good",
      feedUsed: 120,
      currentWeight: 1.8,
      feedConversionRatio: 1.6,
      vaccinations: 3,
      lastHealthCheck: "2025-01-20",
      notes: "High-performance batch showing excellent growth rates",
    },
    {
      id: "A-002",
      name: "Standard Batch Beta",
      startDate: "2025-01-10",
      birdCount: 1500,
      age: 12,
      status: "Active",
      mortality: 30,
      temperature: 31,
      humidity: 68,
      healthStatus: "Excellent",
      feedUsed: 80,
      currentWeight: 1.2,
      feedConversionRatio: 1.5,
      vaccinations: 2,
      lastHealthCheck: "2025-01-19",
      notes: "Standard batch with optimal health indicators",
    },
    {
      id: "MSAMBWE-001",
      name: "MSAMBWE Elite Batch",
      startDate: "2025-01-15",
      birdCount: 200000,
      age: 7,
      status: "Active",
      mortality: 2000,
      temperature: 30,
      humidity: 70,
      healthStatus: "Excellent",
      feedUsed: 8500,
      currentWeight: 0.8,
      feedConversionRatio: 1.4,
      vaccinations: 1,
      lastHealthCheck: "2025-01-21",
      notes: "Large-scale elite batch with premium genetics and exceptional performance",
    },
  ])

  const [reports, setReports] = useState<Report[]>([
    {
      id: "R-001",
      type: "Daily",
      batchId: "A-001",
      title: "Daily Production Report - Week 3",
      content: "Feed consumption: 15kg per 100 birds, Mortality: 2 birds, Health status: Good, Temperature maintained at 32°C",
      status: "Sent",
      date: "2025-01-21",
      priority: "Normal",
    },
    {
      id: "R-002",
      type: "Mortality",
      batchId: "A-002",
      title: "Mortality Incident Report",
      content: "5 birds died due to heat stress during peak afternoon hours. Immediate cooling measures implemented.",
      status: "Approved",
      date: "2025-01-20",
      priority: "High",
      adminComment: "Good response to the incident. Continue monitoring temperature closely.",
    },
    {
      id: "R-003",
      type: "Health",
      batchId: "MSAMBWE-001",
      title: "Weekly Health Assessment",
      content: "Comprehensive health check completed. All indicators within optimal ranges. Vaccination schedule on track.",
      status: "Approved",
      date: "2025-01-19",
      priority: "Normal",
      adminComment: "Excellent work! Keep maintaining these high standards.",
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "M-001",
      from: "Admin",
      to: "Farmer",
      subject: "Batch Performance Commendation",
      content: "Congratulations on the excellent performance of your MSAMBWE Elite Batch. The health indicators are outstanding.",
      priority: "Normal",
      status: "Unread",
      date: "2025-01-21",
      time: "14:30",
      type: "Received",
    },
    {
      id: "M-002",
      from: "Admin",
      to: "Farmer",
      subject: "Feed Supply Confirmation",
      content: "Your request for premium feed has been approved. 500 bags will be delivered next week.",
      priority: "High",
      status: "Unread",
      date: "2025-01-21",
      time: "10:15",
      type: "Received",
    },
    {
      id: "M-003",
      from: "Farmer",
      to: "Admin",
      subject: "Weekly Performance Update",
      content: "All batches performing well. Alpha batch ready for early harvest consideration.",
      priority: "Normal",
      status: "Read",
      date: "2025-01-20",
      time: "16:45",
      type: "Sent",
    },
  ])

  const [newBatch, setNewBatch] = useState({
    name: "",
    birdCount: "",
    expectedStartDate: "",
    notes: "",
  })

  const [newReport, setNewReport] = useState({
    type: "",
    batchId: "",
    title: "",
    content: "",
    priority: "Normal" as "Normal" | "High" | "Urgent",
  })

  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    priority: "Normal" as "Normal" | "High" | "Urgent",
  })

  const translations = {
    en: {
      title: "TARIQ Farmer Dashboard",
      welcome: "Welcome back, Professional Farmer",
      dashboard: "Dashboard",
      batches: "My Batches",
      reports: "Reports",
      messages: "Messages",
      health: "Health Monitor",
      logout: "Logout",
      activeBatches: "Active Batches",
      totalBirds: "Total Birds",
      avgMortality: "Avg Mortality Rate",
      feedConsumption: "Feed Consumption",
      myBatches: "My Professional Batches",
      addNewBatch: "Request New Batch",
      batchName: "Batch Name",
      birdCount: "Bird Count",
      age: "Age",
      status: "Status",
      mortality: "Mortality",
      feedUsed: "Feed Used",
      healthStatus: "Health Status",
      temperature: "Temperature",
      humidity: "Humidity",
      days: "days",
      active: "Active",
      pending: "Pending",
      completed: "Completed",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      createReport: "Create Report",
      reportType: "Report Type",
      selectBatch: "Select Batch",
      reportTitle: "Report Title",
      reportContent: "Report Content",
      sendReport: "Send Report",
      cancel: "Cancel",
      sendMessage: "Send Message",
      messageSubject: "Subject",
      messageContent: "Message Content",
      priority: "Priority",
      normal: "Normal",
      high: "High",
      urgent: "Urgent",
      send: "Send",
      environmentalData: "Environmental Data",
      airQuality: "Air Quality",
      batchHealth: "Batch Health Overview",
      recentActivity: "Recent Activity",
      unreadMessages: "Unread Messages",
      daily: "Daily",
      mortalityReport: "Mortality",
      healthReport: "Health",
      feedReport: "Feed",
      vaccination: "Vaccination",
      sent: "Sent",
      draft: "Draft",
      approved: "Approved",
      rejected: "Rejected",
      read: "Read",
      unread: "Unread",
      received: "Received",
      viewDetails: "View Details",
      performanceMetrics: "Performance Metrics",
      batchOverview: "Batch Overview",
      currentWeight: "Current Weight",
      feedConversionRatio: "Feed Conversion Ratio",
      vaccinations: "Vaccinations",
      lastHealthCheck: "Last Health Check",
      adminComment: "Admin Comment",
      exportPDF: "Export PDF",
    },
    sw: {
      title: "TARIQ Dashibodi ya Mkulima",
      welcome: "Karibu tena, Mkulima Mtaalamu",
      dashboard: "Dashibodi",
      batches: "Makundi Yangu",
      reports: "Ripoti",
      messages: "Ujumbe",
      health: "Ufuatiliaji wa Afya",
      logout: "Ondoka",
      activeBatches: "Makundi Yanayofanya Kazi",
      totalBirds: "Jumla ya Ndege",
      avgMortality: "Kiwango cha Vifo",
      feedConsumption: "Matumizi ya Chakula",
      myBatches: "Makundi Yangu ya Kitaalamu",
      addNewBatch: "Omba Kundi Jipya",
      batchName: "Jina la Kundi",
      birdCount: "Idadi ya Ndege",
      age: "Umri",
      status: "Hali",
      mortality: "Vifo",
      feedUsed: "Chakula Kilichotumika",
      healthStatus: "Hali ya Afya",
      temperature: "Joto",
      humidity: "Unyevu",
      days: "siku",
      active: "Inafanya Kazi",
      pending: "Inasubiri",
      completed: "Imekamilika",
      excellent: "Bora Sana",
      good: "Nzuri",
      fair: "Wastani",
      poor: "Mbaya",
      createReport: "Tengeneza Ripoti",
      reportType: "Aina ya Ripoti",
      selectBatch: "Chagua Kundi",
      reportTitle: "Kichwa cha Ripoti",
      reportContent: "Maudhui ya Ripoti",
      sendReport: "Tuma Ripoti",
      cancel: "Ghairi",
      sendMessage: "Tuma Ujumbe",
      messageSubject: "Mada",
      messageContent: "Maudhui ya Ujumbe",
      priority: "Kipaumbele",
      normal: "Kawaida",
      high: "Juu",
      urgent: "Haraka",
      send: "Tuma",
      environmentalData: "Data ya Mazingira",
      airQuality: "Ubora wa Hewa",
      batchHealth: "Muhtasari wa Afya ya Makundi",
      recentActivity: "Shughuli za Hivi Karibuni",
      unreadMessages: "Ujumbe Ambao Haujasomaewa",
      daily: "Ya Kila Siku",
      mortalityReport: "Vifo",
      healthReport: "Afya",
      feedReport: "Chakula",
      vaccination: "Chanjo",
      sent: "Imetumwa",
      draft: "Rasimu",
      approved: "Imeidhinishwa",
      rejected: "Imekataliwa",
      read: "Imesomwa",
      unread: "Haijasomwa",
      received: "Imepokelewa",
      viewDetails: "Ona Maelezo",
      performanceMetrics: "Vipimo vya Utendaji",
      batchOverview: "Muhtasari wa Kundi",
      currentWeight: "Uzito wa Sasa",
      feedConversionRatio: "Uwiano wa Ubadilishaji wa Chakula",
      vaccinations: "Chanjo",
      lastHealthCheck: "Uchunguzi wa Mwisho wa Afya",
      adminComment: "Maoni ya Msimamizi",
      exportPDF: "Hamisha PDF",
    },
  }

  const t = translations[language]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === "farmer") {
        setUser(parsedUser)
      } else {
        router.push("/farmer-login")
      }
    } else {
      router.push("/farmer-login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleAddBatch = () => {
    const batch: Batch = {
      id: `B-${Date.now()}`,
      name: newBatch.name,
      startDate: newBatch.expectedStartDate,
      birdCount: Number.parseInt(newBatch.birdCount),
      age: 0,
      status: "Pending",
      mortality: 0,
      temperature: 30,
      humidity: 65,
      healthStatus: "Good",
      feedUsed: 0,
      currentWeight: 0.05,
      feedConversionRatio: 1.5,
      vaccinations: 0,
      lastHealthCheck: new Date().toISOString().split("T")[0],
      notes: newBatch.notes,
    }
    setBatches([...batches, batch])
    setNewBatch({ name: "", birdCount: "", expectedStartDate: "", notes: "" })
    setIsAddBatchOpen(false)
  }

  const handleCreateReport = () => {
    const report: Report = {
      id: `R-${Date.now()}`,
      type: newReport.type as "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination",
      batchId: newReport.batchId,
      title: newReport.title,
      content: newReport.content,
      status: "Sent",
      date: new Date().toISOString().split("T")[0],
      priority: newReport.priority,
    }
    setReports([...reports, report])
    setNewReport({ type: "", batchId: "", title: "", content: "", priority: "Normal" })
    setIsCreateReportOpen(false)
  }

  const handleSendMessage = () => {
    const message: Message = {
      id: `M-${Date.now()}`,
      from: "Farmer",
      to: "Admin",
      subject: newMessage.subject,
      content: newMessage.content,
      priority: newMessage.priority,
      status: "Read",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      type: "Sent",
    }
    setMessages([...messages, message])
    setNewMessage({ subject: "", content: "", priority: "Normal" })
    setIsSendMessageOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excellent":
        return "bg-emerald-100 text-emerald-800"
      case "Good":
        return "bg-green-100 text-green-800"
      case "Fair":
        return "bg-yellow-100 text-yellow-800"
      case "Poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Normal":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalBirds = batches.reduce((sum, batch) => sum + batch.birdCount, 0)
  const totalMortality = batches.reduce((sum, batch) => sum + batch.mortality, 0)
  const avgMortalityRate = totalBirds > 0 ? ((totalMortality / totalBirds) * 100).toFixed(2) : "0.00"
  const totalFeedUsed = batches.reduce((sum, batch) => sum + batch.feedUsed, 0)
  const unreadCount = messages.filter((m) => m.status === "Unread").length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your professional dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Professional Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-lg"></div>
                <Image
                  src="/images/chick-hero.png"
                  alt="TARIQ Logo"
                  width={50}
                  height={50}
                  className="relative z-10 drop-shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                    TARIQ
                  </span>
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {" "}
                    BROILER MANAGEMENT
                  </span>
                </h1>
                <p className="text-sm text-gray-600 font-medium">Professional Farmer Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Professional Notifications */}
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {unreadCount} {t.messages}
                </Badge>
              )}

              {/* Language Switcher - HESK Blue Style */}
              <div className="flex items-center gap-0 bg-blue-50 border border-blue-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className={cn("h-8 px-3 text-xs font-normal border-0 rounded-none", language === "en" ? "bg-white border-r border-blue-300 text-blue-800" : "hover:bg-white/50 text-blue-700")}
                >
                  EN
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage("sw")}
                  className={cn("h-8 px-3 text-xs font-normal border-0 rounded-none", language === "sw" ? "bg-white text-blue-800" : "hover:bg-white/50 text-blue-700")}
                >
                  SW
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-8 px-3 text-xs font-normal border-blue-300 rounded-none hover:bg-blue-50 text-blue-700"
              >
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.welcome}</h2>
          <p className="text-gray-600 text-lg">Professional broiler batch management and monitoring system</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white/80 shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <LayoutDashboard className="h-4 w-4" />
              {t.dashboard}
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              {t.batches}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              {t.reports}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 relative data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4" />
              {t.messages}
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Heart className="h-4 w-4" />
              {t.health}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Professional Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-semibold">{t.activeBatches}</p>
                      <p className="text-3xl font-bold text-blue-800">{batches.filter(b => b.status === "Active").length}</p>
                      <p className="text-xs text-blue-600 flex items-center mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        All performing well
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-semibold">{t.totalBirds}</p>
                      <p className="text-3xl font-bold text-green-800">{totalBirds.toLocaleString()}</p>
                      <p className="text-xs text-green-600 flex items-center mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy population
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Activity className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-100 to-red-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-semibold">{t.avgMortality}</p>
                      <p className="text-3xl font-bold text-red-800">{avgMortalityRate}%</p>
                      <p className="text-xs text-red-600 flex items-center mt-2">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Within normal range
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-semibold">{t.feedConsumption}</p>
                      <p className="text-3xl font-bold text-purple-800">{totalFeedUsed}</p>
                      <p className="text-xs text-purple-600 flex items-center mt-2">
                        <Target className="h-3 w-3 mr-1" />
                        Bags consumed
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Activity Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t.recentActivity}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Daily report submitted for Premium Batch Alpha</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">MSAMBWE Elite Batch health check completed</p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Heart className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Vaccination schedule updated for all batches</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Thermometer className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Temperature monitoring system optimized</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t.unreadMessages} ({unreadCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {messages
                        .filter((m) => m.status === "Unread")
                        .map((message) => (
                          <div key={message.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm text-gray-800">{message.subject}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className={getPriorityColor(message.priority)} size="sm">
                                  {message.priority}
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-800" size="sm">
                                  {message.type}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              From: {message.from} • {message.date} at {message.time}
                            </p>
                            <p className="text-sm text-gray-700 mb-3">{message.content.substring(0, 100)}...</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                                <Eye className="h-3 w-3 mr-1" />
                                Read
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t.performanceMetrics}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {batches.slice(0, 3).map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">{batch.name}</h4>
                        <Badge className={getStatusColor(batch.status)} size="sm">
                          {batch.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Birds:</span>
                          <span className="font-semibold">{batch.birdCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-semibold">{batch.age} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Health:</span>
                          <Badge className={getHealthColor(batch.healthStatus)} size="sm">
                            {batch.healthStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">FCR:</span>
                          <span className="font-semibold text-green-600">{batch.feedConversionRatio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-semibold text-blue-600">{batch.currentWeight} kg</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3 bg-blue-500 hover:bg-blue-600">
                        <Eye className="h-3 w-3 mr-1" />
                        {t.viewDetails}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batches Tab */}
          <TabsContent value="batches" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">{t.myBatches}</h3>
              <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 shadow-lg">
                    <Plus className="h-4 w-4" />
                    {t.addNewBatch}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      {t.addNewBatch}
                    </DialogTitle>
                    <DialogDescription>Request a new professional batch to be registered by admin</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="batchName">{t.batchName} *</Label>
                      <Input
                        id="batchName"
                        value={newBatch.name}
                        onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                        placeholder="e.g., Premium Elite Batch"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birdCount">{t.birdCount} *</Label>
                      <Input
                        id="birdCount"
                        type="number"
                        value={newBatch.birdCount}
                        onChange={(e) => setNewBatch({ ...newBatch, birdCount: e.target.value })}
                        placeholder="Enter number of birds"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Expected Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newBatch.expectedStartDate}
                        onChange={(e) => setNewBatch({ ...newBatch, expectedStartDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Professional Notes</Label>
                      <Textarea
                        id="notes"
                        value={newBatch.notes}
                        onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                        placeholder="Additional notes for admin review..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddBatch} className="flex-1 bg-green-500 hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Request Batch
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddBatchOpen(false)}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.map((batch) => (
                <Card key={batch.id} className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {batch.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-800">{batch.name}</CardTitle>
                          <p className="text-sm text-gray-500">ID: {batch.id}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{t.birdCount}</p>
                        <p className="font-bold text-blue-800">{batch.birdCount.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{t.age}</p>
                        <p className="font-bold text-green-800">{batch.age} {t.days}</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{t.mortality}</p>
                        <p className="font-bold text-red-800">{batch.mortality}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Thermometer className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{t.temperature}</p>
                        <p className="font-bold text-purple-800">{batch.temperature}°C</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.healthStatus}:</span>
                        <Badge className={getHealthColor(batch.healthStatus)} size="sm">
                          {batch.healthStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.currentWeight}:</span>
                        <span className="font-semibold">{batch.currentWeight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">FCR:</span>
                        <span className="font-semibold">{batch.feedConversionRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.vaccinations}:</span>
                        <span className="font-semibold">{batch.vaccinations}</span>
                      </div>
                    </div>
                    
                    {batch.notes && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800 font-medium">{batch.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-3">
                      <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600">
                        <Eye className="h-3 w-3 mr-1" />
                        {t.viewDetails}
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-green-50 bg-transparent">
                        <FileText className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">{t.reports}</h3>
              <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 shadow-lg">
                    <Plus className="h-4 w-4" />
                    {t.createReport}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      {t.createReport}
                    </DialogTitle>
                    <DialogDescription>Create a professional report to send to admin</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportType">{t.reportType} *</Label>
                      <Select
                        value={newReport.type}
                        onValueChange={(value) => setNewReport({ ...newReport, type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">{t.daily} Report</SelectItem>
                          <SelectItem value="Mortality">{t.mortalityReport} Report</SelectItem>
                          <SelectItem value="Health">{t.healthReport} Report</SelectItem>
                          <SelectItem value="Feed">{t.feedReport} Report</SelectItem>
                          <SelectItem value="Vaccination">{t.vaccination} Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="batchSelect">{t.selectBatch} *</Label>
                      <Select
                        value={newReport.batchId}
                        onValueChange={(value) => setNewReport({ ...newReport, batchId: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.name} - {batch.birdCount.toLocaleString()} birds
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reportTitle">{t.reportTitle} *</Label>
                      <Input
                        id="reportTitle"
                        value={newReport.title}
                        onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                        placeholder="Enter professional report title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">{t.priority}</Label>
                      <Select
                        value={newReport.priority}
                        onValueChange={(value: "Normal" | "High" | "Urgent") =>
                          setNewReport({
                            ...newReport,
                            priority: value,
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">{t.normal}</SelectItem>
                          <SelectItem value="High">{t.high}</SelectItem>
                          <SelectItem value="Urgent">{t.urgent}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reportContent">{t.reportContent}</Label>
                      <Textarea
                        id="reportContent"
                        value={newReport.content}
                        onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateReport} className="flex-1 bg-purple-500 hover:bg-purple-600">
                        {t.sendReport}
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateReportOpen(false)}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
