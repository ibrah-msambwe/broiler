"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Building,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  FileText,
  Download,
  MoreVertical,
  UserPlus,
  Palette,
  Globe,
  Bell,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock,
  Thermometer,
  Heart,
  Send,
  X,
  Check,
  Star,
  Target,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminShell from "@/components/admin/admin-shell"
import { supabase } from "@/lib/supabase"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface User {
  email: string
  role: string
  name: string
  id: string
}

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  status: "Active" | "Inactive"
  totalBatches: number
  totalBirds: number
  profileImage?: string
}

interface Batch {
  id: string
  name: string
  farmerId: string
  farmerName: string
  startDate: string
  birdCount: number
  age: number
  status: "Active" | "Completed" | "Planning"
  mortality: number
  feedUsed: number
  healthStatus: "Excellent" | "Good" | "Fair" | "Poor"
  temperature: number
  humidity: number
  username: string
  password: string
  color: string
  notes?: string
  expectedHarvestDate: string
  currentWeight: number
  feedConversionRatio: number
  vaccinations: number
  lastHealthCheck: string
}

interface Report {
  id: string
  type: "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination"
  batchId: string
  batchName: string
  farmerName: string
  title: string
  content: string
  status: "Pending" | "Approved" | "Rejected"
  date: string
  priority: "Normal" | "High" | "Urgent"
  data: {
    feedUsed?: number
    mortalityCount?: number
    temperature?: number
    humidity?: number
    medicineUsed?: string
    healthNotes?: string
    openCount?: number
    closeCount?: number
    weight?: number
  }
  adminComment?: string
}

interface Message {
  id: string
  from: string
  to: string
  subject: string
  content: string
  status: "Read" | "Unread"
  date: string
  time: string
  type: "Report" | "General" | "Alert" | "System"
  priority: "Normal" | "High" | "Urgent"
}

interface FarmProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  description?: string
  ownerName?: string
  establishedDate?: string
  status?: "Active" | "Inactive"
  rating?: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [language, setLanguage] = useState<"en" | "sw">("en")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isBatchDetailOpen, setIsBatchDetailOpen] = useState(false)
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false)
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)
  const [adminComment, setAdminComment] = useState("")
  const router = useRouter()

  // Farm profile (single farm)
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>({
    id: "FARM-001",
    name: "TARIQ POULTRY FARM",
    email: "info@tariqfarm.com",
    phone: "+255 700 000 000",
    address: "Dar es Salaam, Tanzania",
    logoUrl: "/placeholder-logo.png",
    description: "Premium broiler production with professional standards.",
    ownerName: "Tariq Ahmed",
    establishedDate: "2020-05-10",
    status: "Active",
    rating: 5,
  })
  const [isEditFarmOpen, setIsEditFarmOpen] = useState(false)
  const [isViewFarmOpen, setIsViewFarmOpen] = useState(false)
  const [draftFarm, setDraftFarm] = useState<FarmProfile>({
    id: "FARM-001",
    name: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
    description: "",
    ownerName: "",
    establishedDate: "",
    status: "Active",
    rating: 0,
  })

  // Enhanced sample data
  const [farmers, setFarmers] = useState<Farmer[]>([
    {
      id: "F001",
      name: "John Mkulima",
      email: "john@tariqfarm.com",
      phone: "+255 123 456 789",
      address: "Dar es Salaam, Tanzania",
      joinDate: "2024-01-15",
      status: "Active",
      totalBatches: 3,
      totalBirds: 5000,
    },
    {
      id: "F002",
      name: "Mary Farmer",
      email: "mary@tariqfarm.com",
      phone: "+255 987 654 321",
      address: "Arusha, Tanzania",
      joinDate: "2024-02-20",
      status: "Active",
      totalBatches: 2,
      totalBirds: 3000,
    },
    {
      id: "F003",
      name: "Ibrahim Msambwe",
      email: "ibrahim@tariqfarm.com",
      phone: "+255 456 789 123",
      address: "Mwanza, Tanzania",
      joinDate: "2024-03-10",
      status: "Active",
      totalBatches: 1,
      totalBirds: 200000,
    },
  ])

  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "B001",
      name: "Alpha Premium Batch",
      farmerId: "F001",
      farmerName: "John Mkulima",
      startDate: "2025-01-01",
      birdCount: 2000,
      age: 21,
      status: "Active",
      mortality: 50,
      feedUsed: 120,
      healthStatus: "Good",
      temperature: 32,
      humidity: 65,
      username: "batch_alpha",
      password: "alpha123",
      color: "bg-blue-500",
      expectedHarvestDate: "2025-02-15",
      currentWeight: 1.8,
      feedConversionRatio: 1.6,
      vaccinations: 3,
      lastHealthCheck: "2025-01-20",
      notes: "High-performance batch with excellent growth rate",
    },
    {
      id: "B002",
      name: "Beta Standard Batch",
      farmerId: "F001",
      farmerName: "John Mkulima",
      startDate: "2025-01-10",
      birdCount: 1500,
      age: 12,
      status: "Active",
      mortality: 30,
      feedUsed: 80,
      healthStatus: "Excellent",
      temperature: 31,
      humidity: 68,
      username: "batch_beta",
      password: "beta123",
      color: "bg-green-500",
      expectedHarvestDate: "2025-02-25",
      currentWeight: 1.2,
      feedConversionRatio: 1.5,
      vaccinations: 2,
      lastHealthCheck: "2025-01-19",
      notes: "Standard batch with good health indicators",
    },
    {
      id: "B003",
      name: "MSAMBWE Elite Batch",
      farmerId: "F003",
      farmerName: "Ibrahim Msambwe",
      startDate: "2025-01-15",
      birdCount: 200000,
      age: 7,
      status: "Active",
      mortality: 2000,
      feedUsed: 8500,
      healthStatus: "Excellent",
      temperature: 30,
      humidity: 70,
      username: "msambwe_elite",
      password: "elite2025",
      color: "bg-purple-500",
      expectedHarvestDate: "2025-03-01",
      currentWeight: 0.8,
      feedConversionRatio: 1.4,
      vaccinations: 1,
      lastHealthCheck: "2025-01-21",
      notes: "Large-scale elite batch with premium genetics",
    },
  ])

  const [reports, setReports] = useState<Report[]>([
    {
      id: "R001",
      type: "Daily",
      batchId: "B001",
      batchName: "Alpha Premium Batch",
      farmerName: "John Mkulima",
      title: "Daily Production Report - Week 3",
      content:
        "Daily monitoring shows excellent progress. Birds are healthy and active with good feed consumption rates.",
      status: "Pending",
      date: "2025-01-21",
      priority: "Normal",
      data: {
        feedUsed: 15,
        temperature: 32,
        humidity: 65,
        openCount: 1950,
        closeCount: 1948,
        weight: 1.8,
      },
    },
    {
      id: "R002",
      type: "Mortality",
      batchId: "B002",
      batchName: "Beta Standard Batch",
      farmerName: "John Mkulima",
      title: "Mortality Incident Report",
      content: "5 birds died due to heat stress during peak afternoon hours. Immediate cooling measures implemented.",
      status: "Pending",
      date: "2025-01-20",
      priority: "High",
      data: {
        mortalityCount: 5,
        temperature: 35,
        healthNotes: "Heat stress symptoms observed. Ventilation improved.",
      },
    },
    {
      id: "R003",
      type: "Health",
      batchId: "B003",
      batchName: "MSAMBWE Elite Batch",
      farmerName: "Ibrahim Msambwe",
      title: "Weekly Health Assessment",
      content:
        "Comprehensive health check completed. All indicators within optimal ranges. Vaccination schedule on track.",
      status: "Approved",
      date: "2025-01-19",
      priority: "Normal",
      data: {
        temperature: 30,
        humidity: 70,
        healthNotes: "Excellent health status. No signs of disease.",
        medicineUsed: "Multivitamins, Probiotics",
      },
      adminComment: "Excellent work! Keep maintaining these standards.",
    },
    {
      id: "R004",
      type: "Feed",
      batchId: "B001",
      batchName: "Alpha Premium Batch",
      farmerName: "John Mkulima",
      title: "Feed Consumption Analysis",
      content: "Weekly feed analysis shows optimal consumption patterns. Feed conversion ratio improving steadily.",
      status: "Approved",
      date: "2025-01-18",
      priority: "Normal",
      data: {
        feedUsed: 105,
        weight: 1.8,
        openCount: 1950,
        closeCount: 1950,
      },
      adminComment: "Good feed management. Continue current feeding schedule.",
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "M001",
      from: "John Mkulima",
      to: "Admin",
      subject: "Urgent: Veterinary Assistance Required",
      content:
        "Some birds in Alpha Premium Batch showing signs of respiratory distress. Need immediate veterinary consultation.",
      status: "Unread",
      date: "2025-01-21",
      time: "14:30",
      type: "Alert",
      priority: "Urgent",
    },
    {
      id: "M002",
      from: "Ibrahim Msambwe",
      to: "Admin",
      subject: "Feed Supply Request",
      content: "Running low on premium feed for MSAMBWE Elite Batch. Need to order 500 bags for next week.",
      status: "Unread",
      date: "2025-01-21",
      time: "10:15",
      type: "General",
      priority: "High",
    },
    {
      id: "M003",
      from: "Mary Farmer",
      to: "Admin",
      subject: "Batch Performance Update",
      content: "Gamma batch showing excellent growth rates. Expecting early harvest by 2 days.",
      status: "Read",
      date: "2025-01-20",
      time: "16:45",
      type: "Report",
      priority: "Normal",
    },
  ])

  const [newFarmer, setNewFarmer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const [newBatch, setNewBatch] = useState({
    name: "",
    farmerId: "",
    birdCount: "",
    startDate: "",
    username: "",
    password: "",
    color: "bg-blue-500",
    notes: "",
  })

  const translations = {
    en: {
      title: "TARIQ Broiler Management - Admin Dashboard",
      welcome: "Welcome back, Administrator",
      dashboard: "Dashboard",
      farmerProfiles: "Farmer Profiles",
      batchManagement: "Batch Management",
      groupChart: "Analytics & Reports",
      systemSettings: "System Settings",
      logout: "Logout",
      totalChicks: "Total Chicks",
      totalBatches: "Total Batches",
      totalMortality: "Total Mortality",
      activeFarmers: "Active Farmers",
      addNewFarmer: "Add New Farmer",
      addNewBatch: "Add New Batch",
      viewDetails: "View Details",
      edit: "Edit",
      delete: "Delete",
      approve: "Approve",
      reject: "Reject",
      export: "Export PDF",
      batchDetails: "Batch Details",
      reports: "Reports",
      messages: "Messages",
      settings: "Settings",
      theme: "Theme",
      language: "Language",
      light: "Light",
      dark: "Dark",
      english: "English",
      swahili: "Swahili",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      birdCount: "Bird Count",
      age: "Age",
      mortality: "Mortality",
      feedUsed: "Feed Used",
      healthStatus: "Health Status",
      temperature: "Temperature",
      humidity: "Humidity",
      username: "Username",
      password: "Password",
      selectFarmer: "Select Farmer",
      selectColor: "Select Color",
      daily: "Daily",
      mortalityReport: "Mortality",
      health: "Health",
      feed: "Feed",
      vaccination: "Vaccination",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      normal: "Normal",
      high: "High",
      urgent: "Urgent",
      read: "Read",
      unread: "Unread",
      general: "General",
      alert: "Alert",
      report: "Report",
      system: "System",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      viewReport: "View Report",
      reportDetails: "Report Details",
      adminComment: "Admin Comment",
      addComment: "Add Comment",
      sendComment: "Send Comment",
      exportPDF: "Export PDF",
      batchOverview: "Batch Overview",
      performanceMetrics: "Performance Metrics",
      recentActivity: "Recent Activity",
      pendingReports: "Pending Reports",
      unreadMessages: "Unread Messages",
      batchInformation: "Batch Information",
      environmentalData: "Environmental Data",
      productionData: "Production Data",
      healthMetrics: "Health Metrics",
    },
    sw: {
      title: "TARIQ Usimamizi wa Kuku wa Nyama - Dashibodi ya Msimamizi",
      welcome: "Karibu tena, Msimamizi",
      dashboard: "Dashibodi",
      farmerProfiles: "Wasifu wa Wakulima",
      batchManagement: "Usimamizi wa Makundi",
      groupChart: "Uchambuzi na Ripoti",
      systemSettings: "Mipangilio ya Mfumo",
      logout: "Ondoka",
      totalChicks: "Jumla ya Vifaranga",
      totalBatches: "Jumla ya Makundi",
      totalMortality: "Jumla ya Vifo",
      activeFarmers: "Wakulima Wanaofanya Kazi",
      addNewFarmer: "Ongeza Mkulima Mpya",
      addNewBatch: "Ongeza Kundi Jipya",
      viewDetails: "Ona Maelezo",
      edit: "Hariri",
      delete: "Futa",
      approve: "Idhinisha",
      reject: "Kataa",
      export: "Hamisha PDF",
      batchDetails: "Maelezo ya Kundi",
      reports: "Ripoti",
      messages: "Ujumbe",
      settings: "Mipangilio",
      theme: "Mandhari",
      language: "Lugha",
      light: "Mwanga",
      dark: "Giza",
      english: "Kiingereza",
      swahili: "Kiswahili",
      save: "Hifadhi",
      cancel: "Ghairi",
      close: "Funga",
      name: "Jina",
      email: "Barua Pepe",
      phone: "Simu",
      address: "Anwani",
      status: "Hali",
      active: "Inafanya Kazi",
      inactive: "Haifanyi Kazi",
      birdCount: "Idadi ya Ndege",
      age: "Umri",
      mortality: "Vifo",
      feedUsed: "Chakula Kilichotumika",
      healthStatus: "Hali ya Afya",
      temperature: "Joto",
      humidity: "Unyevu",
      username: "Jina la Mtumiaji",
      password: "Nywila",
      selectFarmer: "Chagua Mkulima",
      selectColor: "Chagua Rangi",
      daily: "Ya Kila Siku",
      mortalityReport: "Vifo",
      health: "Afya",
      feed: "Chakula",
      vaccination: "Chanjo",
      pending: "Inasubiri",
      approved: "Imeidhinishwa",
      rejected: "Imekataliwa",
      normal: "Kawaida",
      high: "Juu",
      urgent: "Haraka",
      read: "Imesomwa",
      unread: "Haijasomwa",
      general: "Jumla",
      alert: "Tahadhari",
      report: "Ripoti",
      system: "Mfumo",
      excellent: "Bora Sana",
      good: "Nzuri",
      fair: "Wastani",
      poor: "Mbaya",
      viewReport: "Ona Ripoti",
      reportDetails: "Maelezo ya Ripoti",
      adminComment: "Maoni ya Msimamizi",
      addComment: "Ongeza Maoni",
      sendComment: "Tuma Maoni",
      exportPDF: "Hamisha PDF",
      batchOverview: "Muhtasari wa Kundi",
      performanceMetrics: "Vipimo vya Utendaji",
      recentActivity: "Shughuli za Hivi Karibuni",
      pendingReports: "Ripoti Zinazosubiri",
      unreadMessages: "Ujumbe Ambao Haujasomaewa",
      batchInformation: "Maelezo ya Kundi",
      environmentalData: "Data ya Mazingira",
      productionData: "Data ya Uzalishaji",
      healthMetrics: "Vipimo vya Afya",
    },
  }

  const t = translations[language]

  useEffect(() => {
    fetch('/api/admin/candidates').then(r => r.json()).then(j => setCandidates(j.candidates || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === "admin") {
        setUser(parsedUser)
      } else {
        router.push("/admin-login")
      }
    } else {
      router.push("/admin-login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleAddFarmer = () => {
    const farmer: Farmer = {
      id: `F${String(farmers.length + 1).padStart(3, "0")}`,
      name: newFarmer.name,
      email: newFarmer.email,
      phone: newFarmer.phone,
      address: newFarmer.address,
      joinDate: new Date().toISOString().split("T")[0],
      status: "Active",
      totalBatches: 0,
      totalBirds: 0,
    }
    setFarmers([...farmers, farmer])
    setNewFarmer({ name: "", email: "", phone: "", address: "" })
    setIsAddFarmerOpen(false)
  }

  const handleAddBatch = () => {
    const selectedFarmer = farmers.find((f) => f.id === newBatch.farmerId)
    const batch: Batch = {
      id: `B${String(batches.length + 1).padStart(3, "0")}`,
      name: newBatch.name,
      farmerId: newBatch.farmerId,
      farmerName: selectedFarmer?.name || "",
      startDate: newBatch.startDate,
      birdCount: Number.parseInt(newBatch.birdCount),
      age: 0,
      status: "Planning",
      mortality: 0,
      feedUsed: 0,
      healthStatus: "Good",
      temperature: 30,
      humidity: 65,
      username: newBatch.username,
      password: newBatch.password,
      color: newBatch.color,
      notes: newBatch.notes,
      expectedHarvestDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currentWeight: 0.05,
      feedConversionRatio: 1.5,
      vaccinations: 0,
      lastHealthCheck: new Date().toISOString().split("T")[0],
    }
    setBatches([...batches, batch])
    setNewBatch({
      name: "",
      farmerId: "",
      birdCount: "",
      startDate: "",
      username: "",
      password: "",
      color: "bg-blue-500",
      notes: "",
    })
    setIsAddBatchOpen(false)
  }

  const handleViewBatchDetails = (batch: Batch) => {
    setSelectedBatch(batch)
    setIsBatchDetailOpen(true)
  }

  const handleViewReportDetails = (report: Report) => {
    setSelectedReport(report)
    setIsReportDetailOpen(true)
  }

  const handleApproveReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, status: "Approved" as const, adminComment: adminComment || "Approved" } : r,
      ),
    )
    setAdminComment("")
  }

  const handleRejectReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId
          ? { ...r, status: "Rejected" as const, adminComment: adminComment || "Rejected - needs revision" }
          : r,
      ),
    )
    setAdminComment("")
  }

  const handleExportPDF = (type: "batch" | "report", data: Batch | Report) => {
    let content = ""
    let filename = ""

    if (type === "batch" && "birdCount" in data) {
      const batch = data as Batch
      content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TARIQ Broiler Management - Batch Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #dc2626; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .title { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #666; font-size: 16px; }
        .section { margin: 30px 0; }
        .section-title { color: #1f2937; font-size: 20px; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .info-item { background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; }
        .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 18px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-active { background: #dcfce7; color: #166534; }
        .status-excellent { background: #dbeafe; color: #1d4ed8; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .metric { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .metric-label { font-size: 12px; color: #64748b; margin-top: 5px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .export-info { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe; }
        .notes { background: #fefce8; padding: 15px; border-radius: 8px; border: 1px solid #fde047; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TARIQ BROILER MANAGEMENT</div>
        <div class="title">Professional Batch Report</div>
        <div class="subtitle">Comprehensive Batch Analysis & Performance Metrics</div>
    </div>

    <div class="export-info">
        <strong>📊 Export Details:</strong><br>
        Batch ID: ${batch.id}<br>
        Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
        Report Type: Comprehensive Batch Analysis<br>
        Status: ${batch.status}
    </div>

    <div class="section">
        <div class="section-title">🐔 Batch Overview</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Batch Name</div>
                <div class="info-value">${batch.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Farmer</div>
                <div class="info-value">${batch.farmerName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Start Date</div>
                <div class="info-value">${batch.startDate}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Expected Harvest</div>
                <div class="info-value">${batch.expectedHarvestDate}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                    <span class="status-badge status-active">${batch.status}</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Health Status</div>
                <div class="info-value">
                    <span class="status-badge status-excellent">${batch.healthStatus}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📈 Performance Metrics</div>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${batch.birdCount.toLocaleString()}</div>
                <div class="metric-label">Total Birds</div>
            </div>
            <div class="metric">
                <div class="metric-value">${batch.age}</div>
                <div class="metric-label">Age (Days)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${batch.currentWeight}</div>
                <div class="metric-label">Avg Weight (kg)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${batch.feedConversionRatio}</div>
                <div class="metric-label">FCR</div>
            </div>
            <div class="metric">
                <div class="metric-value">${batch.mortality}</div>
                <div class="metric-label">Mortality Count</div>
            </div>
            <div class="metric">
                <div class="metric-value">${((batch.mortality / batch.birdCount) * 100).toFixed(2)}%</div>
                <div class="metric-label">Mortality Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${batch.feedUsed}</div>
                <div class="metric-label">Feed Used (bags)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${batch.vaccinations}</div>
                <div class="metric-label">Vaccinations</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🌡️ Environmental Conditions</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Temperature</div>
                <div class="info-value">${batch.temperature}°C</div>
            </div>
            <div class="info-item">
                <div class="info-label">Humidity</div>
                <div class="info-value">${batch.humidity}%</div>
            </div>
            <div class="info-item">
                <div class="info-label">Last Health Check</div>
                <div class="info-value">${batch.lastHealthCheck}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Access Credentials</div>
                <div class="info-value">${batch.username} / ${batch.password}</div>
            </div>
        </div>
    </div>

    ${
      batch.notes
        ? `
    <div class="section">
        <div class="section-title">📝 Additional Notes</div>
        <div class="notes">
            ${batch.notes}
        </div>
    </div>
    `
        : ""
    }

    <div class="section">
        <div class="section-title">📊 Performance Analysis</div>
        <div class="info-item">
            <div class="info-label">Overall Performance</div>
            <div class="info-value">
                ${
                  batch.healthStatus === "Excellent" && batch.mortality / batch.birdCount < 0.05
                    ? "🌟 Outstanding Performance"
                    : batch.healthStatus === "Good" && batch.mortality / batch.birdCount < 0.1
                      ? "✅ Good Performance"
                      : "⚠️ Needs Attention"
                }
            </div>
        </div>
    </div>

    <div class="footer">
        <strong>Export ID:</strong> ${Date.now()}<br>
        <strong>Generated By:</strong> TARIQ Broiler Management System<br>
        © 2025 TARIQ Broiler Management - Professional Poultry Solutions<br>
        📧 Contact: admin@tariqbroiler.com | 📞 +255 123 456 789
    </div>
</body>
</html>
      `
      filename = `TARIQ-Batch-${batch.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`
    } else if (type === "report" && "type" in data) {
      const report = data as Report
      content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TARIQ Broiler Management - Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #dc2626; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .title { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .subtitle { color: #666; font-size: 16px; }
        .section { margin: 30px 0; }
        .section-title { color: #1f2937; font-size: 20px; font-weight: bold; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .info-item { background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; }
        .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 16px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-rejected { background: #fecaca; color: #991b1b; }
        .priority-urgent { background: #fecaca; color: #991b1b; }
        .priority-high { background: #fed7aa; color: #9a3412; }
        .priority-normal { background: #dbeafe; color: #1d4ed8; }
        .content-box { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 15px 0; }
        .data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .data-item { text-align: center; padding: 15px; background: #f1f5f9; border-radius: 8px; }
        .data-value { font-size: 20px; font-weight: bold; color: #1e40af; }
        .data-label { font-size: 12px; color: #64748b; margin-top: 5px; }
        .comment-box { background: #fefce8; padding: 15px; border-radius: 8px; border: 1px solid #fde047; margin: 15px 0; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TARIQ BROILER MANAGEMENT</div>
        <div class="title">Professional Report Analysis</div>
        <div class="subtitle">${report.type} Report - Detailed Documentation</div>
    </div>

    <div class="section">
        <div class="section-title">📋 Report Information</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Report ID</div>
                <div class="info-value">${report.id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Type</div>
                <div class="info-value">${report.type}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Batch</div>
                <div class="info-value">${report.batchName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Farmer</div>
                <div class="info-value">${report.farmerName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${report.date}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Priority</div>
                <div class="info-value">
                    <span class="status-badge priority-${report.priority.toLowerCase()}">${report.priority}</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                    <span class="status-badge status-${report.status.toLowerCase()}">${report.status}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📝 Report Content</div>
        <div class="content-box">
            <h3>${report.title}</h3>
            <p>${report.content}</p>
        </div>
    </div>

    ${
      Object.keys(report.data).length > 0
        ? `
    <div class="section">
        <div class="section-title">📊 Report Data</div>
        <div class="data-grid">
            ${
              report.data.feedUsed
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.feedUsed}</div>
                <div class="data-label">Feed Used (kg)</div>
            </div>
            `
                : ""
            }
            ${
              report.data.mortalityCount
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.mortalityCount}</div>
                <div class="data-label">Mortality Count</div>
            </div>
            `
                : ""
            }
            ${
              report.data.temperature
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.temperature}°C</div>
                <div class="data-label">Temperature</div>
            </div>
            `
                : ""
            }
            ${
              report.data.humidity
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.humidity}%</div>
                <div class="data-label">Humidity</div>
            </div>
            `
                : ""
            }
            ${
              report.data.openCount
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.openCount}</div>
                <div class="data-label">Opening Count</div>
            </div>
            `
                : ""
            }
            ${
              report.data.closeCount
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.closeCount}</div>
                <div class="data-label">Closing Count</div>
            </div>
            `
                : ""
            }
            ${
              report.data.weight
                ? `
            <div class="data-item">
                <div class="data-value">${report.data.weight} kg</div>
                <div class="data-label">Average Weight</div>
            </div>
            `
                : ""
            }
        </div>
        ${
          report.data.medicineUsed
            ? `
        <div class="info-item">
            <div class="info-label">Medicine Used</div>
            <div class="info-value">${report.data.medicineUsed}</div>
        </div>
        `
            : ""
        }
        ${
          report.data.healthNotes
            ? `
        <div class="info-item">
            <div class="info-label">Health Notes</div>
            <div class="info-value">${report.data.healthNotes}</div>
        </div>
        `
            : ""
        }
    </div>
    `
        : ""
    }

    ${
      report.adminComment
        ? `
    <div class="section">
        <div class="section-title">💬 Admin Comment</div>
        <div class="comment-box">
            ${report.adminComment}
        </div>
    </div>
    `
        : ""
    }

    <div class="footer">
        <strong>Export ID:</strong> ${Date.now()}<br>
        <strong>Generated:</strong> ${new Date().toISOString()}<br>
        © 2025 TARIQ Broiler Management - Professional Poultry Solutions<br>
        📧 Contact: admin@tariqbroiler.com | 📞 +255 123 456 789
    </div>
</body>
</html>
      `
      filename = `TARIQ-Report-${report.type}-${report.id}-${new Date().toISOString().split("T")[0]}.html`
    }

    const blob = new Blob([content], { type: "text/html" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const totalChicks = batches.reduce((sum, batch) => sum + batch.birdCount, 0)
  const totalMortality = batches.reduce((sum, batch) => sum + batch.mortality, 0)
  const activeFarmersCount = farmers.filter((f) => f.status === "Active").length
  const pendingReports = reports.filter((r) => r.status === "Pending").length
  const unreadMessages = messages.filter((m) => m.status === "Unread").length

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
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

  const showReportsAndMessages = false

  const handleEditFarm = () => {
    if (farmProfile) {
      setDraftFarm({ ...farmProfile })
      setIsEditFarmOpen(true)
    }
  }

  const handleSaveFarm = async () => {
    setFarmProfile({ ...draftFarm, id: draftFarm.id || "FARM-001" })
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftFarm)
      })
    } catch (e) {
      console.error('Failed to sync farm profile to users', e)
    }
    setIsEditFarmOpen(false)
  }

  const handleDeleteFarm = () => {
    setIsConfirmFarmDeleteOpen(true)
  }

  const confirmDeleteFarm = () => {
    setFarmProfile(null)
    setIsViewFarmOpen(false)
    setIsConfirmFarmDeleteOpen(false)
  }

  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const [showFarmersList, setShowFarmersList] = useState(false)
  const enableSupabaseUpload = false

  const handleUploadLogo = async (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      setDraftFarm((prev) => ({ ...prev, logoUrl: previewUrl }))
      if (!enableSupabaseUpload) return
      const fileName = `farm-logos/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage.from("logos").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })
      if (error) throw error
      const { data: publicUrl } = supabase.storage.from("logos").getPublicUrl(data.path)
      setDraftFarm((prev) => ({ ...prev, logoUrl: publicUrl.publicUrl }))
    } catch (e) {
      console.error("Logo upload failed", e)
    }
  }

  const calculateAgeDays = (dateStr: string) => {
    const start = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(diff, 0)
  }

  const [isBatchViewOpen, setIsBatchViewOpen] = useState(false)
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null)
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false)
  const [draftBatch, setDraftBatch] = useState<Batch | null>(null)
  const [isConfirmBatchDeleteOpen, setIsConfirmBatchDeleteOpen] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null)
  const [isBatchReportOpen, setIsBatchReportOpen] = useState(false)
  const [isBatchMessageOpen, setIsBatchMessageOpen] = useState(false)
  const [isConfirmFarmDeleteOpen, setIsConfirmFarmDeleteOpen] = useState(false)

  const handleViewBatch = (b: Batch) => {
    setActiveBatch(b)
    setIsBatchViewOpen(true)
  }

  const handleExportBatch = (b: Batch) => {
    handleExportPDF("batch", b)
  }

  const handleMessageFarm = (b: Batch) => {
    setActiveBatch(b)
    setIsBatchMessageOpen(true)
  }

  const handleCreateReport = (b: Batch) => {
    setActiveBatch(b)
    setIsBatchReportOpen(true)
  }

  const handleEditBatchClick = (b: Batch) => {
    setDraftBatch({ ...b })
    setIsEditBatchOpen(true)
  }

  const handleSaveBatch = () => {
    if (!draftBatch) return
    setBatches((prev) => prev.map((x) => (x.id === draftBatch.id ? { ...draftBatch } : x)))
    setIsEditBatchOpen(false)
  }

  const handleConfirmDeleteBatch = (b: Batch) => {
    setBatchToDelete(b)
    setIsConfirmBatchDeleteOpen(true)
  }

  const confirmDeleteBatch = () => {
    if (batchToDelete) {
      setBatches((prev) => prev.filter((x) => x.id !== batchToDelete.id))
    }
    setIsConfirmBatchDeleteOpen(false)
    setBatchToDelete(null)
  }

  const handleUpdateReport = (id: string, fields: Partial<Report>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...fields } as Report : r)))
  }

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const handleUpdateMessage = (id: string, fields: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } as Message : m)))
  }

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminShell active={activeTab} onSelect={setActiveTab}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.welcome}</h2>
        <p className="text-gray-600 text-lg">Professional broiler farm management and analytics platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hidden" />
        <TabsContent value="dashboard" className="space-y-6">
          {/* Pending Approvals */}
          {candidates.length > 0 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pending Batch Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidates.filter(c => c.status === 'Pending').map((c) => (
                  <div key={c.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-semibold">{c.batchName}</div>
                      <div className="text-sm text-gray-600">{c.contactName} • {c.email} • Username: {c.username}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={async () => {
                        const res = await fetch('/api/admin/candidates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', candidateId: c.id }) })
                        if (res.ok) {
                          setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, status: 'Approved' } : x))
                          // Optionally refresh batches list here in demo
                        }
                      }}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        const res = await fetch('/api/admin/candidates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deny', candidateId: c.id }) })
                        if (res.ok) {
                          setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, status: 'Denied' } : x))
                        }
                      }}>Deny</Button>
                    </div>
                  </div>
                ))}
                {candidates.filter(c => c.status === 'Pending').length === 0 && (
                  <div className="text-sm text-gray-600">No pending candidates.</div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 hidden md:block">
          {/* Professional Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">{t.totalChicks}</p>
                    <p className="text-3xl font-bold text-blue-800">{totalChicks.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-2">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-semibold">{t.totalBatches}</p>
                    <p className="text-3xl font-bold text-green-800">{batches.length}</p>
                    <p className="text-xs text-green-600 flex items-center mt-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All monitored
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Building className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-semibold">{t.totalMortality}</p>
                    <p className="text-3xl font-bold text-red-800">{totalMortality.toLocaleString()}</p>
                    <p className="text-xs text-red-600 flex items-center mt-2">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {((totalMortality / totalChicks) * 100).toFixed(2)}% mortality rate
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-semibold">{t.activeFarmers}</p>
                    <p className="text-3xl font-bold text-purple-800">{activeFarmersCount}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-2">
                      <Users className="h-3 w-3 mr-1" />
                      Professional farmers
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Activity Dashboard */}
          {showReportsAndMessages && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t.pendingReports} ({pendingReports})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {reports
                      .filter((r) => r.status === "Pending")
                      .map((report) => (
                        <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{report.title}</h4>
                              <p className="text-sm text-gray-600">
                                {report.farmerName} • {report.batchName} • {report.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                              <Badge className="bg-blue-100 text-blue-800">{report.type}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{report.content.substring(0, 100)}...</p>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleViewReportDetails(report)}>
                              <Eye className="h-3 w-3 mr-1" />
                              {t.viewReport}
                            </Button>
                            <Button size="sm" onClick={() => handleApproveReport(report.id)}>
                              <Check className="h-3 w-3 mr-1" />
                              {t.approve}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectReport(report.id)}>
                              <X className="h-3 w-3 mr-1" />
                              {t.reject}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t.unreadMessages} ({unreadMessages})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {messages
                      .filter((m) => m.status === "Unread")
                      .map((message) => (
                        <div key={message.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{message.subject}</h4>
                              <p className="text-sm text-gray-600">
                                From: {message.from} • {message.date} at {message.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(message.priority)}>{message.priority}</Badge>
                              <Badge
                                className={
                                  message.type === "Alert"
                                    ? "bg-red-100 text-red-800"
                                    : message.type === "Report"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {message.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{message.content.substring(0, 100)}...</p>
                          <div className="flex gap-2">
                            <Button size="sm">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          )}
          {/* Chick Three Steps */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Chick Three Steps</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 text-center">
                  <Image src="/images/chick-hero.png" alt="Step 1" width={120} height={120} className="mx-auto mb-3" />
                  <h4 className="font-semibold mb-1">Step 1: Brooding</h4>
                  <p className="text-sm text-gray-600">Warmth, clean bedding, starter feed, and fresh water.</p>
                </div>
                <div className="border rounded-lg p-5 md:p-6 text-center scale-[1.05] md:scale-[1.08]">
                  <Image src="/images/chick-hero.png" alt="Step 2" width={140} height={140} className="mx-auto mb-3" />
                  <h4 className="font-semibold mb-1">Step 2: Growing</h4>
                  <p className="text-sm text-gray-600">Balanced feed, proper ventilation, and health checks.</p>
                </div>
                <div className="border rounded-lg p-6 md:p-7 text-center scale-[1.10] md:scale-[1.15]">
                  <Image src="/images/chick-hero.png" alt="Step 3" width={160} height={160} className="mx-auto mb-3" />
                  <h4 className="font-semibold mb-1">Step 3: Finishing</h4>
                  <p className="text-sm text-gray-600">Finisher feed, weight monitoring, and hygiene.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview - hidden as per request */}
          {/* <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.performanceMetrics}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {batches.slice(0, 3).map((batch) => (
                  <div key={batch.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{batch.name}</h4>
                      <div className={`w-4 h-4 rounded-full ${batch.color}`}></div>
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
                        <span className="text-gray-600">Mortality Rate:</span>
                        <span className="font-semibold text-red-600">
                          {((batch.mortality / batch.birdCount) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleViewBatchDetails(batch)}
                      className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {t.viewDetails}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>
        {/* Farmer Profiles Tab */}
        <TabsContent value="farmers" className="space-y-6">
          {/* Farm Profile (single farm) */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center ring-2 ring-gray-200 shadow">
                    {farmProfile?.logoUrl ? (
                      <Image src={farmProfile.logoUrl} alt="Farm Logo" width={112} height={112} className="object-cover" />
                    ) : (
                      <span className="text-xl md:text-2xl font-bold">F</span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-extrabold relative select-none tracking-wide">
                      <span className="absolute inset-0 blur-md opacity-40 bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-700">
                        {farmProfile ? farmProfile.name : "No Farm Registered"}
                      </span>
                      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600" style={{textShadow: "2px 2px 4px rgba(0,0,0,0.2)"}}>
                        {farmProfile ? farmProfile.name : "No Farm Registered"}
                      </span>
                    </CardTitle>
                    {farmProfile && (
                      <p className="text-sm text-gray-500">ID: {farmProfile.id}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {farmProfile ? (
                    <>
                      <Button size="sm" onClick={() => setIsViewFarmOpen(true)}>View</Button>
                      <Button size="sm" onClick={handleEditFarm}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={handleDeleteFarm}>Delete</Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => { setDraftFarm({ id: "FARM-001", name: "", email: "", phone: "", address: "", logoUrl: "", description: "", ownerName: "", establishedDate: "", status: "Active", rating: 0 }); setIsEditFarmOpen(true) }}>Register Farm</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {farmProfile && (
              <CardContent className="p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4 text-sm">
                    <div>
                      <p className="text-gray-600">About</p>
                      <p className="font-medium text-gray-800 text-base md:text-lg">{farmProfile.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Owner</p>
                        <p className="font-medium text-gray-800">{farmProfile.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Established</p>
                        <p className="font-medium text-gray-800">{farmProfile.establishedDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium text-gray-800">{farmProfile.address}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Status</p>
                      <div className="font-medium inline-flex">
                        <Badge className={farmProfile.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                          {farmProfile.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={n <= (farmProfile.rating || 0) ? "text-yellow-500" : "text-gray-300"} fill={n <= (farmProfile.rating || 0) ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{farmProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium text-gray-800">{farmProfile.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Dialog open={isViewFarmOpen} onOpenChange={setIsViewFarmOpen}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Farm Details</DialogTitle>
              </DialogHeader>
              {farmProfile && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center ring-2 ring-gray-200">
                      {farmProfile.logoUrl ? (
                        <Image src={farmProfile.logoUrl} alt="Farm Logo" width={64} height={64} className="object-cover" />
                      ) : (
                        <span className="text-lg font-bold">F</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{farmProfile.name}</p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={n <= (farmProfile.rating || 0) ? "text-yellow-500" : "text-gray-300"} fill={n <= (farmProfile.rating || 0) ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Owner</p>
                      <p className="font-medium">{farmProfile.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Established</p>
                      <p className="font-medium">{farmProfile.establishedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium">{farmProfile.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{farmProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{farmProfile.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium">{farmProfile.address}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600">About</p>
                      <p className="font-medium">{farmProfile.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isEditFarmOpen} onOpenChange={setIsEditFarmOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Farm Profile</DialogTitle>
                <DialogDescription>Update your farm details. Leave logo empty to keep current.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pb-4">
                <div>
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input id="farmName" value={draftFarm.name || ""} onChange={(e) => setDraftFarm({ ...draftFarm, name: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farmEmail">Email</Label>
                    <Input id="farmEmail" value={draftFarm.email || ""} onChange={(e) => setDraftFarm({ ...draftFarm, email: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="farmPhone">Phone</Label>
                    <Input id="farmPhone" value={draftFarm.phone || ""} onChange={(e) => setDraftFarm({ ...draftFarm, phone: e.target.value })} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="farmOwner">Owner</Label>
                  <Input id="farmOwner" value={draftFarm.ownerName || ""} onChange={(e) => setDraftFarm({ ...draftFarm, ownerName: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farmEstablished">Established</Label>
                    <Input id="farmEstablished" type="date" value={draftFarm.establishedDate || ""} onChange={(e) => setDraftFarm({ ...draftFarm, establishedDate: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={draftFarm.status || "Active"} onValueChange={(v) => setDraftFarm({ ...draftFarm, status: v as "Active" | "Inactive" })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((n) => (
                      <button type="button" key={n} onClick={() => setDraftFarm({ ...draftFarm, rating: n })}>
                        <Star className={n <= (draftFarm.rating || 0) ? "text-yellow-500" : "text-gray-300"} fill={n <= (draftFarm.rating || 0) ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="farmAddress">Address</Label>
                  <Input id="farmAddress" value={draftFarm.address || ""} onChange={(e) => setDraftFarm({ ...draftFarm, address: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="farmLogo">Logo URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="farmLogo" value={draftFarm.logoUrl || ""} onChange={(e) => setDraftFarm({ ...draftFarm, logoUrl: e.target.value })} placeholder="/images/your-logo.png" />
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadLogo(f) }} />
                    <Button type="button" onClick={() => logoInputRef.current?.click()}>Upload</Button>
                  </div>
                  {draftFarm.logoUrl && (
                    <div className="mt-2">
                      <Image src={draftFarm.logoUrl} alt="Preview" width={120} height={120} className="rounded-full ring-1 ring-gray-200" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="farmDesc">Description</Label>
                  <Textarea id="farmDesc" rows={3} value={draftFarm.description || ""} onChange={(e) => setDraftFarm({ ...draftFarm, description: e.target.value })} className="mt-1" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveFarm}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditFarmOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {showFarmersList && (
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">{t.farmerProfiles}</h3>
              <Dialog open={isAddFarmerOpen} onOpenChange={setIsAddFarmerOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 shadow-lg">
                    <UserPlus className="h-4 w-4" />
                    {t.addNewFarmer}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-600" />
                      {t.addNewFarmer}
                    </DialogTitle>
                    <DialogDescription>Add a new professional farmer to the TARIQ system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="farmerName">{t.name} *</Label>
                      <Input id="farmerName" value={newFarmer.name} onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })} placeholder="Enter farmer full name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="farmerEmail">{t.email} *</Label>
                      <Input id="farmerEmail" type="email" value={newFarmer.email} onChange={(e) => setNewFarmer({ ...newFarmer, email: e.target.value })} placeholder="farmer@tariqfarm.com" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="farmerPhone">{t.phone} *</Label>
                      <Input id="farmerPhone" value={newFarmer.phone} onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })} placeholder="+255 123 456 789" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="farmerAddress">{t.address} *</Label>
                      <Textarea id="farmerAddress" value={newFarmer.address} onChange={(e) => setNewFarmer({ ...newFarmer, address: e.target.value })} placeholder="Farm location and address" className="mt-1" rows={3} />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddFarmer} className="flex-1 bg-green-500 hover:bg-green-600">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t.save}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddFarmerOpen(false)}>
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
        {/* Batch Management Tab */}
        <TabsContent value="batches" className="space-y-6 md:col-span-9">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">{t.batchManagement}</h3>
            <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 shadow-lg">
                  <Plus className="h-4 w-4" />
                  {t.addNewBatch}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    {t.addNewBatch}
                  </DialogTitle>
                  <DialogDescription>Register a new professional batch for a farmer</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batchName">{t.name} *</Label>
                    <Input
                      id="batchName"
                      value={newBatch.name}
                      onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                      placeholder="e.g., Premium Alpha Batch"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmerSelect">{t.selectFarmer} *</Label>
                    <Select
                      value={newBatch.farmerId}
                      onValueChange={(value) => setNewBatch({ ...newBatch, farmerId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select farmer" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((farmer) => (
                          <SelectItem key={farmer.id} value={farmer.id}>
                            {farmer.name} - {farmer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birdCount">{t.birdCount} *</Label>
                      <Input
                        id="birdCount"
                        type="number"
                        value={newBatch.birdCount}
                        onChange={(e) => setNewBatch({ ...newBatch, birdCount: e.target.value })}
                        placeholder="1000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newBatch.startDate}
                        onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">{t.username} *</Label>
                      <Input
                        id="username"
                        value={newBatch.username}
                        onChange={(e) => setNewBatch({ ...newBatch, username: e.target.value })}
                        placeholder="batch_username"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">{t.password} *</Label>
                      <Input
                        id="password"
                        value={newBatch.password}
                        onChange={(e) => setNewBatch({ ...newBatch, password: e.target.value })}
                        placeholder="secure_password"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="colorSelect">{t.selectColor}</Label>
                    <div className="flex gap-2 mt-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full ${color} ${
                            newBatch.color === color ? "ring-2 ring-gray-400 ring-offset-2" : ""
                          } hover:scale-110 transition-transform`}
                          onClick={() => setNewBatch({ ...newBatch, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newBatch.notes}
                      onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                      placeholder="Additional batch information..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddBatch} className="flex-1 bg-purple-500 hover:bg-purple-600">
                      <Building className="h-4 w-4 mr-2" />
                      {t.save}
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
              <Card
                key={batch.id}
                className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-white/90 backdrop-blur-sm"
                style={{ borderLeft: `6px solid ${batch.color.replace("bg-", "").replace("-500", "")}` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${batch.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      >
                        {batch.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-800">{batch.name}</CardTitle>
                        <p className="text-sm text-gray-500">{batch.farmerName}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Total Chicks</p>
                      <p className="font-bold text-blue-800">{batch.birdCount.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Days</p>
                      <p className="font-bold text-green-800">{calculateAgeDays(batch.startDate)}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Mortality</p>
                      <p className="font-bold text-red-800">{batch.mortality.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Thermometer className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Feed Bags Used</p>
                      <p className="font-bold text-purple-800">{batch.feedUsed}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health Status:</span>
                      <Badge className={getHealthColor(batch.healthStatus)}>{batch.healthStatus}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-mono font-semibold">{batch.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FCR:</span>
                      <span className="font-semibold">{batch.feedConversionRatio}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3">
                    <Button variant="outline" size="sm" onClick={() => handleViewBatch(batch)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportBatch(batch)}>
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCreateReport(batch)}>
                      <FileText className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleMessageFarm(batch)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditBatchClick(batch)}>
                          <Edit className="h-3 w-3 mr-2" />
                          {t.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleConfirmDeleteBatch(batch)}>
                          <Trash2 className="h-3 w-3 mr-2" />
                          {t.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isBatchViewOpen} onOpenChange={setIsBatchViewOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Batch Details</DialogTitle>
              </DialogHeader>
              {activeBatch && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Total Chicks</p>
                      <p className="text-2xl font-bold text-blue-700">{activeBatch.birdCount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Days</p>
                      <p className="text-2xl font-bold text-green-700">{calculateAgeDays(activeBatch.startDate)}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded">
                      <p className="text-xs text-gray-600">Mortality</p>
                      <p className="text-2xl font-bold text-red-700">{activeBatch.mortality.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">Feed Bags Used</p>
                      <p className="text-xl font-bold text-purple-700">{activeBatch.feedUsed}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Health Status</p>
                      <p className="text-xl font-bold">{activeBatch.healthStatus}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleExportBatch(activeBatch)}>
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button variant="outline" onClick={() => handleCreateReport(activeBatch)}>
                      <FileText className="h-4 w-4 mr-2" /> Report
                    </Button>
                    <Button variant="outline" onClick={() => handleMessageFarm(activeBatch)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Message
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Batch Dialog */}
          <Dialog open={isEditBatchOpen} onOpenChange={setIsEditBatchOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Batch</DialogTitle>
              </DialogHeader>
              {draftBatch && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eb-name">Name</Label>
                    <Input id="eb-name" value={draftBatch.name} onChange={(e) => setDraftBatch({ ...draftBatch, name: e.target.value })} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eb-birds">Bird Count</Label>
                      <Input id="eb-birds" type="number" value={draftBatch.birdCount} onChange={(e) => setDraftBatch({ ...draftBatch, birdCount: Number(e.target.value) })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="eb-start">Start Date</Label>
                      <Input id="eb-start" type="date" value={draftBatch.startDate} onChange={(e) => setDraftBatch({ ...draftBatch, startDate: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eb-mortality">Mortality</Label>
                      <Input id="eb-mortality" type="number" value={draftBatch.mortality} onChange={(e) => setDraftBatch({ ...draftBatch, mortality: Number(e.target.value) })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="eb-feed">Feed Bags Used</Label>
                      <Input id="eb-feed" type="number" value={draftBatch.feedUsed} onChange={(e) => setDraftBatch({ ...draftBatch, feedUsed: Number(e.target.value) })} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eb-username">Username</Label>
                      <Input id="eb-username" value={draftBatch.username} onChange={(e) => setDraftBatch({ ...draftBatch, username: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="eb-password">Password</Label>
                      <Input id="eb-password" value={draftBatch.password} onChange={(e) => setDraftBatch({ ...draftBatch, password: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveBatch}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditBatchOpen(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Confirm Delete Batch */}
          <AlertDialog open={isConfirmBatchDeleteOpen} onOpenChange={setIsConfirmBatchDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete batch?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteBatch}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Confirm Delete Farm */}
          <AlertDialog open={isConfirmFarmDeleteOpen} onOpenChange={setIsConfirmFarmDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete farm profile?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. You will be able to register a new farm afterwards.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteFarm}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Batch Reports Dialog */}
          <Dialog open={isBatchReportOpen} onOpenChange={setIsBatchReportOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reports</DialogTitle>
              </DialogHeader>
              {activeBatch && (
                <div className="space-y-3">
                  {reports.filter((r) => r.batchId === activeBatch.id).map((r) => (
                    <div key={r.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{r.title}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(r.priority)}>{r.priority}</Badge>
                          <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                        </div>
                      </div>
                      <Textarea rows={3} value={r.content} onChange={(e) => handleUpdateReport(r.id, { content: e.target.value })} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReport(r.id)}>Delete</Button>
                        <Button size="sm" onClick={() => handleExportPDF("report", r)}>Export</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Batch Messages Dialog */}
          <Dialog open={isBatchMessageOpen} onOpenChange={setIsBatchMessageOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Messages</DialogTitle>
              </DialogHeader>
              {activeBatch && (
                <div className="space-y-3">
                  {messages.filter((m) => m.batchId === activeBatch.id || true).map((m) => (
                    <div key={m.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{m.subject}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(m.priority)}>{m.priority}</Badge>
                          <Badge className="bg-blue-100 text-blue-800">{m.type}</Badge>
                        </div>
                      </div>
                      <Textarea rows={3} value={m.content} onChange={(e) => handleUpdateMessage(m.id, { content: e.target.value })} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteMessage(m.id)}>Delete</Button>
                        <Button size="sm" onClick={() => console.log("Message saved")}>Save</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
        {/* Analytics & Reports Tab */}
        <TabsContent value="chart" className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">{t.groupChart}</h3>

          {/* Professional Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Batch Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full ${batch.color}`}></div>
                          <div>
                            <p className="font-semibold text-gray-800">{batch.name}</p>
                            <p className="text-sm text-gray-500">{batch.farmerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-blue-600">{batch.birdCount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {batch.age} days • {batch.healthStatus}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(batch.status)} >
                              {batch.status}
                            </Badge>
                            <span className="text-xs text-red-600">
                              {((batch.mortality / batch.birdCount) * 100).toFixed(2)}% mortality
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Farmer Group Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {farmers.map((farmer) => (
                      <div
                        key={farmer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {farmer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{farmer.name}</p>
                            <p className="text-sm text-gray-500">{farmer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">{farmer.totalBatches}</p>
                          <p className="text-sm text-gray-500">{farmer.totalBirds.toLocaleString()} birds</p>
                          <Badge
                            className={
                              farmer.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                            }
                          >
                            {farmer.status === "Active" ? t.active : t.inactive}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-blue-800 text-lg">Active Groups</h4>
                <p className="text-3xl font-bold text-blue-600">{farmers.length}</p>
                <p className="text-sm text-blue-600 mt-1">Professional farmers registered</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-green-800 text-lg">Total Messages</h4>
                <p className="text-3xl font-bold text-green-600">{messages.length}</p>
                <p className="text-sm text-green-600 mt-1">Communication threads active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-bold text-purple-800 text-lg">Reports</h4>
                <p className="text-3xl font-bold text-purple-600">{reports.length}</p>
                <p className="text-sm text-purple-600 mt-1">Professional reports submitted</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-bold text-orange-800 text-lg">System Health</h4>
                <p className="text-3xl font-bold text-orange-600">98%</p>
                <p className="text-sm text-orange-600 mt-1">Overall system performance</p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Performance Chart */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Real-time Performance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-blue-800 text-xl">Production Rate</h4>
                  <p className="text-4xl font-bold text-blue-600 my-2">94.5%</p>
                  <p className="text-sm text-blue-600">Above industry average</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Heart className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-green-800 text-xl">Health Score</h4>
                  <p className="text-4xl font-bold text-green-600 my-2">96.2%</p>
                  <p className="text-sm text-green-600">Excellent health status</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Zap className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-purple-800 text-xl">Efficiency</h4>
                  <p className="text-4xl font-bold text-purple-600 my-2">92.8%</p>
                  <p className="text-sm text-purple-600">Optimal feed conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">{t.systemSettings}</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t.theme} & {t.language} {t.settings}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-base font-semibold">{t.theme}</Label>
                  <div className="flex gap-3 mt-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex-1 h-12"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                        {t.light}
                      </div>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex-1 h-12"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                        {t.dark}
                      </div>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">{t.language}</Label>
                  <div className="flex gap-3 mt-3">
                    <Button
                      variant={language === "en" ? "default" : "outline"}
                      onClick={() => setLanguage("en")}
                      className="flex-1 h-12"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇬🇧</span>
                        {t.english}
                      </div>
                    </Button>
                    <Button
                      variant={language === "sw" ? "default" : "outline"}
                      onClick={() => setLanguage("sw")}
                      className="flex-1 h-12"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇹🇿</span>
                        {t.swahili}
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email alerts for important events</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-green-50 text-green-600 border-green-200">
                    Enabled
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">SMS Alerts</p>
                    <p className="text-sm text-gray-600">Get SMS notifications for urgent matters</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Report Reminders</p>
                    <p className="text-sm text-gray-600">Daily reminders for pending reports</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-orange-50 text-orange-600 border-orange-200">
                    Setup
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Real-time Alerts</p>
                    <p className="text-sm text-gray-600">Instant notifications for critical events</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-red-50 text-red-600 border-red-200">
                    Active
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-green-50 text-green-600 border-green-200">
                    Setup
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Session Timeout</p>
                    <p className="text-sm text-gray-600">Auto logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Password Policy</p>
                    <p className="text-sm text-gray-600">Enforce strong password requirements</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Access Logs</p>
                    <p className="text-sm text-gray-600">Monitor system access and activities</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-purple-50 text-purple-600 border-purple-200">
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">System Version:</span>
                    <Badge className="bg-blue-500 text-white">v2.1.0 Professional</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Last Update:</span>
                    <span className="font-semibold">Jan 21, 2025</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Database Status:</span>
                    <Badge className="bg-green-500 text-white">Online & Optimized</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Active Users:</span>
                    <span className="font-semibold text-blue-600">{activeFarmersCount + 1}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Server Uptime:</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Data Backup:</span>
                    <Badge className="bg-green-500 text-white">Auto-enabled</Badge>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Check for Updates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    System Health Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}
