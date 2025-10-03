"use client"

import { useEffect, useState } from "react"
import AdminShell from "@/components/admin/admin-shell"
import ChartMessagingSystem from "@/components/chart/messaging-system"
import DynamicReportForm from "@/components/reports/dynamic-report-form"
import { getReportTypeIcon } from "@/lib/report-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Activity, AlertTriangle, Building, Clock, Download, Eye, FileText, LayoutDashboard, Mail, Menu, MessageSquare, Thermometer, Droplets, CalendarDays } from "lucide-react"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { playNotificationSound } from "@/lib/audio-notifications"
import { toast } from "sonner"

interface Batch {
	id: string
	name: string
	farmerName: string
	startDate: string
	birdCount: number
	status: "Planning" | "Starting" | "Active" | "Finalizing" | "Completed"
	mortality: number
	feedUsed: number
	healthStatus: "Excellent" | "Good" | "Fair" | "Poor"
	temperature: number
	humidity: number
	username: string
	color: string
	currentWeight: number
	feedConversionRatio: number
	vaccinations: number
	lastHealthCheck: string
	notes?: string
	expectedHarvestDate?: string
}

interface Report {
	id: string
	type: "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination"
	batchId: string
	title: string
	content: string
	status: "Sent" | "Draft" | "Approved" | "Rejected"
	date: string
	priority: "Normal" | "High" | "Urgent" | "Critical"
	fields?: Record<string, any>
	reportType?: string
}

interface Message {
	id: string
	batchId: string
	subject: string
	content: string
	date: string
	status: "Sent" | "Read"
}

interface User {
	role: string
	batchId?: string
	username?: string
	id?: string
	email?: string | null
}

interface FarmProfile {
	id: string
	name: string
	email: string
	phone: string
	address: string
	logo_url?: string
	description?: string
	owner_name?: string
	established_date?: string
	status?: "Active" | "Inactive"
	rating?: number
	created_at?: string
	updated_at?: string
}

export default function BatchDashboard() {
	const [user, setUser] = useState<User | null>(null)
	const [batch, setBatch] = useState<Batch | null>(null)
	const [reports, setReports] = useState<Report[]>([])
	const [messages, setMessages] = useState<Message[]>([])
	const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null)
	const [activeTab, setActiveTab] = useState("dashboard")
	const [stats, setStats] = useState<{ totalChicks: number; daysSinceStart: number; totalMortality: number; totalFeedBagsUsed: number } | null>(null)

	// Drafts / forms
	const [draftBatch, setDraftBatch] = useState<Partial<Batch>>({})
	const [reportType, setReportType] = useState<Report["type"]>("Daily")
	const [reportPriority, setReportPriority] = useState<Report["priority"]>("Normal")
	const [reportTitle, setReportTitle] = useState("")
	const [reportContent, setReportContent] = useState("")
	const [messageSubject, setMessageSubject] = useState("")
	const [messageContent, setMessageContent] = useState("")
	const [isSavingBatch, setIsSavingBatch] = useState(false)
	const [isSubmittingReport, setIsSubmittingReport] = useState(false)
	const [isSendingMessage, setIsSendingMessage] = useState(false)
	const [reportFields, setReportFields] = useState<Record<string, any>>({})
	const [isLoading, setIsLoading] = useState(true)
	const [loadError, setLoadError] = useState<string | null>(null)
	
	// Modal state
	const [isReportModalOpen, setIsReportModalOpen] = useState(false)
	const [selectedReportType, setSelectedReportType] = useState<Report["type"]>("Daily")
	const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined)
	const [modalMode, setModalMode] = useState<"create" | "view">("create")
	const [isFarmProfileModalOpen, setIsFarmProfileModalOpen] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const setField = (key: string, value: any) => setReportFields((prev) => ({ ...prev, [key]: value }))

	useEffect(() => {
		const raw = localStorage.getItem("user")
		if (!raw) {
			console.log("No user data found in localStorage")
			setIsLoading(false)
			return
		}
		
		try {
			const u = JSON.parse(raw) as User
			console.log("Loaded user from localStorage:", u)
			
			// Validate user object has required properties
			if (!u || typeof u !== 'object' || !u.role) {
				console.error("Invalid user data in localStorage:", u)
				setLoadError("Invalid user data. Please log in again.")
				setIsLoading(false)
				return
			}
			
			setUser(u)
		} catch (error) {
			console.error("Failed to parse user data from localStorage:", error)
			setLoadError("Failed to load user data. Please log in again.")
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		if (!user || user.role !== "batch") {
			setIsLoading(false)
			return
		}
		
		setIsLoading(true)
		setLoadError(null)
		
		// Check if we have a valid batchId
		if (!user.batchId) {
			console.warn("No batchId found for user, attempting to load by username:", user)
			// Try to get batch by username as fallback
			if (user.username) {
				const loadByUsername = async () => {
					try {
						console.log("Attempting to load batch by username:", user.username)
						const batchRes = await fetch(`/api/user/batch?username=${encodeURIComponent(user.username || '')}`)
						if (!batchRes.ok) {
							console.error("Failed to load batch by username:", batchRes.status, batchRes.statusText)
							setLoadError("Failed to load batch data. Please try logging in again.")
							setIsLoading(false)
							return
						}
						const batchJson = await batchRes.json()
						if (batchJson.batch) {
							console.log("Found batch by username:", batchJson.batch)
							const mappedBatch = mapBatchData(batchJson.batch)
							setBatch(mappedBatch)
							setDraftBatch(mappedBatch)
							// Update user with the found batchId
							const updatedUser = { ...user, batchId: batchJson.batch.id }
							setUser(updatedUser)
							localStorage.setItem("user", JSON.stringify(updatedUser))
							// Now load other data with the correct batchId
							loadBatchData(batchJson.batch.id)
						} else {
							console.error("No batch found for username:", user.username)
							setLoadError("No batch found for your account. Please contact support.")
							setIsLoading(false)
						}
					} catch (error) {
						console.error("Failed to load batch by username:", error)
						setLoadError("Failed to load batch data. Please try again.")
						setIsLoading(false)
					}
				}
				loadByUsername()
			} else {
				console.error("No username available to load batch")
				setLoadError("Invalid user data. Please log in again.")
				setIsLoading(false)
			}
			return
		}
		
		// Load data with valid batchId
		loadBatchData(user.batchId)
	}, [user])

	// Real-time subscriptions for batch dashboard
	useEffect(() => {
		if (!user || !user.batchId) return

		// Subscribe to report status updates (approval/rejection from admin)
		const reportsSubscription = supabase
			.channel('batch_reports_changes')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'reports',
					filter: `batch_id=eq.${user.batchId}`
				},
				(payload) => {
					console.log('📊 Report status updated:', payload.new)
					const updatedReport = payload.new as any
					setReports(prev => 
						prev.map(report => 
							report.id === updatedReport.id ? { ...report, ...updatedReport } : report
						)
					)
					
					// Show notification for status changes
					if (updatedReport.status === 'Approved') {
						console.log('✅ Report approved:', updatedReport.title)
					} else if (updatedReport.status === 'Rejected') {
						console.log('❌ Report rejected:', updatedReport.title)
					}
				}
			)
			.subscribe()

		// Subscribe to new messages for this batch
		const messagesSubscription = supabase
			.channel('batch_messages_changes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `batch_id=eq.${user.batchId}`
				},
				(payload) => {
					console.log('💬 New message received:', payload.new)
					const newMessage = payload.new as any
					setMessages(prev => [newMessage, ...prev])
					
					// Play notification sound
					playNotificationSound('message')
				}
			)
			.subscribe()

		// Subscribe to batch updates
		const batchSubscription = supabase
			.channel('batch_updates_changes')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'batches',
					filter: `id=eq.${user.batchId}`
				},
				(payload) => {
					console.log('📊 Batch updated:', payload.new)
					const updatedBatch = payload.new as any
					const mappedBatch = mapBatchData(updatedBatch)
					setBatch(prev => ({ ...prev, ...mappedBatch }))
					setDraftBatch(prev => ({ ...prev, ...mappedBatch }))
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(reportsSubscription)
			supabase.removeChannel(messagesSubscription)
			supabase.removeChannel(batchSubscription)
		}
	}, [user])

	// Helper function to map database fields to frontend interface
	const mapBatchData = (dbBatch: any): Batch => {
		return {
			id: dbBatch.id,
			name: dbBatch.name,
			farmerName: dbBatch.farmer_name,
			startDate: dbBatch.start_date,
			birdCount: dbBatch.bird_count,
			status: dbBatch.status,
			mortality: dbBatch.mortality,
			feedUsed: dbBatch.feed_used,
			healthStatus: dbBatch.health_status,
			temperature: dbBatch.temperature,
			humidity: dbBatch.humidity,
			username: dbBatch.username,
			color: dbBatch.color,
			currentWeight: dbBatch.current_weight,
			feedConversionRatio: dbBatch.feed_conversion_ratio || 0,
			vaccinations: dbBatch.vaccinations,
			lastHealthCheck: dbBatch.last_health_check,
			notes: dbBatch.notes,
			expectedHarvestDate: dbBatch.expected_harvest_date,
		}
	}

	const loadBatchData = async (batchId: string) => {
		try {
			console.log("Loading batch data for batchId:", batchId)
			
			// Load batch data
			const batchRes = await fetch(`/api/user/batch?batchId=${encodeURIComponent(batchId)}`)
			if (!batchRes.ok) {
				console.error("Failed to load batch:", batchRes.status, batchRes.statusText)
				const errorText = await batchRes.text()
				console.error("Error response:", errorText)
			} else {
				const batchJson = await batchRes.json()
				const mappedBatch = batchJson.batch ? mapBatchData(batchJson.batch) : null
				setBatch(mappedBatch)
				if (mappedBatch) setDraftBatch(mappedBatch)
			}
			
			// Load reports
			const repRes = await fetch(`/api/user/reports?batchId=${encodeURIComponent(batchId)}`)
			if (!repRes.ok) {
				console.error("Failed to load reports:", repRes.status, repRes.statusText)
			} else {
				const repJson = await repRes.json()
				setReports(repJson.reports || [])
			}
			
			// Load farm profile
			const farmRes = await fetch(`/api/user/profile`)
			if (!farmRes.ok) {
				console.error("Failed to load farm profile:", farmRes.status, farmRes.statusText)
			} else {
				const farmJson = await farmRes.json()
				setFarmProfile(farmJson.farmProfile || null)
			}
			
			// Load stats
			const statsRes = await fetch(`/api/user/stats?batchId=${encodeURIComponent(batchId)}`)
			if (!statsRes.ok) {
				console.error("Failed to load stats:", statsRes.status, statsRes.statusText)
			} else {
				const statsJson = await statsRes.json()
				setStats(statsJson.stats || null)
			}
			
			// Load messages
			const msgRes = await fetch(`/api/user/messages?batchId=${encodeURIComponent(batchId)}`)
			if (!msgRes.ok) {
				console.error("Failed to load messages:", msgRes.status, msgRes.statusText)
			} else {
				const msgJson = await msgRes.json()
				setMessages(msgJson.messages || [])
			}
		} catch (error) {
			console.error("Failed to load batch data:", error)
			setLoadError("Failed to load batch data. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	const handleSaveBatch = async () => {
		if (!draftBatch?.id) return
		setIsSavingBatch(true)
		try {
			const res = await fetch("/api/user/batch", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: draftBatch.id,
					name: draftBatch.name,
					birdCount: draftBatch.birdCount,
					startDate: draftBatch.startDate,
					notes: draftBatch.notes,
					status: draftBatch.status,
				}),
			})
			const data = await res.json()
			if (data.batch) {
				const mappedBatch = mapBatchData(data.batch)
				setBatch(mappedBatch)
				setDraftBatch(mappedBatch)
				// refresh stats
				if (data.batch?.id) {
					const statsRes = await fetch(`/api/user/stats?batchId=${encodeURIComponent(data.batch.id)}`)
					const statsJson = await statsRes.json()
					setStats(statsJson.stats || null)
				}
			}
		} finally {
			setIsSavingBatch(false)
		}
	}

	const handleCreateReport = async () => {
		if (!batch || !batch.id) {
			console.error("No batch or batch ID available for report creation")
			return
		}
		if (!reportTitle || !reportContent) return
		setIsSubmittingReport(true)
		try {
			const res = await fetch("/api/user/reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ batchId: batch.id, type: reportType, title: reportTitle, content: reportContent, priority: reportPriority, fields: reportFields }),
			})
			const data = await res.json()
			if (data.report) {
				setReports((prev) => [data.report, ...prev])
				setReportTitle("")
				setReportContent("")
				setReportFields({})
			}
		} finally {
			setIsSubmittingReport(false)
		}
	}

	const handleSendMessage = async () => {
		if (!batch || !batch.id) {
			console.error("No batch or batch ID available for message sending")
			return
		}
		if (!messageSubject || !messageContent) return
		setIsSendingMessage(true)
		try {
			const res = await fetch("/api/user/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ batchId: batch.id, subject: messageSubject, content: messageContent }),
			})
			const data = await res.json()
			if (data.message) {
				setMessages((prev) => [data.message, ...prev])
				setMessageSubject("")
				setMessageContent("")
			}
		} finally {
			setIsSendingMessage(false)
		}
	}

	// Modal functions
	const openCreateReportModal = (type: Report["type"]) => {
		setSelectedReportType(type)
		setModalMode("create")
		setSelectedReport(undefined)
		setIsReportModalOpen(true)
	}

	const openViewReportModal = (report: Report) => {
		setSelectedReport(report)
		setModalMode("view")
		setIsReportModalOpen(true)
	}

	const handleReportSubmitted = (newReport: Report) => {
		setReports((prev) => [newReport, ...prev])
		setIsReportModalOpen(false)
		// Refresh stats after report submission
		if (batch?.id) {
			fetch(`/api/user/stats?batchId=${encodeURIComponent(batch.id)}`)
				.then(res => res.json())
				.then(data => setStats(data.stats || null))
				.catch(console.warn)
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		)
	}

	if (loadError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-8 h-8 text-red-600" />
					</div>
					<h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
					<p className="text-gray-600 mb-4">{loadError}</p>
					<div className="space-y-2">
						<Button 
							onClick={() => {
								// Clear invalid user data and redirect to login
								localStorage.removeItem("user")
								window.location.href = "/batch-login"
							}} 
							className="bg-blue-600 hover:bg-blue-700 w-full"
						>
							Go to Login
						</Button>
						<Button 
							onClick={() => window.location.reload()} 
							variant="outline"
							className="w-full"
						>
							Try Again
						</Button>
						<Button 
							onClick={() => {
								console.log("Current user:", user)
								console.log("Current batch:", batch)
								console.log("Current farmProfile:", farmProfile)
								console.log("LocalStorage user:", localStorage.getItem("user"))
							}} 
							variant="outline"
							className="w-full"
						>
							Debug Info
						</Button>
					</div>
				</div>
			</div>
		)
	}

	// Check for invalid user data
	if (!user || !user.role || user.role !== "batch") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-8 h-8 text-red-600" />
					</div>
					<h3 className="text-lg font-semibold text-gray-800 mb-2">Invalid User Session</h3>
					<p className="text-gray-600 mb-4">Please log in to access the batch dashboard.</p>
					<Button 
						onClick={() => {
							localStorage.removeItem("user")
							window.location.href = "/batch-login"
						}} 
						className="bg-blue-600 hover:bg-blue-700 w-full"
					>
						Go to Login
					</Button>
				</div>
			</div>
		)
	}

	if (!batch) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		)
	}

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

	const menuItems = [
		{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
		{ id: "farm-profile", label: "Farm Profile", icon: Building },
		{ id: "my-batch", label: "My Batch", icon: Activity },
		{ id: "reports", label: "Reports", icon: FileText },
		{ id: "messages", label: "Messages", icon: MessageSquare },
		{ id: "chart", label: "Chat", icon: MessageSquare },
	]

	return (
		<AdminShell active={activeTab} onSelect={setActiveTab} menuItems={menuItems}>
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Batch Operator</h2>
				<p className="text-gray-600 text-lg">Submit reports and monitor your batch. Admin can see all data.</p>
			</div>

			{/* Mobile Navigation Menu */}
			<div className="lg:hidden mb-6">
				<div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50">
					<h2 className="text-lg font-bold text-gray-800">Batch Dashboard</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="lg:hidden"
					>
						<Menu className="h-4 w-4" />
					</Button>
				</div>
				
				{isMobileMenuOpen && (
					<div className="mt-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 overflow-hidden">
						<div className="grid grid-cols-2 gap-1 p-2">
							<Button
								variant={activeTab === "dashboard" ? "default" : "ghost"}
								onClick={() => {
									setActiveTab("dashboard")
									setIsMobileMenuOpen(false)
								}}
								className="justify-start"
							>
								<LayoutDashboard className="h-4 w-4 mr-2" />
								Dashboard
							</Button>
							<Button
								variant={activeTab === "farm-profile" ? "default" : "ghost"}
								onClick={() => {
									setActiveTab("farm-profile")
									setIsMobileMenuOpen(false)
								}}
								className="justify-start"
							>
								<Building className="h-4 w-4 mr-2" />
								Farm Profile
							</Button>
							<Button
								variant={activeTab === "my-batch" ? "default" : "ghost"}
								onClick={() => {
									setActiveTab("my-batch")
									setIsMobileMenuOpen(false)
								}}
								className="justify-start"
							>
								<Activity className="h-4 w-4 mr-2" />
								My Batch
							</Button>
							<Button
								variant={activeTab === "reports" ? "default" : "ghost"}
								onClick={() => {
									setActiveTab("reports")
									setIsMobileMenuOpen(false)
								}}
								className="justify-start"
							>
								<FileText className="h-4 w-4 mr-2" />
								Reports
							</Button>
						</div>
					</div>
				)}
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				{/* Desktop Navigation */}
				<div className="hidden lg:block mb-6">
					<TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border border-gray-200/50">
						<TabsTrigger value="dashboard" className="flex items-center gap-2">
							<LayoutDashboard className="h-4 w-4" />
							Dashboard
						</TabsTrigger>
						<TabsTrigger value="farm-profile" className="flex items-center gap-2">
							<Building className="h-4 w-4" />
							Farm Profile
						</TabsTrigger>
						<TabsTrigger value="my-batch" className="flex items-center gap-2">
							<Activity className="h-4 w-4" />
							My Batch
						</TabsTrigger>
						<TabsTrigger value="reports" className="flex items-center gap-2">
							<FileText className="h-4 w-4" />
							Reports
						</TabsTrigger>
					</TabsList>
				</div>

				{/* DASHBOARD: simple totals only from server-side */}
				<TabsContent value="dashboard" className="space-y-6">
					{/* Chick animation */}
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
						<CardContent className="p-0">
							<div className="relative h-40 md:h-44 w-full overflow-hidden bg-gradient-to-r from-amber-50 via-white to-sky-50">
								<div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
								{/* Feeder (left) with label */}
								<div className="absolute left-[6%] bottom-5 flex items-center gap-2">
									<div className="w-28 h-8 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full shadow-inner ring-1 ring-amber-400/40" />
									<div className="px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full bg-amber-100 text-amber-700 border border-amber-200 shadow-sm hidden xs:inline-flex">Feeder</div>
								</div>
								{/* Drinker (right) with label */}
								<div className="absolute right-[6%] bottom-4 w-8 h-24 bg-gradient-to-b from-sky-300 to-sky-400 rounded-full shadow-inner ring-1 ring-sky-400/40 drinker">
									<div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-sky-300 rounded-full droplet" />
									<div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-sky-300 rounded-full droplet2" />
									<div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-sky-300/70 rounded-full ripple" />
								</div>
								<div className="absolute right-[3%] bottom-4 px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full bg-sky-100 text-sky-700 border border-sky-200 shadow-sm hidden xs:inline-flex">Drinker</div>
								{/* Crumbs near feeder */}
								<div className="absolute left-[10%] bottom-8 crumbs">
									<span className="block absolute w-1.5 h-1.5 bg-amber-300 rounded-full -left-2 top-3" />
									<span className="block absolute w-1 h-1 bg-amber-400 rounded-full left-0 top-1" />
									<span className="block absolute w-1 h-1 bg-amber-300 rounded-full left-3 top-2" />
								</div>
								{/* Chick eating (left) */}
								<div className="absolute bottom-8 left-[5%] chick-left">
									<Image src="/images/chick-hero.png" alt="Chick eating" width={56} height={56} className="drop-shadow-xl md:w-[64px] md:h-[64px]" />
								</div>
								{/* Chick drinking (right) */}
								<div className="absolute bottom-8 right-[6%] chick-right">
									<Image src="/images/chick-hero.png" alt="Chick drinking" width={56} height={56} className="drop-shadow-xl scale-x-[-1] md:w-[64px] md:h-[64px]" />
								</div>
							</div>
							<style jsx>{`
								@keyframes peck-cycle {
									0%, 12% { transform: translateY(0) rotate(0deg) scale(1); }
									16% { transform: translateY(3px) rotate(-6deg) scale(1.02); }
									20% { transform: translateY(0) rotate(0deg) scale(1); }
									26% { transform: translateY(3px) rotate(-6deg) scale(1.02); }
									30% { transform: translateY(0) rotate(0deg) scale(1); }
									36% { transform: translateY(3px) rotate(-6deg) scale(1.02); }
									42%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
								}
								@keyframes sip-cycle {
									0%, 20% { transform: translateY(0) rotate(0deg) scale(1); }
									28% { transform: translateY(2px) rotate(6deg) scale(1.01); }
									40% { transform: translateY(-1px) rotate(-4deg) scale(0.995); }
									55% { transform: translateY(1px) rotate(4deg) scale(1.005); }
									70%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
								}
								@keyframes droplet-fall {
									0% { transform: translateY(0); opacity: 0.9; }
									70% { transform: translateY(14px); opacity: 0.6; }
									100% { transform: translateY(18px); opacity: 0; }
								}
								@keyframes ripple-pop {
									0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.35; }
									70% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
									100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
								}
								@keyframes crumb-pop {
									0% { transform: scale(0.6); opacity: 0; }
									30% { transform: scale(1); opacity: 0.85; }
									100% { transform: scale(0.6); opacity: 0; }
								}
								.chick-left { transform-origin: 50% 80%; animation: peck-cycle 2.2s ease-in-out infinite; }
								.chick-right { transform-origin: 50% 80%; animation: sip-cycle 2.4s ease-in-out infinite; }
								.drinker .droplet { animation: droplet-fall 1.2s ease-in infinite; }
								.drinker .droplet2 { animation: droplet-fall 1.2s ease-in 0.6s infinite; }
								.drinker .ripple { width: 12px; height: 12px; border: 2px solid rgba(125, 211, 252, 0.5); border-radius: 9999px; top: 8px; left: 50%; transform: translate(-50%, -50%); animation: ripple-pop 1.8s ease-out infinite; }
								.crumbs span { animation: crumb-pop 2.2s ease-in-out infinite; }
								.crumbs span:nth-child(2) { animation-delay: .2s; }
								.crumbs span:nth-child(3) { animation-delay: .4s; }
							`}</style>
						</CardContent>
					</Card>

					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Batch Summary</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="p-4 bg-blue-50 rounded-lg">
								<Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Total Chicks</p>
								<p className="font-bold text-blue-800">{stats?.totalChicks?.toLocaleString?.() || (batch.birdCount || 0).toLocaleString()}</p>
							</div>
							<div className="p-4 bg-green-50 rounded-lg">
								<Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Days Since Start</p>
								<p className="font-bold text-green-800">{stats?.daysSinceStart ?? 0}</p>
							</div>
							<div className="p-4 bg-red-50 rounded-lg">
								<AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Total Mortality</p>
								<p className="font-bold text-red-800">{stats?.totalMortality?.toLocaleString?.() || (batch.mortality || 0).toLocaleString()}</p>
							</div>
							<div className="p-4 bg-purple-50 rounded-lg">
								<Building className="h-5 w-5 text-purple-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Feed Bags Used</p>
								<p className="font-bold text-purple-800">{stats?.totalFeedBagsUsed ?? (batch.feedUsed || 0)}</p>
							</div>
						</CardContent>
					</Card>

					{/* Extra KPIs */}
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Health & Environment</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="p-4 bg-emerald-50 rounded-lg">
								<Activity className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Health</p>
								<p className="font-bold text-emerald-800">{batch.healthStatus}</p>
							</div>
							<div className="p-4 bg-indigo-50 rounded-lg">
								<Thermometer className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Temperature</p>
								<p className="font-bold text-indigo-800">{batch.temperature || 0}°C</p>
							</div>
							<div className="p-4 bg-cyan-50 rounded-lg">
								<Droplets className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Humidity</p>
								<p className="font-bold text-cyan-800">{batch.humidity || 0}%</p>
							</div>
							<div className="p-4 bg-amber-50 rounded-lg">
								<Activity className="h-5 w-5 text-amber-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">FCR</p>
								<p className="font-bold text-amber-800">{(batch.feedConversionRatio || 0).toFixed(2)}</p>
							</div>
						</CardContent>
					</Card>

					{/* Timeline & Harvest */}
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Batch Timeline</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div className="p-3 rounded-lg bg-gray-50">
									<p className="text-gray-600 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Start Date</p>
									<p className="font-semibold">{batch.startDate}</p>
								</div>
								<div className="p-3 rounded-lg bg-gray-50">
									<p className="text-gray-600 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Expected Harvest</p>
									<p className="font-semibold">{batch.expectedHarvestDate || "-"}</p>
								</div>
								<div className="p-3 rounded-lg bg-gray-50">
									<p className="text-gray-600">Days to Harvest</p>
									<p className="font-semibold">{(() => {
										try {
											if (!batch.expectedHarvestDate) return "-"
											const total = Math.max(1, Math.floor((new Date(batch.expectedHarvestDate).getTime() - new Date(batch.startDate).getTime()) / (1000*60*60*24)))
											const done = stats?.daysSinceStart ?? 0
											return Math.max(0, total - done)
										} catch { return "-" }
									})()}</p>
								</div>
							</div>
							{(() => {
								try {
									if (!batch.expectedHarvestDate) return null
									const total = Math.max(1, Math.floor((new Date(batch.expectedHarvestDate).getTime() - new Date(batch.startDate).getTime()) / (1000*60*60*24)))
									const done = Math.min(total, stats?.daysSinceStart ?? 0)
									const pct = Math.round((done / total) * 100)
									return (
										<div>
											<div className="flex justify-between text-xs text-gray-600 mb-1"><span>Progress to Harvest</span><span>{pct}%</span></div>
											<Progress value={pct} />
										</div>
									)
								} catch { return null }
							})()}
						</CardContent>
					</Card>
				</TabsContent>

				{/* FARM PROFILE: view-only */}
				<TabsContent value="farm-profile" className="space-y-6">
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center ring-2 ring-gray-200 shadow">
										{farmProfile?.logo_url ? (
											<Image src={farmProfile.logo_url} alt="Farm Logo" width={112} height={112} className="object-cover" />
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
										<Button size="sm" onClick={() => setIsFarmProfileModalOpen(true)}>View Details</Button>
									) : (
										<Button size="sm" variant="outline" disabled>No Farm Data</Button>
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
											<p className="font-medium text-gray-800 text-base md:text-lg">{farmProfile.description || "No description available"}</p>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<p className="text-gray-600">Owner</p>
												<p className="font-medium text-gray-800">{farmProfile.owner_name || "Not specified"}</p>
											</div>
											<div>
												<p className="text-gray-600">Established</p>
												<p className="font-medium text-gray-800">{farmProfile.established_date || "Not specified"}</p>
											</div>
										</div>
										<div>
											<p className="text-gray-600">Address</p>
											<p className="font-medium text-gray-800">{farmProfile.address || "Not specified"}</p>
										</div>
									</div>
									<div className="space-y-3 text-sm">
										<div>
											<p className="text-gray-600">Status</p>
											<div className="font-medium inline-flex">
												<Badge className={farmProfile.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
													{farmProfile.status || "Unknown"}
												</Badge>
											</div>
										</div>
										{farmProfile.rating && (
											<div>
												<p className="text-gray-600">Rating</p>
												<div className="flex items-center gap-1">
													{[1,2,3,4,5].map((n) => (
														<svg key={n} className={`w-4 h-4 ${n <= (farmProfile.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`} fill={n <= (farmProfile.rating || 0) ? 'currentColor' : 'none'} viewBox="0 0 24 24">
															<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
														</svg>
													))}
												</div>
											</div>
										)}
										<div>
											<p className="text-gray-600">Email</p>
											<p className="font-medium text-gray-800">{farmProfile.email || "Not specified"}</p>
										</div>
										<div>
											<p className="text-gray-600">Phone</p>
											<p className="font-medium text-gray-800">{farmProfile.phone || "Not specified"}</p>
										</div>
									</div>
								</div>
							</CardContent>
						)}
					</Card>
				</TabsContent>

				{/* MY BATCH: view & edit own batch */}
				<TabsContent value="my-batch" className="space-y-6">
					{/* Batch Overview Card */}
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className={`w-16 h-16 ${batch.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
										{batch.name.charAt(0)}
									</div>
									<div>
										<CardTitle className="text-2xl text-gray-800 mb-1">{batch.name}</CardTitle>
										<p className="text-gray-600">Managed by {batch.farmerName}</p>
										<p className="text-sm text-gray-500">Batch ID: {batch.id}</p>
									</div>
								</div>
								<div className="text-right">
									<Badge className={`${getStatusColor(batch.status)} text-sm px-3 py-1`}>{batch.status}</Badge>
									<p className="text-xs text-gray-500 mt-1">Started {batch.startDate}</p>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{/* Quick Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								<div className="text-center p-3 bg-blue-50 rounded-lg">
									<div className="text-lg font-bold text-blue-600">{batch.birdCount?.toLocaleString() || 0}</div>
									<div className="text-xs text-gray-600">Total Birds</div>
								</div>
								<div className="text-center p-3 bg-red-50 rounded-lg">
									<div className="text-lg font-bold text-red-600">{batch.mortality || 0}</div>
									<div className="text-xs text-gray-600">Mortality</div>
								</div>
								<div className="text-center p-3 bg-green-50 rounded-lg">
									<div className="text-lg font-bold text-green-600">{batch.healthStatus}</div>
									<div className="text-xs text-gray-600">Health Status</div>
								</div>
								<div className="text-center p-3 bg-purple-50 rounded-lg">
									<div className="text-lg font-bold text-purple-600">{batch.feedUsed || 0}</div>
									<div className="text-xs text-gray-600">Feed Bags</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Batch Details Tiles */}
					<div className="space-y-6">
						<h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
							<Activity className="h-6 w-6" />
							Batch Details
						</h3>
						
						{/* Basic Information Tiles */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<Building className="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Batch Name</p>
										<p className="font-semibold text-gray-800">{batch.name}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
										<CalendarDays className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Start Date</p>
										<p className="font-semibold text-gray-800">{batch.startDate}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<Activity className="h-5 w-5 text-purple-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Status</p>
										<Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
									</div>
								</div>
							</Card>
						</div>

						{/* Bird Information Tiles */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<Activity className="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Total Birds</p>
										<p className="text-xl font-bold text-blue-600">{(batch.birdCount || 0).toLocaleString()}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
										<AlertTriangle className="h-5 w-5 text-red-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Mortality</p>
										<p className="text-xl font-bold text-red-600">{batch.mortality || 0}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
										<Thermometer className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Health Status</p>
										<Badge className={getHealthColor(batch.healthStatus)}>{batch.healthStatus}</Badge>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
										<Activity className="h-5 w-5 text-orange-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Current Weight</p>
										<p className="text-xl font-bold text-orange-600">{(batch.currentWeight || 0).toFixed(2)} kg</p>
									</div>
								</div>
							</Card>
						</div>

						{/* Feed & Environment Tiles */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
										<Building className="h-5 w-5 text-yellow-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Feed Bags Used</p>
										<p className="text-xl font-bold text-yellow-600">{batch.feedUsed || 0}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
										<Activity className="h-5 w-5 text-indigo-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Feed Conversion Ratio</p>
										<p className="text-xl font-bold text-indigo-600">{(batch.feedConversionRatio || 0).toFixed(2)}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
										<Thermometer className="h-5 w-5 text-cyan-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Temperature</p>
										<p className="text-xl font-bold text-cyan-600">{batch.temperature || 0}°C</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
										<Droplets className="h-5 w-5 text-teal-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Humidity</p>
										<p className="text-xl font-bold text-teal-600">{batch.humidity || 0}%</p>
									</div>
								</div>
							</Card>
						</div>

						{/* Care & Timeline Tiles */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
										<Activity className="h-5 w-5 text-pink-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Vaccinations</p>
										<p className="text-xl font-bold text-pink-600">{batch.vaccinations || 0}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
										<CalendarDays className="h-5 w-5 text-emerald-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Last Health Check</p>
										<p className="font-semibold text-gray-800">{batch.lastHealthCheck || "Not recorded"}</p>
									</div>
								</div>
							</Card>

							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
										<CalendarDays className="h-5 w-5 text-violet-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Expected Harvest</p>
										<p className="font-semibold text-gray-800">{batch.expectedHarvestDate || "Not set"}</p>
									</div>
								</div>
							</Card>
						</div>

						{/* Notes Tile */}
						{batch.notes && (
							<Card className="p-4 hover:shadow-lg transition-shadow">
								<div className="flex items-start gap-3">
									<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
										<FileText className="h-5 w-5 text-gray-600" />
									</div>
									<div className="flex-1">
										<p className="text-sm text-gray-600 mb-2">Batch Notes</p>
										<p className="text-gray-800 leading-relaxed">{batch.notes}</p>
									</div>
								</div>
							</Card>
						)}
					</div>
				</TabsContent>

				{/* REPORTS: Dynamic Report Form */}
				<TabsContent value="reports" className="space-y-6">
					<DynamicReportForm 
						batchId={batch?.id || ""}
						farmerName={batch?.farmerName || "Farmer"}
						onReportSubmitted={(report) => {
							setReports(prev => [report, ...prev])
							toast.success("Report submitted successfully!")
						}}
					/>

					{/* Reports List */}
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Submitted Reports</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{reports.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No reports submitted yet</p>
									<p className="text-sm">Create your first report using the form above</p>
								</div>
							) : (
								reports.map((r) => (
									<div key={r.id} className="border rounded p-4 space-y-3 hover:bg-gray-50 transition-colors">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className="text-lg">{getReportTypeIcon(r.reportType || 'daily')}</span>
												<h3 className="font-semibold">{r.title}</h3>
											</div>
											<div className="flex items-center gap-2">
												<Badge variant="outline" className={
													r.priority === 'Critical' ? 'border-red-500 text-red-600' :
													r.priority === 'High' ? 'border-orange-500 text-orange-600' :
													r.priority === 'Normal' ? 'border-blue-500 text-blue-600' :
													'border-gray-500 text-gray-600'
												}>
													{r.priority}
												</Badge>
												<Badge variant="secondary">{r.status}</Badge>
											</div>
										</div>
										<div className="text-sm text-gray-500">
											{new Date(r.date).toLocaleString()}
										</div>
										<div className="text-sm text-gray-700">
											{r.content}
										</div>
										{r.fields && Object.keys(r.fields).length > 0 && (
											<div className="bg-gray-50 rounded p-3">
												<h4 className="text-sm font-medium mb-2">Report Details:</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
													{Object.entries(r.fields).map(([key, value]) => (
														<div key={key} className="flex justify-between">
															<span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
															<span className="text-gray-600">{String(value)}</span>
														</div>
													))}
												</div>
											</div>
										)}
										<div className="flex gap-2">
											<Button size="sm" variant="outline" onClick={async () => {
												if (confirm('Are you sure you want to delete this report?')) {
													await fetch(`/api/user/reports?id=${encodeURIComponent(r.id)}&batchId=${encodeURIComponent(batch!.id)}`, { method: "DELETE" })
													setReports((prev) => prev.filter((x) => x.id !== r.id))
													toast.success("Report deleted successfully!")
												}
											}}>
												Delete
											</Button>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>
