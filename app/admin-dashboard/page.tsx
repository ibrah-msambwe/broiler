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
  Download,
  Trash2,
  Eye,
  MessageSquare,
  FileText,
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
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Share2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminShell from "@/components/admin/admin-shell"
import MessagingSystem from "@/components/admin/messaging-system"
import ChartMessagingSystem from "@/components/chart/messaging-system"
import FastAdminCommunication from "@/components/communication/fast-admin-communication"
import SystemSettingsPanel from "@/components/admin/system-settings-panel"
import UserActivityPanel from "@/components/admin/user-activity-panel"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import InsightsSystem from "@/components/admin/insights-system"
import AutomatedAlerts from "@/components/admin/automated-alerts"
import { getReportTypeIcon, REPORT_TYPES } from "@/lib/report-types"
import SectionHeader from "@/components/admin/section-header"
import RealTimeNotification from "@/components/ui/real-time-notification"
import { supabase } from "@/lib/supabase"
import { playNotificationSound, playCriticalAlert } from "@/lib/audio-notifications"
import { toast } from "sonner"
import CommunicationComingSoon from "@/components/communication/coming-soon-message"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useUserActivity } from "@/hooks/use-user-activity"
import { useLanguageStorage } from "@/lib/language-context"

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
  status: "Planning" | "Starting" | "Active" | "Finalizing" | "Completed"
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
  // Real-time data from reports
  totalChicks?: number
  remainingBirds?: number
  mortalityRate?: number
  totalReports?: number
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
  priority: "Normal" | "High" | "Urgent" | "Critical"
  reportType?: string
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
  created_at?: string
  updated_at?: string
  is_read?: boolean
}

interface Message {
  batchId: string
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
  const { language, setLanguage } = useLanguageStorage()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // User activity tracking
  const { isOnline, connectionStatus, trackActivity } = useUserActivity({
    userId: user?.email || "admin-unknown",
    userName: user?.name || "Admin User",
    userType: "admin"
  })

  // System refresh function
  const handleSystemRefresh = async () => {
    try {
      trackActivity('system_refresh')
      await fetchBatches()
      await fetchReports()
      await fetchNotifications()
      toast.success("System refreshed successfully")
    } catch (error) {
      console.error("Error refreshing system:", error)
      toast.error("Failed to refresh system")
    }
  }
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isBatchDetailOpen, setIsBatchDetailOpen] = useState(false)
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false)
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)
  const [adminComment, setAdminComment] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])
  const router = useRouter()

  // Farm profile (single farm)
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null)
  const [isEditFarmOpen, setIsEditFarmOpen] = useState(false)
  const [isViewFarmOpen, setIsViewFarmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{type: string, id: string, name: string} | null>(null)
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
  const [farmers, setFarmers] = useState<Farmer[]>([])

  const [batches, setBatches] = useState<Batch[]>([])

  const [reports, setReports] = useState<Report[]>([])

  const [messages, setMessages] = useState<Message[]>([])

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
              title: "TARIQ Broiler Manager - Admin Dashboard",
      welcome: "Welcome back, Administrator",
      dashboard: "Dashboard",
      farmerProfiles: "Farmer Profiles",
      batchManagement: "Batch Management",
      groupChart: "Analytics & Reports",
      systemSettings: "System Settings",
      logout: "Logout",
      totalChicks: "Current Birds",
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
      totalChicks: "Ndege za Sasa",
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
    // Load farmers from Supabase farm_profile
    fetch('/api/admin/farmers').then(r => r.json()).then(j => {
      const arr = (j.farmers || [])
      setFarmers(arr.map((f: any) => ({
        id: f.id,
        name: f.name,
        email: f.email || '',
        phone: f.phone || '',
        address: f.address || '',
        joinDate: (f.created_at || '').split('T')[0] || '',
        status: (f.status || 'Active') as 'Active' | 'Inactive',
        totalBatches: 0,
        totalBirds: 0,
      })))
      if (!farmProfile && arr.length > 0) {
        const f = arr[0]
        setFarmProfile({
          id: f.id,
          name: f.name,
          email: f.email || '',
          phone: f.phone || '',
          address: f.address || '',
          logoUrl: f.logo_url || '',
          description: f.description || '',
          ownerName: f.owner_name || '',
          establishedDate: f.established_date || '',
          status: (f.status || 'Active') as 'Active' | 'Inactive',
          rating: typeof f.rating === 'number' ? f.rating : 0,
        })
      }
    }).catch(() => {})
  }, [])

  // Load batches with real-time statistics from Supabase
  useEffect(() => {
    fetch('/api/admin/batches-with-stats')
      .then((r) => r.json())
      .then((j) => {
        console.log("📊 Admin dashboard loaded batches with stats:", j.batches?.length || 0)
        setBatches((j.batches || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          farmerId: b.farmerId || '',
          farmerName: b.farmerName || '',
          startDate: b.startDate || '',
          birdCount: b.remainingBirds || b.birdCount || 0, // Use remaining birds instead of total
          age: b.age || 0,
          status: (b.status || 'Planning') as 'Planning' | 'Starting' | 'Active' | 'Finalizing' | 'Completed',
          mortality: b.mortality || 0,
          feedUsed: b.feedUsed || 0,
          healthStatus: (b.healthStatus || 'Good') as 'Excellent' | 'Good' | 'Fair' | 'Poor',
          temperature: b.temperature || 30,
          humidity: b.humidity || 65,
          username: b.username || '',
          password: b.password || '',
          color: b.color || 'bg-blue-500',
          notes: b.notes || '',
          expectedHarvestDate: b.expectedHarvestDate || '',
          currentWeight: b.currentWeight || 0,
          feedConversionRatio: b.feedConversionRatio || 1.5,
          vaccinations: b.vaccinations || 0,
          lastHealthCheck: b.lastHealthCheck || '',
          // Add real-time data
          totalChicks: b.birdCount || 0, // Original total
          remainingBirds: b.remainingBirds || 0, // Current remaining
          mortalityRate: b.mortalityRate || 0, // Mortality rate
          totalReports: b.totalReports || 0, // Number of reports processed
        })))
      })
      .catch((error) => {
        console.error("❌ Error loading batches with stats:", error)
        // Fallback to basic batches API
        fetch('/api/admin/batches')
          .then((r) => r.json())
          .then((j) => setBatches((j.batches || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            farmerId: '',
            farmerName: b.farmer_name || '',
            startDate: b.start_date || '',
            birdCount: b.bird_count || 0,
            age: 0,
            status: (b.status || 'Planning') as 'Planning' | 'Starting' | 'Active' | 'Finalizing' | 'Completed',
            mortality: b.mortality || 0,
            feedUsed: b.feed_used || 0,
            healthStatus: (b.health_status || 'Good') as 'Excellent' | 'Good' | 'Fair' | 'Poor',
            temperature: b.temperature || 30,
            humidity: b.humidity || 65,
            username: b.username || '',
            password: b.password || '',
            color: b.color || 'bg-blue-500',
            notes: b.notes || '',
            expectedHarvestDate: b.expected_harvest_date || '',
            currentWeight: b.current_weight || 0,
            feedConversionRatio: b.feed_conversion_ratio || 1.5,
            vaccinations: b.vaccinations || 0,
            lastHealthCheck: b.last_health_check || '',
          }))))
          .catch(() => {})
      })
  }, [])

  // Auto-select first farm as profile if none is selected
  useEffect(() => {
    if (!farmProfile && farmers.length > 0) {
      const f = farmers[0]
      setFarmProfile({
        id: f.id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        address: f.address,
        logoUrl: '',
        description: '',
        ownerName: '',
        establishedDate: '',
        status: f.status,
        rating: 0,
      })
    }
  }, [farmers, farmProfile])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === "admin" || parsedUser.role === "batch") {
        setUser(parsedUser)
      } else {
        router.push("/admin-login")
      }
    } else {
      router.push("/admin-login")
    }
  }, [router])

  // Real-time subscriptions for reports and messages
  useEffect(() => {
    if (!user) return

    // Subscribe to new reports
    const reportsSubscription = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('🔄 New report received:', payload.new)
          const newReport = payload.new as any
          setReports(prev => [newReport, ...prev])
          
          // Add notification
          const notification = {
            id: `report-${newReport.id}-${Date.now()}`,
            type: 'report',
            title: `New ${newReport.priority} Report`,
            message: `${newReport.batch_name || 'Unknown Batch'}: ${newReport.title}`,
            priority: newReport.priority?.toLowerCase() || 'normal',
            timestamp: newReport.created_at
          }
          setNotifications(prev => [notification, ...prev])
          
          // Show notification and play sound
          if (newReport.priority === 'High' || newReport.priority === 'Critical') {
            console.log('🚨 HIGH PRIORITY REPORT:', newReport.title)
            playCriticalAlert()
          } else {
            playNotificationSound('report')
          }
        }
      )
      .subscribe()

    // Subscribe to new admin notifications
    const notificationsSubscription = supabase
      .channel('admin_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          console.log('🔔 New notification received:', payload.new)
          // Refresh notifications
          fetchNotifications()
        }
      )
      .subscribe()

    // Subscribe to mortality alerts
    const mortalitySubscription = supabase
      .channel('mortality_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mortality_records'
        },
        (payload) => {
          console.log('💀 New mortality record:', payload.new)
          const mortalityRecord = payload.new as any
          
          // Add notification
          const notification = {
            id: `mortality-${mortalityRecord.id}-${Date.now()}`,
            type: 'mortality',
            title: 'Mortality Alert',
            message: `${mortalityRecord.death_count || 0} deaths reported in batch ${mortalityRecord.batch_id}`,
            priority: (mortalityRecord.death_count || 0) > 5 ? 'high' : 'normal',
            timestamp: mortalityRecord.created_at
          }
          setNotifications(prev => [notification, ...prev])
          
          // Play sound for mortality alerts
          if (notification.priority === 'high') {
            playCriticalAlert()
          } else {
            playNotificationSound('mortality')
          }
          
          // Refresh batch data to update mortality counts
          fetchBatches()
        }
      )
      .subscribe()

    // Subscribe to batch updates
    const batchSubscription = supabase
      .channel('batch_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'batches'
        },
        (payload) => {
          console.log('📊 Batch updated:', payload.new)
          // Update the specific batch in the list
          setBatches(prev => 
            prev.map(batch => 
              batch.id === payload.new.id ? { ...batch, ...payload.new } : batch
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(reportsSubscription)
      supabase.removeChannel(notificationsSubscription)
      supabase.removeChannel(mortalitySubscription)
      supabase.removeChannel(batchSubscription)
    }
  }, [user])

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchBatches()
      fetchReports()
      fetchNotifications()
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      if (res.ok) {
        // Update notifications state if it exists
        console.log('📬 Notifications refreshed:', data.notifications?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/admin/batches')
      const data = await res.json()
      if (res.ok) {
        setBatches((data.batches || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          farmerId: b.farmer_id,
          farmerName: b.farmer_name,
          startDate: b.start_date,
          birdCount: b.bird_count,
          age: b.age,
          status: b.status,
          mortality: b.mortality,
          feedUsed: b.feed_used,
          healthStatus: b.health_status,
          temperature: b.temperature,
          humidity: b.humidity,
          username: b.username,
          password: b.password,
          color: b.color,
          notes: b.notes,
          lastHealthCheck: b.last_health_check || '',
        })))
        console.log('📊 Batches refreshed:', data.batches?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports')
      const data = await res.json()
      if (res.ok) {
        setReports((data.reports || []).map((r: any) => ({
          id: r.id,
          batchId: r.batch_id,
          batchName: r.batch_name,
          farmerName: r.farmer_name,
          type: r.type,
          title: r.title,
          content: r.content,
          status: r.status,
          date: r.date,
          priority: r.priority,
          reportType: r.report_type,
          data: r.fields || {},
          adminComment: r.admin_comment,
          created_at: r.created_at,
          updated_at: r.updated_at,
          is_read: r.is_read || false
        })))
        console.log('📋 Reports refreshed:', data.reports?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const fetchReportsForBatch = async (batchId: string) => {
    try {
      const res = await fetch(`/api/user/reports?batchId=${encodeURIComponent(batchId)}`)
      const data = await res.json()
      if (res.ok) {
        const batchReports = (data.reports || []).map((r: any) => ({
          id: r.id,
          batchId: r.batch_id,
          batchName: r.batch_name,
          farmerName: r.farmer_name,
          type: r.type,
          title: r.title,
          content: r.content,
          status: r.status,
          date: r.date,
          priority: r.priority,
          reportType: r.report_type,
          data: r.fields || {},
          adminComment: r.admin_comment,
          created_at: r.created_at,
          updated_at: r.updated_at,
          is_read: r.is_read || false
        }))
        
        // Update the reports state with batch-specific reports
        setReports(prev => {
          // Remove existing reports for this batch and add new ones
          const otherReports = prev.filter(r => r.batchId !== batchId)
          return [...otherReports, ...batchReports]
        })
        
        console.log(`📋 Reports for batch ${batchId}:`, batchReports.length)
        return batchReports
      }
    } catch (error) {
      console.error('Failed to fetch reports for batch:', error)
    }
    return []
  }

  const handleAddFarmer = async () => {
    if (!newFarmer.name) return
    try {
      const res = await fetch('/api/admin/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFarmer.name,
          email: newFarmer.email,
          phone: newFarmer.phone,
          address: newFarmer.address,
          status: 'Active',
        })
      })
      const j = await res.json()
      if (res.ok && j.farmer) {
        const f = j.farmer
        setFarmers(prev => [...prev, {
          id: f.id,
          name: f.name,
          email: f.email || '',
          phone: f.phone || '',
          address: f.address || '',
          joinDate: (f.created_at || '').split('T')[0] || '',
          status: (f.status || 'Active') as 'Active' | 'Inactive',
          totalBatches: 0,
          totalBirds: 0,
        }])
        setNewFarmer({ name: '', email: '', phone: '', address: '' })
        setIsAddFarmerOpen(false)
      } else {
        console.error('Create farmer failed:', j?.error)
      }
    } catch (e) {
      console.error('Create farmer exception', e)
    }
  }

  const handleAddBatch = async () => {
    // Enhanced validation
    if (!newBatch.name.trim()) {
      alert('Please enter a batch name')
      return
    }
    if (!newBatch.farmerId) {
      alert('Please select a farmer')
      return
    }
    if (!newBatch.birdCount || Number.parseInt(newBatch.birdCount) <= 0) {
      alert('Please enter a valid bird count')
      return
    }
    if (!newBatch.startDate) {
      alert('Please select a start date')
      return
    }
    if (!newBatch.username.trim()) {
      alert('Please enter a username for the batch')
      return
    }
    if (!newBatch.password.trim()) {
      alert('Please enter a password for the batch')
      return
    }

    try {
      const selectedFarmer = farmers.find((f) => f.id === newBatch.farmerId)
      if (!selectedFarmer) {
        alert('Selected farmer not found')
        return
      }

      console.log('Creating new batch:', {
        name: newBatch.name,
        farmerName: selectedFarmer.name,
        startDate: newBatch.startDate,
        birdCount: Number.parseInt(newBatch.birdCount),
        username: newBatch.username,
        password: newBatch.password,
        color: newBatch.color,
        notes: newBatch.notes
      })

      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBatch.name.trim(),
          farmerName: selectedFarmer.name,
          startDate: newBatch.startDate,
          birdCount: Number.parseInt(newBatch.birdCount),
          username: newBatch.username.trim(),
          password: newBatch.password.trim(),
          color: newBatch.color,
          notes: newBatch.notes.trim() || null,
        })
      })
      
      const j = await res.json()
      console.log('Batch creation response:', j)
      
      if (res.ok && j.batch) {
        // Add the new batch to the list
        setBatches(prev => [...prev, {
          id: j.batch.id,
          name: j.batch.name,
          farmerId: newBatch.farmerId,
          farmerName: j.batch.farmer_name || selectedFarmer.name,
          startDate: j.batch.start_date || newBatch.startDate,
          birdCount: j.batch.bird_count || Number.parseInt(newBatch.birdCount),
          age: 0,
          status: (j.batch.status || 'Planning') as 'Planning' | 'Starting' | 'Active' | 'Finalizing' | 'Completed',
          mortality: j.batch.mortality || 0,
          feedUsed: j.batch.feed_used || 0,
          healthStatus: j.batch.health_status || 'Good',
          temperature: j.batch.temperature || 30,
          humidity: j.batch.humidity || 65,
          username: j.batch.username || newBatch.username,
          password: j.batch.password || newBatch.password,
          color: j.batch.color || newBatch.color,
          notes: j.batch.notes || newBatch.notes,
          expectedHarvestDate: j.batch.expected_harvest_date || '',
          currentWeight: j.batch.current_weight || 0,
          feedConversionRatio: j.batch.feed_conversion_ratio || 1.5,
          vaccinations: j.batch.vaccinations || 0,
          lastHealthCheck: j.batch.last_health_check || newBatch.startDate,
        }])
        
        // Reset form
        setNewBatch({
          name: '',
          farmerId: '',
          birdCount: '',
          startDate: '',
          username: '',
          password: '',
          color: 'bg-blue-500',
          notes: '',
        })
        setIsAddBatchOpen(false)
        
        // Show success message
        alert(`✅ Batch "${j.batch.name}" created successfully!`)
        console.log('✅ Batch created successfully:', j.batch)
      } else {
        console.error('❌ Create batch failed:', j?.error)
        alert(`❌ Failed to create batch: ${j?.error || 'Unknown error'}`)
      }
    } catch (e) {
      console.error('💥 Create batch exception:', e)
      alert(`❌ Error creating batch: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  const handleViewBatchDetails = (batch: Batch) => {
    setSelectedBatch(batch)
    setIsBatchDetailOpen(true)
  }

  const handleViewReportDetails = (report: Report) => {
    setSelectedReport(report)
    setIsReportDetailOpen(true)
    
    // Mark report as read if it's not already read
    if (!report.is_read) {
      setReports(prev => 
        prev.map((r) => 
          r.id === report.id ? { ...r, is_read: true } : r
        )
      )
      
      // Optionally send API call to mark as read in database
      // This could be done here or in a separate function
    }
  }

  const handleApproveReport = async (reportId: string) => {
    try {
      console.log('🔄 Approving report:', reportId, 'with comment:', adminComment)
      
      // Find the report to get its details
      const report = reports.find(r => r.id === reportId)
      if (!report) {
        toast.error('Report not found')
        return
      }

      console.log('📋 Report details:', report)
      
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status: 'Approved',
          admin_comment: adminComment || 'Approved'
        })
      })

      console.log('📥 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Report approved successfully:', data)
        
        setReports(prev =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: "Approved" as const, adminComment: adminComment || "Approved" } : r,
          )
        )
        setAdminComment("")
        toast.success('Report approved successfully!')
        console.log('✅ Report approved:', reportId)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to approve report:', response.status, errorData)
        
        // If it's a 500 error, it might be that the report doesn't exist in the database
        // Let's update the local state anyway for better UX
        if (response.status === 500) {
          console.log('🔄 500 error - updating local state anyway')
          setReports(prev =>
            prev.map((r) =>
              r.id === reportId ? { ...r, status: "Approved" as const, adminComment: adminComment || "Approved" } : r,
            )
          )
          setAdminComment("")
          toast.success('Report approved locally (database sync pending)')
        } else {
          toast.error(`Failed to approve report: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('💥 Error approving report:', error)
      toast.error('Error approving report. Please try again.')
    }
  }

  const handleRejectReport = async (reportId: string) => {
    try {
      console.log('🔄 Rejecting report:', reportId, 'with comment:', adminComment)
      
      // Find the report to get its details
      const report = reports.find(r => r.id === reportId)
      if (!report) {
        toast.error('Report not found')
        return
      }

      console.log('📋 Report details:', report)
      
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status: 'Rejected',
          admin_comment: adminComment || 'Rejected - needs revision'
        })
      })

      console.log('📥 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Report rejected successfully:', data)
        
        setReports(prev =>
          prev.map((r) =>
            r.id === reportId
              ? { ...r, status: "Rejected" as const, adminComment: adminComment || "Rejected - needs revision" }
              : r,
          )
        )
        setAdminComment("")
        toast.success('Report rejected successfully!')
        console.log('❌ Report rejected:', reportId)
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to reject report:', response.status, errorData)
        
        // If it's a 500 error, it might be that the report doesn't exist in the database
        // Let's update the local state anyway for better UX
        if (response.status === 500) {
          console.log('🔄 500 error - updating local state anyway')
          setReports(prev =>
            prev.map((r) =>
              r.id === reportId
                ? { ...r, status: "Rejected" as const, adminComment: adminComment || "Rejected - needs revision" }
                : r,
            )
          )
          setAdminComment("")
          toast.success('Report rejected locally (database sync pending)')
        } else {
          toast.error(`Failed to reject report: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('💥 Error rejecting report:', error)
      toast.error('Error rejecting report. Please try again.')
    }
  }

  const handleDeleteItem = (type: string, id: string, name: string) => {
    setItemToDelete({ type, id, name })
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      console.log('🗑️ Deleting item:', itemToDelete)
      
      let response
      if (itemToDelete.type === 'report') {
        response = await fetch(`/api/admin/reports-mock?id=${itemToDelete.id}`, {
          method: 'DELETE'
        })
      } else if (itemToDelete.type === 'batch') {
        response = await fetch(`/api/admin/batches?id=${itemToDelete.id}`, {
          method: 'DELETE'
        })
      } else if (itemToDelete.type === 'farmer') {
        response = await fetch(`/api/admin/farmers?id=${itemToDelete.id}`, {
          method: 'DELETE'
        })
      }

      if (response && response.ok) {
        console.log('✅ Item deleted successfully')
        
        // Update the appropriate state
        if (itemToDelete.type === 'report') {
          setReports(prev => prev.filter(r => r.id !== itemToDelete.id))
        } else if (itemToDelete.type === 'batch') {
          setBatches(prev => prev.filter(b => b.id !== itemToDelete.id))
        } else if (itemToDelete.type === 'farmer') {
          setFarmers(prev => prev.filter(f => f.id !== itemToDelete.id))
        }
        
        toast.success(`${itemToDelete.type} deleted successfully`)
      } else {
        const errorData = await response?.json()
        console.error('❌ Failed to delete item:', response?.status, errorData)
        toast.error('Failed to delete item: ' + (errorData?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('💥 Error deleting item:', error)
      toast.error('Error deleting item: ' + (error as Error).message)
    } finally {
      setIsDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  const handleExportAllReports = async () => {
    try {
      toast.info('📊 Preparing comprehensive report export...')
      
      const response = await fetch('/api/export/all-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: null,
          endDate: null,
          reportTypes: null
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.html) {
          // Create and download the HTML file
          const blob = new Blob([data.html], { type: 'text/html' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `tariq-broiler-all-reports-export-${new Date().toISOString().split('T')[0]}.html`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          toast.success(`✅ Exported ${data.count} reports successfully!`)
        } else {
          toast.error('Export data format error')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Export failed:', response.status, errorData)
        toast.error(`Export failed: ${errorData.error || 'Server error'}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Network error during export')
    }
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
            <title>TARIQ Broiler Manager - Batch Report</title>
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
        <div class="logo">TARIQ BROILER MANAGER</div>
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
        <strong>Generated By:</strong> TARIQ Broiler Manager System<br>
        © 2025 TARIQ Broiler Manager - Professional Poultry Solutions<br>
        📧 Contact: admin@tariqbroiler.com | 📞 +255 123 456 789
    </div>
</body>
</html>
      `
      filename = `TARIQ-Batch-${batch.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`
    } else if (type === "report" && "type" in data) {
      const report = data as Report
      
      // Get farm details from the batch
      const batch = batches.find(b => b.name === report.batchName)
      
      content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TARIQ Broiler Farm Report - ${report.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.2; 
            color: #000; 
            background: #fff;
            font-size: 10px;
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 10mm; 
            background: #fff;
            border: 2px solid #2563eb;
            border-radius: 8px;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #2563eb; 
            padding-bottom: 8px; 
            margin-bottom: 10px; 
        }
        .classification {
            text-align: left;
            font-size: 8px;
            color: #666;
            margin-bottom: 5px;
        }
        .logos {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 15px;
            margin-bottom: 8px;
        }
        .logo {
            font-size: 14px;
            font-weight: bold;
        }
        .tariq-logo { color: #dc2626; }
        .broiler-logo { color: #059669; }
        .main-title { 
            font-size: 14px; 
            font-weight: bold; 
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        .subtitle { 
            font-size: 9px; 
            font-style: italic;
            color: #333;
        }
        .section { 
            margin: 8px 0; 
            background: #dbeafe;
        }
        .section-title { 
            font-size: 10px; 
            font-weight: bold; 
            background: #3b82f6;
            color: white;
            padding: 6px 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .section-content {
            padding: 8px;
            background: #dbeafe;
        }
        .form-row {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            padding: 4px 0;
            background: white;
            padding: 6px;
            border-radius: 2px;
        }
        .form-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .label {
            font-weight: bold;
            min-width: 120px;
            margin-right: 10px;
            color: #374151;
            font-size: 9px;
        }
        .value {
            flex: 1;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 2px;
            min-height: 14px;
            font-weight: 500;
            color: #1f2937;
            font-size: 9px;
        }
        .checkbox-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 6px;
            background: white;
            padding: 6px;
            border-radius: 2px;
        }
        .checkbox {
            width: 10px;
            height: 10px;
            border: 1px solid #2563eb;
            border-radius: 2px;
            display: inline-block;
            margin-right: 5px;
            background: white;
            position: relative;
        }
        .checkbox.checked {
            background: #2563eb;
        }
        .checkbox.checked::after {
            content: '✓';
            color: white;
            font-size: 8px;
            font-weight: bold;
            position: absolute;
            top: -1px;
            left: 1px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 6px;
            margin: 8px 0;
        }
        .grid-item {
            border: 1px solid #2563eb;
            border-radius: 4px;
            padding: 6px;
            text-align: center;
            background: white;
        }
        .grid-label {
            font-size: 8px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .grid-value {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
        }
        .signature-section {
            margin: 8px 0;
        }
        .signature-row {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-bottom: 8px;
        }
        .signature-box {
            width: 150px;
            border-bottom: 1px solid #000;
            text-align: center;
            padding-bottom: 3px;
        }
        .signature-label {
            font-size: 8px;
            margin-top: 3px;
        }
        .declaration {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            padding: 8px;
            margin: 8px 0;
            font-size: 9px;
            line-height: 1.3;
        }
        .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            background: #f9fafb;
            border-radius: 4px;
            padding: 8px;
        }
        .company-stamp {
            width: 60px;
            height: 60px;
            border: 2px solid #2563eb;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 7px;
            font-weight: bold;
            margin: 0 auto;
            background: white;
            color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="classification">C1: FOR INTERNAL USE ONLY</div>
        
        <div class="logos">
            <div class="logo tariq-logo">TARIQ</div>
            <div class="logo broiler-logo">BROILER</div>
        </div>
        
        <div class="header">
            <div class="main-title">TARIQ BROILER FARM REPORT FORM</div>
            <div class="subtitle">(Professional Poultry Management Documentation)</div>
        </div>

        <div class="section">
            <div class="section-title">REPORT SUBMISSION DETAILS</div>
            <div class="section-content">
                <div class="form-row">
                    <span class="label">Sender (Farmer):</span>
                    <span class="value">${report.farmerName}</span>
                </div>
                <div class="form-row">
                    <span class="label">Batch Name:</span>
                    <span class="value">${report.batchName}</span>
                </div>
                <div class="form-row">
                    <span class="label">Submission Date:</span>
                    <span class="value">${report.created_at ? new Date(report.created_at).toLocaleDateString() : report.date}</span>
                </div>
                <div class="form-row">
                    <span class="label">Submission Time:</span>
                    <span class="value">${report.created_at ? new Date(report.created_at).toLocaleTimeString() : 'Not specified'}</span>
                </div>
                <div class="form-row">
                    <span class="label">Report ID:</span>
                    <span class="value">${report.id}</span>
                </div>
                <div class="checkbox-row">
                    <span><span class="checkbox ${report.status === 'Approved' ? 'checked' : ''}"></span> Approved</span>
                    <span><span class="checkbox ${report.status === 'Pending' ? 'checked' : ''}"></span> Pending Review</span>
                    <span><span class="checkbox ${report.status === 'Rejected' ? 'checked' : ''}"></span> Rejected</span>
                    <span><span class="checkbox ${report.is_read ? 'checked' : ''}"></span> Read</span>
                    <span><span class="checkbox ${!report.is_read ? 'checked' : ''}"></span> Unread</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">FARM ACCOUNT DETAILS - PLEASE WRITE IN ALL CAPITALS</div>
            <div class="section-content">
                <div class="form-row">
                    <span class="label">Farmer's Full Name:</span>
                    <span class="value">${report.farmerName.toUpperCase()}</span>
                </div>
                <div class="form-row">
                    <span class="label">Job Description (Title):</span>
                    <span class="value">FARM MANAGER</span>
                </div>
                <div class="form-row">
                    <span class="label">Batch Name:</span>
                    <span class="value">${report.batchName.toUpperCase()}</span>
                </div>
                <div class="form-row">
                    <span class="label">Report Type:</span>
                    <span class="value">${report.type.toUpperCase()}</span>
                </div>
                <div class="form-row">
                    <span class="label">Report Date:</span>
                    <span class="value">${report.date.toUpperCase()}</span>
                </div>
                <div class="form-row">
                    <span class="label">Business Name:</span>
                    <span class="value">TARIQ BROILER MANAGEMENT LTD</span>
                </div>
                <div class="form-row">
                    <span class="label">Report ID:</span>
                    <span class="value">${report.id}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">REPORT TYPE & PRIORITY - PLEASE INDICATE YOUR SELECTION WITH AN "X"</div>
            <div class="section-content">
                <div class="checkbox-row">
                    <span><span class="checkbox ${report.type === 'Health' ? 'checked' : ''}"></span> Health Report</span>
                    <span><span class="checkbox ${report.type === 'Feed' ? 'checked' : ''}"></span> Feed Report</span>
                    <span><span class="checkbox ${report.type === 'Mortality' ? 'checked' : ''}"></span> Mortality Report</span>
                </div>
                <div class="checkbox-row">
                    <span><span class="checkbox ${report.type === 'Daily' ? 'checked' : ''}"></span> Daily Report</span>
                    <span><span class="checkbox ${report.type === 'Vaccination' ? 'checked' : ''}"></span> Vaccination Report</span>
                </div>
                <div style="margin-top: 10px;">
                    <strong>Priority Level:</strong>
                    <span style="margin-left: 10px;"><span class="checkbox ${report.priority === 'Critical' ? 'checked' : ''}"></span> Critical</span>
                    <span style="margin-left: 15px;"><span class="checkbox ${report.priority === 'High' ? 'checked' : ''}"></span> High</span>
                    <span style="margin-left: 15px;"><span class="checkbox ${report.priority === 'Normal' ? 'checked' : ''}"></span> Normal</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">REPORT DATA & METRICS</div>
            <div class="section-content">
                ${Object.keys(report.data).length > 0 ? `
                <div class="grid">
                    ${Object.entries(report.data)
                      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                      .map(([key, value]) => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                        const unit = key.toLowerCase().includes('temperature') ? '°C' : 
                                   key.toLowerCase().includes('humidity') ? '%' : 
                                   key.toLowerCase().includes('weight') ? ' kg' : 
                                   key.toLowerCase().includes('feed') ? ' kg' : ''
                        return `
                    <div class="grid-item">
                        <div class="grid-label">${label}</div>
                        <div class="grid-value">${value}${unit}</div>
                    </div>
                        `
                      }).join('')}
                </div>
                ` : '<div style="text-align: center; padding: 20px; color: #666;">No data available</div>'}
            </div>
        </div>

        <div class="section">
            <div class="section-title">REPORT CONTENT</div>
            <div class="section-content">
                <div style="margin-bottom: 6px;">
                    <strong>Report Title:</strong> ${report.title}
                </div>
                <div style="border: 1px solid #ccc; padding: 6px; min-height: 40px; background: #fafafa; font-size: 9px;">
                    ${report.content.replace(/Report submitted by [^.]*\./g, '').trim()}
                </div>
            </div>
        </div>

        ${report.adminComment ? `
        <div class="section">
            <div class="section-title">ADMIN COMMENT & FEEDBACK</div>
            <div class="section-content">
                <div style="border: 1px solid #ccc; padding: 10px; background: #fffacd;">
                    ${report.adminComment}
                </div>
            </div>
        </div>
        ` : ''}

        <div class="declaration">
            I <strong>${report.farmerName}</strong> (Sender/Farmer) from <strong>${report.batchName}</strong> (Batch) hereby confirm that the information provided in this report is accurate and complete. I understand that any false or misleading information may result in account suspension or termination. I agree to comply with all TARIQ Broiler Management policies and procedures.
        </div>


    </div>
</body>
</html>
      `
      filename = `TARIQ-Report-${report.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`
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

  const totalChicks = batches.reduce((sum, batch) => sum + (batch.totalChicks || batch.birdCount || 0), 0)
  const totalMortality = batches.reduce((sum, batch) => sum + (batch.mortality || 0), 0)
  const totalRemainingBirds = batches.reduce((sum, batch) => sum + (batch.remainingBirds || batch.birdCount || 0), 0)
  const activeFarmersCount = Array.from(new Set(batches.map((b) => b.farmerName).filter(Boolean))).length
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
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Starting":
        return "bg-blue-100 text-blue-800"
      case "Active":
        return "bg-green-100 text-green-800"
      case "Finalizing":
        return "bg-orange-100 text-orange-800"
      case "Completed":
        return "bg-purple-100 text-purple-800"
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
		try {
			const payload: any = {
				name: draftFarm.name,
				email: draftFarm.email || null,
				phone: draftFarm.phone || null,
				address: draftFarm.address || null,
				logoUrl: draftFarm.logoUrl || null,
				description: draftFarm.description || null,
				ownerName: draftFarm.ownerName || null,
				establishedDate: draftFarm.establishedDate || null,
				status: draftFarm.status || null,
				rating: draftFarm.rating ?? null,
			}
			// Only send id if it looks like a UUID; otherwise create new
			if (draftFarm.id && draftFarm.id.includes('-') && draftFarm.id.length >= 36) {
				payload.id = draftFarm.id
			}

			const res = await fetch('/api/admin/farmers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			const j = await res.json()
			if (res.ok && j.farmer) {
				const f = j.farmer
				const profile = {
					id: f.id,
					name: f.name,
					email: f.email || '',
					phone: f.phone || '',
					address: f.address || '',
					logoUrl: f.logo_url || '',
					description: f.description || '',
					ownerName: f.owner_name || '',
					establishedDate: f.established_date || '',
					status: (f.status || 'Active') as 'Active' | 'Inactive',
					rating: typeof f.rating === 'number' ? f.rating : 0,
				}
				setFarmProfile(profile)
				// upsert into farmers list
				setFarmers(prev => {
					const idx = prev.findIndex(x => x.id === f.id)
					const base = {
						id: f.id,
						name: f.name,
						email: f.email || '',
						phone: f.phone || '',
						address: f.address || '',
						joinDate: (f.created_at || '').split('T')[0] || '',
						status: (f.status || 'Active') as 'Active' | 'Inactive',
						totalBatches: idx >= 0 ? prev[idx].totalBatches : 0,
						totalBirds: idx >= 0 ? prev[idx].totalBirds : 0,
					}
					if (idx >= 0) {
						const copy = [...prev]
						copy[idx] = base
						return copy
					}
					return [...prev, base]
				})
				setIsEditFarmOpen(false)
			} else {
				console.error('Save farm failed:', j?.error)
			}
		} catch (e) {
			console.error('Failed to save farm', e)
		}
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
  	const enableSupabaseUpload = true

  	const handleUploadLogo = async (file: File) => {
		try {
			const previewUrl = URL.createObjectURL(file)
			setDraftFarm((prev) => ({ ...prev, logoUrl: previewUrl }))
			if (!enableSupabaseUpload) return
			const fd = new FormData()
			fd.append('file', file)
			const res = await fetch('/api/admin/farmers/logo-upload', { method: 'POST', body: fd })
			const j = await res.json()
			if (res.ok && j.publicUrl) {
				setDraftFarm((prev) => ({ ...prev, logoUrl: j.publicUrl }))
			} else {
				console.error('Logo upload failed:', j?.error)
			}
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
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false)
  const [draftBatch, setDraftBatch] = useState<Batch | null>(null)
  const [isConfirmBatchDeleteOpen, setIsConfirmBatchDeleteOpen] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null)
  const [isBatchReportOpen, setIsBatchReportOpen] = useState(false)
  const [reportDateFilter, setReportDateFilter] = useState("")
  const [reportTypeFilter, setReportTypeFilter] = useState("all")
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

  const handleCreateReport = async (b: Batch) => {
    setActiveBatch(b)
    setReportDateFilter("")
    setReportTypeFilter("all")
    setIsBatchReportOpen(true)
    // Fetch reports for this specific batch
    await fetchReportsForBatch(b.id)
  }

  const handleEditBatchClick = (b: Batch) => {
    setDraftBatch({ ...b })
    setIsEditBatchOpen(true)
  }

  const handleEditStatusClick = (b: Batch) => {
    setDraftBatch({ ...b })
    setIsEditStatusOpen(true)
  }

  	const handleSaveBatch = async () => {
		if (!draftBatch) return
		try {
			// Helper function to handle date fields - convert empty strings to null
			const handleDateField = (value: any) => {
				if (value === undefined || value === '' || value === null) return null
				return value
			}

			const res = await fetch('/api/admin/batches', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: draftBatch.id,
					name: draftBatch.name,
					farmerName: draftBatch.farmerName,
					startDate: handleDateField(draftBatch.startDate),
					birdCount: draftBatch.birdCount,
					status: draftBatch.status,
					mortality: draftBatch.mortality,
					feedUsed: draftBatch.feedUsed,
					healthStatus: draftBatch.healthStatus,
					temperature: draftBatch.temperature,
					humidity: draftBatch.humidity,
					username: draftBatch.username,
					password: draftBatch.password,
					color: draftBatch.color,
					expectedHarvestDate: handleDateField(draftBatch.expectedHarvestDate),
					currentWeight: draftBatch.currentWeight,
					feedConversionRatio: draftBatch.feedConversionRatio,
					vaccinations: draftBatch.vaccinations,
					lastHealthCheck: handleDateField(draftBatch.lastHealthCheck),
					notes: draftBatch.notes,
				})
			})
			const j = await res.json()
			if (res.ok && j.batch) {
				const b = j.batch
				setBatches(prev => prev.map(x => x.id === b.id ? {
					id: b.id,
					name: b.name,
					farmerId: x.farmerId || '',
					farmerName: b.farmer_name || '',
					startDate: b.start_date || '',
					birdCount: b.bird_count || 0,
					age: x.age || 0,
					status: (b.status || 'Planning') as 'Planning' | 'Starting' | 'Active' | 'Finalizing' | 'Completed',
					mortality: b.mortality || 0,
					feedUsed: b.feed_used || 0,
					healthStatus: b.health_status || 'Good',
					temperature: b.temperature || 30,
					humidity: b.humidity || 65,
					username: b.username || '',
					password: b.password || '',
					color: b.color || 'bg-blue-500',
					notes: b.notes || '',
					expectedHarvestDate: b.expected_harvest_date || '',
					currentWeight: b.current_weight || 0,
					feedConversionRatio: b.feed_conversion_ratio || 1.5,
					vaccinations: b.vaccinations || 0,
					lastHealthCheck: b.last_health_check || '',
				} : x))
				setIsEditBatchOpen(false)
			} else {
				console.error('Update batch failed:', j?.error)
			}
		} catch (e) {
			console.error('Update batch exception', e)
		}
	}

	const handleSaveStatus = async () => {
		if (!draftBatch) {
			console.error('❌ No draftBatch found')
			return
		}
		
		console.log('📝 Updating batch status:', {
			id: draftBatch.id,
			status: draftBatch.status,
			healthStatus: draftBatch.healthStatus
		})
		
		try {
			const res = await fetch('/api/admin/batches', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: draftBatch.id,
					status: draftBatch.status,
					healthStatus: draftBatch.healthStatus
				})
			})
			
			const j = await res.json()
			console.log('📥 API Response:', { ok: res.ok, status: res.status, data: j })
			
			if (res.ok && j.batch) {
				// Map database fields (snake_case) to frontend fields (camelCase)
				const updatedFields = {
					status: j.batch.status,
					healthStatus: j.batch.health_status || j.batch.healthStatus,
					temperature: j.batch.temperature,
					humidity: j.batch.humidity,
					mortality: j.batch.mortality,
					feedUsed: j.batch.feed_used || j.batch.feedUsed
				}
				
				console.log('✅ Updating batch in state with:', updatedFields)
				
				setBatches(prev => prev.map(x => 
					x.id === draftBatch.id 
						? { ...x, ...updatedFields } 
						: x
				))
				
				setIsEditStatusOpen(false)
				setDraftBatch(null)
				
				toast.success("Status Updated Successfully", {
					description: `Batch is now ${updatedFields.status} with ${updatedFields.healthStatus} health`
				})
				
				// Reload batches to ensure UI is fully synchronized
				fetchBatches()
			} else {
				console.error('❌ Update status failed:', j?.error)
				toast.error("Update Failed", {
					description: j?.error || 'Unknown error occurred'
				})
			}
		} catch (e: any) {
			console.error('💥 Update status exception:', e)
			toast.error("Update Error", {
				description: e.message || 'An unexpected error occurred'
			})
		}
	}

  const handleConfirmDeleteBatch = (b: Batch) => {
    setBatchToDelete(b)
    setIsConfirmBatchDeleteOpen(true)
  }

  const confirmDeleteBatch = async () => {
    if (batchToDelete) {
      try {
        const response = await fetch(`/api/admin/batches?id=${encodeURIComponent(batchToDelete.id)}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
      setBatches((prev) => prev.filter((x) => x.id !== batchToDelete.id))
          // Also remove related reports and messages from local state
          setReports((prev) => prev.filter((r) => r.batchId !== batchToDelete.id))
          setMessages((prev) => prev.filter((m) => m.batchId !== batchToDelete.id))
        } else {
          const errorData = await response.json()
          console.error('Failed to delete batch:', errorData.error)
          alert(`Failed to delete batch: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Error deleting batch:', error)
        alert('Error deleting batch. Please try again.')
      }
    }
    setIsConfirmBatchDeleteOpen(false)
    setBatchToDelete(null)
  }

  const handleUpdateReport = (id: string, fields: Partial<Report>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...fields } as Report : r)))
  }

  const handleDeleteReport = async (id: string) => {
    try {
      const report = reports.find(r => r.id === id)
      if (!report) return
      
      const response = await fetch(`/api/user/reports?id=${encodeURIComponent(id)}&batchId=${encodeURIComponent(report.batchId)}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
    setReports((prev) => prev.filter((r) => r.id !== id))
      } else {
        const errorData = await response.json()
        console.error('Failed to delete report:', errorData.error)
        alert(`Failed to delete report: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Error deleting report. Please try again.')
    }
  }

  const handleShareToWhatsApp = (report: Report) => {
    const reportData = Object.entries(report.data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        const unit = key.toLowerCase().includes('temperature') ? '°C' : 
                   key.toLowerCase().includes('humidity') ? '%' : 
                   key.toLowerCase().includes('weight') ? ' kg' : 
                   key.toLowerCase().includes('feed') ? ' kg' : ''
        return `${label}: ${value}${unit}`
      }).join('\n')

    const message = `📊 *TARIQ Broiler Report*\n\n` +
      `*Report:* ${report.title}\n` +
      `*Type:* ${report.type}\n` +
      `*Batch:* ${report.batchName}\n` +
      `*Farmer:* ${report.farmerName}\n` +
      `*Date:* ${report.date}\n` +
      `*Status:* ${report.status}\n` +
      `*Priority:* ${report.priority}\n\n` +
      `*Content:*\n${report.content}\n\n` +
      `*Report Data:*\n${reportData}\n\n` +
      `*Admin Comment:*\n${report.adminComment || 'No comment'}\n\n` +
      `Generated: ${new Date().toLocaleString()}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp to share report...')
  }

  const handleShareAllReportsToWhatsApp = () => {
    const totalReports = reports.length
    const pendingCount = reports.filter(r => r.status === 'Pending').length
    const approvedCount = reports.filter(r => r.status === 'Approved').length
    const rejectedCount = reports.filter(r => r.status === 'Rejected').length

    const message = `📊 *TARIQ Broiler - All Reports Summary*\n\n` +
      `*Total Reports:* ${totalReports}\n` +
      `*Pending:* ${pendingCount}\n` +
      `*Approved:* ${approvedCount}\n` +
      `*Rejected:* ${rejectedCount}\n\n` +
      `*Recent Reports:*\n${reports.slice(0, 5).map((r, i) => 
        `${i + 1}. ${r.title} (${r.status}) - ${r.farmerName}`
      ).join('\n')}\n\n` +
      `*Export Details:*\n` +
      `• Export Date: ${new Date().toLocaleDateString()}\n` +
      `• Export Time: ${new Date().toLocaleTimeString()}\n` +
      `• System: TARIQ Broiler Management\n\n` +
      `Full detailed export available in system.`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp to share reports summary...')
  }

  const handleUpdateMessage = (id: string, fields: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } as Message : m)))
  }

  const handleDeleteMessage = async (id: string) => {
    try {
      const message = messages.find(m => m.id === id)
      if (!message) return
      
      const response = await fetch(`/api/user/messages?id=${encodeURIComponent(id)}&batchId=${encodeURIComponent(message.batchId)}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
    setMessages((prev) => prev.filter((m) => m.id !== id))
      } else {
        const errorData = await response.json()
        console.error('Failed to delete message:', errorData.error)
        alert(`Failed to delete message: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Error deleting message. Please try again.')
    }
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

  const menuItems = user?.role === "admin" ? [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "user-activity", label: "User Activity", icon: Activity },
    { id: "farmers", label: t.farmerProfiles, icon: Users },
    { id: "batches", label: t.batchManagement, icon: Building },
    { id: "analytics", label: "Analytics & Insights", icon: BarChart3 },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "system-settings", label: "System Settings", icon: Settings },
  ] : [
    { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
    { id: "batches", label: t.batchManagement, icon: Building },
    { id: "communication", label: "Communication", icon: MessageSquare },
  ]

  return (
    <AdminShell 
      active={activeTab} 
      onSelect={setActiveTab} 
      menuItems={menuItems}
      language={language}
      onLanguageChange={setLanguage}
      onLogout={handleLogout}
    >
      {/* Real-time Notifications */}
      <RealTimeNotification 
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hidden" />
        <TabsContent value="dashboard" className="space-y-6 pt-4">
          <SectionHeader activeSection="dashboard" />
          
          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 mb-4">
            <Button 
              onClick={handleSystemRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh System
            </Button>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportAllReports}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Export All Reports
              </Button>
              <Button 
                onClick={handleShareAllReportsToWhatsApp}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                <Share2 className="h-4 w-4" />
                Share Summary
              </Button>
            </div>
          </div>
          
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
        
        {/* User Activity Tab */}
        <TabsContent value="user-activity" className="space-y-6 pt-4">
          <SectionHeader activeSection="user-activity" />
          <UserActivityPanel onRefresh={handleSystemRefresh} />
        </TabsContent>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Professional Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-600 text-sm font-semibold">Current Birds</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-800">{totalRemainingBirds.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-2">
                      <Activity className="h-3 w-3 mr-1" />
                      of {totalChicks.toLocaleString()} total
                    </p>
                    {totalChicks > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Survival Rate</span>
                          <span>{((totalRemainingBirds / totalChicks) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(totalRemainingBirds / totalChicks) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-green-600 text-sm font-semibold">{t.totalBatches}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-800">{batches.length}</p>
                    <p className="text-xs text-green-600 flex items-center mt-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All monitored
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Building className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-red-600 text-sm font-semibold">{t.totalMortality}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-800">{totalMortality.toLocaleString()}</p>
                    <p className="text-xs text-red-600 flex items-center mt-2">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {totalChicks > 0 ? ((totalMortality / totalChicks) * 100).toFixed(2) : '0.00'}% mortality rate
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow transition-all duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-600 text-sm font-semibold">{t.activeFarmers}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-800">{activeFarmersCount}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-2">
                      <Users className="h-3 w-3 mr-1" />
                      Professional farmers
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Status Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      System Status: {isOnline ? 'Online' : 'Offline'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Connection: {connectionStatus} • Last seen: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-600" />
                  )}
                  <Badge variant={isOnline ? "default" : "destructive"}>
                    {isOnline ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

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
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getReportTypeIcon(report.reportType || 'daily')}</span>
                                <h4 className="font-semibold text-gray-800">{report.title}</h4>
                              </div>
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
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteItem('report', report.id, report.title)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
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
        <TabsContent value="farmers" className="space-y-6 pt-4">
          <SectionHeader activeSection="farmers" />
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
              {user?.role === "admin" && (
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
              )}
            </div>
          )}
        </TabsContent>
        {/* Batch Management Tab */}
        <TabsContent value="batches" className="space-y-6 md:col-span-9 pt-4">
          <SectionHeader activeSection="batches" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
            <h3 className="text-2xl font-bold text-gray-800">{t.batchManagement}</h3>
              <p className="text-sm text-gray-600 mt-1">Manage and create new batches for farmers</p>
            </div>
            {user?.role === "admin" && (
              <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-semibold px-6 py-3">
                  <Plus className="h-5 w-5" />
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
            )}
          </div>

          {/* Quick Actions Card */}
          {user?.role === "admin" && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">Quick Actions</h4>
                      <p className="text-sm text-gray-600">Create new batches, manage farmers, and view analytics</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => setIsAddBatchOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Batch
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("farmers")}
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Farmers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <p className="text-xs text-gray-600">Remaining Birds</p>
                      <p className="font-bold text-blue-800">{batch.remainingBirds?.toLocaleString() || batch.birdCount.toLocaleString()}</p>
                      {batch.totalChicks && batch.totalChicks !== batch.remainingBirds && (
                        <p className="text-xs text-gray-500">of {batch.totalChicks.toLocaleString()} total</p>
                      )}
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
                        {user?.role === "admin" && (
                          <DropdownMenuItem onClick={() => handleEditBatchClick(batch)}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit Batch
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEditStatusClick(batch)}>
                          <Activity className="h-3 w-3 mr-2" />
                          Edit Status
                        </DropdownMenuItem>
                        {user?.role === "admin" && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleConfirmDeleteBatch(batch)}>
                            <Trash2 className="h-3 w-3 mr-2" />
                            {t.delete}
                          </DropdownMenuItem>
                        )}
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
                      <p className="text-xs text-gray-600">Remaining Birds</p>
                      <p className="text-2xl font-bold text-blue-700">{activeBatch.remainingBirds?.toLocaleString() || activeBatch.birdCount.toLocaleString()}</p>
                      {activeBatch.totalChicks && activeBatch.totalChicks !== activeBatch.remainingBirds && (
                        <p className="text-xs text-gray-500">of {activeBatch.totalChicks.toLocaleString()} total</p>
                      )}
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
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Edit Batch Details
                </DialogTitle>
                <DialogDescription>
                  Edit batch information (status editing is separate)
                </DialogDescription>
              </DialogHeader>
              {draftBatch && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eb-name">Batch Name *</Label>
                    <Input 
                      id="eb-name" 
                      value={draftBatch.name} 
                      onChange={(e) => setDraftBatch({ ...draftBatch, name: e.target.value })} 
                      className="mt-1" 
                      placeholder="Enter batch name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eb-birds">Bird Count *</Label>
                      <Input 
                        id="eb-birds" 
                        type="number" 
                        value={draftBatch.birdCount} 
                        onChange={(e) => setDraftBatch({ ...draftBatch, birdCount: Number(e.target.value) })} 
                        className="mt-1" 
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eb-start">Start Date *</Label>
                      <Input 
                        id="eb-start" 
                        type="date" 
                        value={draftBatch.startDate} 
                        onChange={(e) => setDraftBatch({ ...draftBatch, startDate: e.target.value })} 
                        className="mt-1" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eb-mortality">Mortality</Label>
                      <Input 
                        id="eb-mortality" 
                        type="number" 
                        value={draftBatch.mortality} 
                        onChange={(e) => setDraftBatch({ ...draftBatch, mortality: Number(e.target.value) })} 
                        className="mt-1" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eb-feed">Feed Bags Used</Label>
                      <Input 
                        id="eb-feed" 
                        type="number" 
                        value={draftBatch.feedUsed} 
                        onChange={(e) => setDraftBatch({ ...draftBatch, feedUsed: Number(e.target.value) })} 
                        className="mt-1" 
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eb-username">Username *</Label>
                      <Input 
                        id="eb-username" 
                        value={draftBatch.username} 
                        onChange={(e) => setDraftBatch({ ...draftBatch, username: e.target.value })} 
                        className="mt-1" 
                        placeholder="batch_username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eb-password">Password *</Label>
                      <Input 
                        id="eb-password" 
                        type="password"
                        value={draftBatch.password} 
                        onChange={(e) => setDraftBatch({ ...draftBatch, password: e.target.value })} 
                        className="mt-1" 
                        placeholder="secure_password"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="eb-notes">Notes</Label>
                    <Textarea
                      id="eb-notes"
                      value={draftBatch.notes || ''}
                      onChange={(e) => setDraftBatch({ ...draftBatch, notes: e.target.value })}
                      className="mt-1"
                      placeholder="Additional batch information..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> To edit status and health, use the "Edit Status" option from the batch menu.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveBatch} className="flex-1 bg-blue-500 hover:bg-blue-600">
                      <Edit className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditBatchOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Status Dialog */}
          <Dialog open={isEditStatusOpen} onOpenChange={setIsEditStatusOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Edit Batch Status
                </DialogTitle>
                <DialogDescription>
                  Update the status and health of this batch
                </DialogDescription>
              </DialogHeader>
              {draftBatch && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-1">Batch: {draftBatch.name}</h3>
                    <p className="text-sm text-blue-600">Current Status: <span className="font-semibold">{draftBatch.status}</span></p>
                  </div>
                  
                  <div>
                    <Label htmlFor="es-status">Status *</Label>
                    <Select 
                      value={draftBatch.status} 
                      onValueChange={(v) => setDraftBatch({ ...draftBatch, status: v as "Planning" | "Starting" | "Active" | "Finalizing" | "Completed" })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Starting">Starting</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Finalizing">Finalizing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="es-health">Health Status *</Label>
                    <Select 
                      value={draftBatch.healthStatus} 
                      onValueChange={(v) => setDraftBatch({ ...draftBatch, healthStatus: v as "Excellent" | "Good" | "Fair" | "Poor" })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select health status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveStatus} className="flex-1 bg-green-500 hover:bg-green-600">
                      <Activity className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditStatusOpen(false)}>
                      Cancel
                    </Button>
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Batch Reports
                    </DialogTitle>
                    {activeBatch && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reports for <span className="font-semibold text-blue-600">{activeBatch.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleExportAllReports}
                      size="sm"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4" />
                      Export All
                    </Button>
                    <Button
                      onClick={handleShareAllReportsToWhatsApp}
                      size="sm"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              {activeBatch && (
                <div className="space-y-6">
                  {/* Filter Section */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor="dateFilter" className="text-sm font-medium text-gray-700">
                            Filter by Date
                          </Label>
                          <Input
                            id="dateFilter"
                            type="date"
                            value={reportDateFilter}
                            onChange={(e) => setReportDateFilter(e.target.value)}
                            className="mt-1"
                            placeholder="Select date"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="typeFilter" className="text-sm font-medium text-gray-700">
                            Filter by Type
                          </Label>
                          <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="All report types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="Daily">Daily Report</SelectItem>
                              <SelectItem value="Mortality">Mortality Report</SelectItem>
                              <SelectItem value="Health">Health Report</SelectItem>
                              <SelectItem value="Feed">Feed Report</SelectItem>
                              <SelectItem value="Vaccination">Vaccination Report</SelectItem>
                              <SelectItem value="Environment">Environment Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReportDateFilter("")
                              setReportTypeFilter("all")
                            }}
                            className="h-10"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reports Summary */}
                  {reports.filter((r) => {
                    const matchesBatch = r.batchId === activeBatch.id
                    const matchesDate = !reportDateFilter || 
                      (r.created_at && new Date(r.created_at).toDateString() === new Date(reportDateFilter).toDateString()) ||
                      (r.date && r.date === reportDateFilter)
                    const matchesType = reportTypeFilter === "all" || r.type === reportTypeFilter
                    return matchesBatch && matchesDate && matchesType
                  }).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-sm font-semibold">Total</p>
                              <p className="text-2xl font-bold text-blue-800">
                                {reports.filter((r) => r.batchId === activeBatch.id).length}
                              </p>
                        </div>
                            <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-600 text-sm font-semibold">Pending</p>
                              <p className="text-2xl font-bold text-yellow-800">
                                {reports.filter((r) => r.batchId === activeBatch.id && r.status === 'Pending').length}
                              </p>
                            </div>
                            <Clock className="h-6 w-6 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-600 text-sm font-semibold">Approved</p>
                              <p className="text-2xl font-bold text-green-800">
                                {reports.filter((r) => r.batchId === activeBatch.id && r.status === 'Approved').length}
                              </p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-600 text-sm font-semibold">Rejected</p>
                              <p className="text-2xl font-bold text-red-800">
                                {reports.filter((r) => r.batchId === activeBatch.id && r.status === 'Rejected').length}
                              </p>
                            </div>
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Reports List */}
                  {reports.filter((r) => {
                    const matchesBatch = r.batchId === activeBatch.id
                    const matchesDate = !reportDateFilter || 
                      (r.created_at && new Date(r.created_at).toDateString() === new Date(reportDateFilter).toDateString()) ||
                      (r.date && r.date === reportDateFilter)
                    const matchesType = reportTypeFilter === "all" || r.type === reportTypeFilter
                    return matchesBatch && matchesDate && matchesType
                  }).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {reportDateFilter || reportTypeFilter !== "all" 
                          ? "No reports found matching your filters" 
                          : "No reports found for this batch"
                        }
                      </p>
                      <p className="text-sm">
                        {reportDateFilter || reportTypeFilter !== "all" 
                          ? "Try adjusting your date or type filters" 
                          : "Reports will appear here when the farmer submits them"
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-blue-50 border-b border-blue-200">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Type</th>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Title</th>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Farmer</th>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Date</th>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Status</th>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Priority</th>
                              <th className="px-3 py-2 text-left font-medium text-blue-800">Read</th>
                              <th className="px-3 py-2 text-center font-medium text-blue-800">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.filter((r) => {
                              const matchesBatch = r.batchId === activeBatch.id
                              const matchesDate = !reportDateFilter || 
                                (r.created_at && new Date(r.created_at).toDateString() === new Date(reportDateFilter).toDateString()) ||
                                (r.date && r.date === reportDateFilter)
                              const matchesType = reportTypeFilter === "all" || r.type === reportTypeFilter
                              return matchesBatch && matchesDate && matchesType
                            }).map((r) => (
                              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                      {getReportTypeIcon(r.type)}
                                    </div>
                                    <span className="font-medium text-gray-700">{r.type}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="max-w-xs truncate">
                                    <span className="font-medium text-gray-900">{r.title}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-gray-700">{r.farmerName}</td>
                                <td className="px-3 py-2 text-gray-600">
                                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : r.date || 'Unknown'}
                                </td>
                                <td className="px-3 py-2">
                                  <Badge 
                                    className={`text-xs ${
                                      r.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                      r.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">
                                  <Badge 
                                    className={`text-xs ${
                                      r.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                      r.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                      r.priority === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {r.priority}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">
                                  <Badge 
                                    className={`text-xs ${
                                      r.is_read ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {r.is_read ? 'Read' : 'Unread'}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1">
                                    {r.status === "Pending" && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleApproveReport(r.id)} 
                                          className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Approve
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="destructive" 
                                          onClick={() => handleRejectReport(r.id)}
                                          className="h-6 px-2 text-xs"
                                        >
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleExportPDF("report", r)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleShareToWhatsApp(r)}
                                      className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                    >
                                      <Share2 className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      onClick={() => handleDeleteReport(r.id)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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

          {/* Report Detail Dialog */}
          <Dialog open={isReportDetailOpen} onOpenChange={setIsReportDetailOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Details
                </DialogTitle>
              </DialogHeader>
              {selectedReport && (
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">{selectedReport.title}</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className="bg-blue-100 text-blue-800">{selectedReport.type}</Badge>
                          <Badge className={`${
                            selectedReport.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            selectedReport.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedReport.status}
                          </Badge>
                          <Badge className={`${
                            selectedReport.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            selectedReport.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            selectedReport.priority === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedReport.priority}
                          </Badge>
                          <Badge className={`${
                            selectedReport.is_read ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedReport.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-700">Farmer:</span> {selectedReport.farmerName}
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Batch:</span> {selectedReport.batchName}
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Date:</span> {selectedReport.date}
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">Created:</span> {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleExportPDF("report", selectedReport)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareToWhatsApp(selectedReport)}
                          className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        >
                          <Share2 className="h-4 w-4" />
                          Share WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Report Content</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{selectedReport.content}</p>
                    </div>
                  </div>

                  {/* Report Data */}
                  {Object.keys(selectedReport.data).length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Report Data</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(selectedReport.data)
                          .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                          .map(([key, value]) => {
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                            const unit = key.toLowerCase().includes('temperature') ? '°C' : 
                                       key.toLowerCase().includes('humidity') ? '%' : 
                                       key.toLowerCase().includes('weight') ? ' kg' : 
                                       key.toLowerCase().includes('feed') ? ' kg' : ''
                            return (
                              <div key={key} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-600 mb-1">{label}</div>
                                <div className="text-xl font-bold text-blue-900">{value}{unit}</div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {/* Admin Comment */}
                  {selectedReport.adminComment && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">💬 Admin Comment</h3>
                      <p className="text-yellow-800">{selectedReport.adminComment}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedReport.status === "Pending" && (
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => handleApproveReport(selectedReport.id)}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve Report
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectReport(selectedReport.id)}
                        className="flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Reject Report
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="h-full overflow-hidden">
          <CommunicationComingSoon />
        </TabsContent>

        {/* Analytics & Insights Tab */}
        <TabsContent value="analytics" className="space-y-6 pt-4">
          <SectionHeader activeSection="analytics" />
          
          {/* Analytics Dashboard */}
          <AnalyticsDashboard batches={batches} reports={reports} />
          
          {/* AI Insights & Recommendations - Primary Section */}
          <div className="mt-6">
            <InsightsSystem batches={batches} reports={reports} />
          </div>
          
          {/* Automated Alerts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Real-Time Monitoring Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AutomatedAlerts 
                batches={batches} 
                reports={reports}
                onAlertClick={(alert) => {
                  toast.info("Alert Action", {
                    description: `Taking action for: ${alert.title}`
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system-settings" className="space-y-6 pt-4">
          <SectionHeader activeSection="system-settings" />
          
          {/* System Settings */}
          <SystemSettingsPanel />
        </TabsContent>
      </Tabs>

      {/* Floating Action Button for Mobile */}
      {user?.role === "admin" && activeTab === "batches" && (
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <Button
            onClick={() => setIsAddBatchOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              <strong>Item:</strong> {itemToDelete?.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {itemToDelete?.type}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteConfirmOpen(false)
                setItemToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
