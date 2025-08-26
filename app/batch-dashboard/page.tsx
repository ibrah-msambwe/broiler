"use client"

import { useEffect, useState } from "react"
import AdminShell from "@/components/admin/admin-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Activity, AlertTriangle, Building, Clock, Download, Eye, FileText, LayoutDashboard, MessageSquare, Thermometer, Droplets, CalendarDays } from "lucide-react"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface Batch {
	id: string
	name: string
	farmerName: string
	startDate: string
	birdCount: number
	status: "Active" | "Completed" | "Planning"
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
	priority: "Normal" | "High" | "Urgent"
	fields?: Record<string, any>
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
	
	// Modal state
	const [isReportModalOpen, setIsReportModalOpen] = useState(false)
	const [selectedReportType, setSelectedReportType] = useState<Report["type"]>("Daily")
	const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined)
	const [modalMode, setModalMode] = useState<"create" | "view">("create")

	const setField = (key: string, value: any) => setReportFields((prev) => ({ ...prev, [key]: value }))

	useEffect(() => {
		const raw = localStorage.getItem("user")
		if (!raw) return
		const u = JSON.parse(raw) as User
		setUser(u)
	}, [])

	useEffect(() => {
		if (!user || user.role !== "batch") return
		const load = async () => {
			const batchRes = await fetch(`/api/user/batch?batchId=${encodeURIComponent(user.batchId || "")}`)
			const batchJson = await batchRes.json()
			setBatch(batchJson.batch || null)
			if (batchJson.batch) setDraftBatch(batchJson.batch)
			const repRes = await fetch(`/api/user/reports?batchId=${encodeURIComponent(user.batchId || "")}`)
			const repJson = await repRes.json()
			setReports(repJson.reports || [])
			const farmRes = await fetch(`/api/user/profile`)
			const farmJson = await farmRes.json()
			setFarmProfile(farmJson.farmProfile || null)
			const statsRes = await fetch(`/api/user/stats?batchId=${encodeURIComponent(user.batchId || "")}`)
			const statsJson = await statsRes.json()
			setStats(statsJson.stats || null)
			const msgRes = await fetch(`/api/user/messages?batchId=${encodeURIComponent(user.batchId || "")}`)
			const msgJson = await msgRes.json()
			setMessages(msgJson.messages || [])
		}
		load()
	}, [user])

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
				setBatch(data.batch)
				setDraftBatch(data.batch)
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
		if (!batch) return
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
		if (!batch) return
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

	if (!user || !batch || !farmProfile) {
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
			case "Active":
				return "bg-green-100 text-green-800"
			case "Planning":
				return "bg-yellow-100 text-yellow-800"
			case "Completed":
				return "bg-blue-100 text-blue-800"
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
	]

	return (
		<AdminShell active={activeTab} onSelect={setActiveTab} menuItems={menuItems}>
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, Batch Operator</h2>
				<p className="text-gray-600 text-lg">Submit reports and monitor your batch. Admin can see all data.</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="hidden" />

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
								<p className="font-bold text-blue-800">{stats?.totalChicks?.toLocaleString?.() || batch.birdCount.toLocaleString()}</p>
							</div>
							<div className="p-4 bg-green-50 rounded-lg">
								<Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Days Since Start</p>
								<p className="font-bold text-green-800">{stats?.daysSinceStart ?? 0}</p>
							</div>
							<div className="p-4 bg-red-50 rounded-lg">
								<AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Total Mortality</p>
								<p className="font-bold text-red-800">{stats?.totalMortality?.toLocaleString?.() || batch.mortality.toLocaleString()}</p>
							</div>
							<div className="p-4 bg-purple-50 rounded-lg">
								<Building className="h-5 w-5 text-purple-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Feed Bags Used</p>
								<p className="font-bold text-purple-800">{stats?.totalFeedBagsUsed ?? batch.feedUsed}</p>
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
								<p className="font-bold text-indigo-800">{batch.temperature}°C</p>
							</div>
							<div className="p-4 bg-cyan-50 rounded-lg">
								<Droplets className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">Humidity</p>
								<p className="font-bold text-cyan-800">{batch.humidity}%</p>
							</div>
							<div className="p-4 bg-amber-50 rounded-lg">
								<Activity className="h-5 w-5 text-amber-600 mx-auto mb-1" />
								<p className="text-xs text-gray-600">FCR</p>
								<p className="font-bold text-amber-800">{batch.feedConversionRatio.toFixed(2)}</p>
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
									<div className="relative w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
										{farmProfile.logoUrl ? (
											<Image src={farmProfile.logoUrl} alt="Farm Logo" width={56} height={56} />
										) : (
											<span className="text-lg font-bold">F</span>
										)}
									</div>
									<div>
										<CardTitle className="text-xl font-extrabold relative select-none tracking-wide">
											<span className="absolute inset-0 blur-md opacity-40 bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-700">
												{farmProfile.name}
											</span>
											<span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600" style={{textShadow: "2px 2px 4px rgba(0,0,0,0.2)"}}>
												{farmProfile.name}
											</span>
										</CardTitle>
										<p className="text-sm text-gray-500">ID: {farmProfile.id}</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button size="sm" variant="outline">View</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
							<div>
								<p className="text-gray-600">Email</p>
								<p className="font-medium">{farmProfile.email}</p>
							</div>
							<div>
								<p className="text-gray-600">Phone</p>
								<p className="font-medium">{farmProfile.phone}</p>
							</div>
							<div>
								<p className="text-gray-600">Address</p>
								<p className="font-medium">{farmProfile.address}</p>
							</div>
							<div>
								<p className="text-gray-600">About</p>
								<p className="font-medium">{farmProfile.description}</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* MY BATCH: view & edit own batch */}
				<TabsContent value="my-batch" className="space-y-6">
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className={`w-12 h-12 ${batch.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
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
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label htmlFor="name">Batch Name</Label>
									<Input id="name" value={draftBatch.name || ""} onChange={(e) => setDraftBatch((p) => ({ ...p, name: e.target.value }))} />
								</div>
								<div>
									<Label htmlFor="startDate">Start Date</Label>
									<Input id="startDate" type="date" value={draftBatch.startDate || ""} onChange={(e) => setDraftBatch((p) => ({ ...p, startDate: e.target.value }))} />
								</div>
								<div>
									<Label htmlFor="birdCount">Total Chicks</Label>
									<Input id="birdCount" type="number" value={draftBatch.birdCount ?? 0} onChange={(e) => setDraftBatch((p) => ({ ...p, birdCount: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="feedUsed">Feed Bags Used</Label>
									<Input id="feedUsed" type="number" value={draftBatch.feedUsed ?? batch.feedUsed} onChange={(e) => setDraftBatch((p) => ({ ...p, feedUsed: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="mortality">Total Mortality</Label>
									<Input id="mortality" type="number" value={draftBatch.mortality ?? batch.mortality} onChange={(e) => setDraftBatch((p) => ({ ...p, mortality: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="status">Status</Label>
									<Select value={draftBatch.status as any} onValueChange={(v) => setDraftBatch((p) => ({ ...p, status: v as Batch["status"] }))}>
										<SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="Planning">Planning</SelectItem>
											<SelectItem value="Active">Active</SelectItem>
											<SelectItem value="Completed">Completed</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="healthStatus">Health</Label>
									<Select value={draftBatch.healthStatus as any} onValueChange={(v) => setDraftBatch((p) => ({ ...p, healthStatus: v as Batch["healthStatus"] }))}>
										<SelectTrigger><SelectValue placeholder="Select health" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="Excellent">Excellent</SelectItem>
											<SelectItem value="Good">Good</SelectItem>
											<SelectItem value="Fair">Fair</SelectItem>
											<SelectItem value="Poor">Poor</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="temperature">Temperature (°C)</Label>
									<Input id="temperature" type="number" step="0.1" value={draftBatch.temperature ?? batch.temperature} onChange={(e) => setDraftBatch((p) => ({ ...p, temperature: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="humidity">Humidity (%)</Label>
									<Input id="humidity" type="number" step="0.1" value={draftBatch.humidity ?? batch.humidity} onChange={(e) => setDraftBatch((p) => ({ ...p, humidity: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="currentWeight">Current Weight (kg)</Label>
									<Input id="currentWeight" type="number" step="0.01" value={draftBatch.currentWeight ?? batch.currentWeight} onChange={(e) => setDraftBatch((p) => ({ ...p, currentWeight: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="fcr">FCR</Label>
									<Input id="fcr" type="number" step="0.01" value={draftBatch.feedConversionRatio ?? batch.feedConversionRatio} onChange={(e) => setDraftBatch((p) => ({ ...p, feedConversionRatio: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="vaccinations">Vaccinations</Label>
									<Input id="vaccinations" type="number" value={draftBatch.vaccinations ?? batch.vaccinations} onChange={(e) => setDraftBatch((p) => ({ ...p, vaccinations: Number(e.target.value) }))} />
								</div>
								<div>
									<Label htmlFor="lastHealthCheck">Last Health Check</Label>
									<Input id="lastHealthCheck" type="date" value={draftBatch.lastHealthCheck ?? batch.lastHealthCheck} onChange={(e) => setDraftBatch((p) => ({ ...p, lastHealthCheck: e.target.value }))} />
								</div>
								<div className="md:col-span-3">
									<Label htmlFor="notes">Notes</Label>
									<Textarea id="notes" rows={4} value={draftBatch.notes || ""} onChange={(e) => setDraftBatch((p) => ({ ...p, notes: e.target.value }))} />
								</div>
							</div>
							<div className="flex gap-2">
								<Button size="sm" onClick={handleSaveBatch} disabled={isSavingBatch}>{isSavingBatch ? "Saving..." : "Save Changes"}</Button>
								<Button size="sm" variant="outline" onClick={() => setDraftBatch(batch!)}>Reset</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* REPORTS: create and list */}
				<TabsContent value="reports" className="space-y-6">
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Create Report</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-xs uppercase tracking-wide text-gray-500">Utangulizi</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label>Type</Label>
									<Select value={reportType} onValueChange={(v) => setReportType(v as Report["type"]) }>
										<SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="Daily">Daily</SelectItem>
											<SelectItem value="Mortality">Mortality</SelectItem>
											<SelectItem value="Health">Health</SelectItem>
											<SelectItem value="Feed">Feed</SelectItem>
											<SelectItem value="Vaccination">Vaccination</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Priority</Label>
									<Select value={reportPriority} onValueChange={(v) => setReportPriority(v as Report["priority"]) }>
										<SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
										<SelectContent>
											<SelectItem value="Normal">Normal</SelectItem>
											<SelectItem value="High">High</SelectItem>
											<SelectItem value="Urgent">Urgent</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Title</Label>
									<Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Report title" />
								</div>
							</div>
							<div className="bg-gray-50/70 border border-gray-100 rounded-lg p-4">
								<Label>Introduction / Summary</Label>
								<Textarea rows={5} value={reportContent} onChange={(e) => setReportContent(e.target.value)} placeholder="Elezea kwa ufupi ripoti..." />
							</div>

							{/* Dynamic Daily fields in Swahili */}
							{reportType === "Daily" && (
								<div className="space-y-4">
									<div className="text-xs uppercase tracking-wide text-gray-500">Taarifa za Mwanzo</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 border border-gray-100 rounded-lg p-4">
										<div>
											<Label>Jina la banda</Label>
											<Input id="banda" placeholder="Jina la banda" value={reportFields.bandaName || ""} onChange={(e) => setField("bandaName", e.target.value)} />
										</div>
										<div>
											<Label>Batch no.</Label>
											<Input id="batchno" placeholder="Batch no." value={reportFields.batchNo || ""} onChange={(e) => setField("batchNo", e.target.value)} />
										</div>
										<div>
											<Label>Tarehe ya kupokea</Label>
											<Input id="tareheKupokea" type="date" value={reportFields.receiveDate || ""} onChange={(e) => setField("receiveDate", e.target.value)} />
										</div>
										<div>
											<Label>Idadi ya vifaranga vilivyopokewa</Label>
											<Input id="vifarangaVilivyopokewa" type="number" placeholder="mf. 500" value={reportFields.chicksReceived || ""} onChange={(e) => setField("chicksReceived", Number(e.target.value))} />
										</div>
										<div>
											<Label>Uzito wa vifaranga</Label>
											<Input id="uzitoVifaranga" type="number" step="0.01" placeholder="kg" value={reportFields.chicksWeight || ""} onChange={(e) => setField("chicksWeight", Number(e.target.value))} />
										</div>
										<div className="md:col-span-2">
											<Label>Idadi ya mifuko ya chakula (batch nzima)</Label>
											<Input id="mifukoBatch" type="number" placeholder="mf. 200" value={reportFields.totalBagsForBatch || ""} onChange={(e) => setField("totalBagsForBatch", Number(e.target.value))} />
										</div>
									</div>

									<div className="text-xs uppercase tracking-wide text-gray-500">Ripoti ya Kila Siku</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 border border-gray-100 rounded-lg p-4">
										<div>
											<Label>Idadi ya kuku wa kufungua siku</Label>
											<Input id="kufungua" type="number" placeholder="mf. 480" value={reportFields.openCount || ""} onChange={(e) => setField("openCount", Number(e.target.value))} />
										</div>
										<div>
											<Label>Vifo</Label>
											<Input id="vifo" type="number" placeholder="mf. 2" value={reportFields.deaths || ""} onChange={(e) => setField("deaths", Number(e.target.value))} />
										</div>
										<div>
											<Label>Idadi ya kuku wa kufunga siku</Label>
											<Input id="kufunga" type="number" placeholder="mf. 478" value={reportFields.closeCount || ""} onChange={(e) => setField("closeCount", Number(e.target.value))} />
										</div>
										<div>
											<Label>Chakula kilichotumika (mifuko)</Label>
											<Input id="chakulaSiku" type="number" placeholder="mf. 5" value={reportFields.feedUsedBags || ""} onChange={(e) => setField("feedUsedBags", Number(e.target.value))} />
										</div>
										<div>
											<Label>Chakula kilichobaki stoo (mifuko)</Label>
											<Input id="chakulaBaki" type="number" placeholder="mf. 195" value={reportFields.remainingBags || ""} onChange={(e) => setField("remainingBags", Number(e.target.value))} />
										</div>
										<div className="md:col-span-2">
											<Label>Aina ya dawa iliyotumika na kiasi chake</Label>
											<Input id="dawaNaKiasi" placeholder="mf. Amprolium 20g" value={reportFields.medicineAndDosage || ""} onChange={(e) => setField("medicineAndDosage", e.target.value)} />
										</div>
									</div>
								</div>
							)}

							<Button onClick={handleCreateReport} disabled={isSubmittingReport}>{isSubmittingReport ? "Submitting..." : "Submit Report"}</Button>
						</CardContent>
					</Card>

					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Reports</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{reports.map((r) => (
								<div key={r.id} className="border rounded p-3 space-y-2">
									<div className="flex items-center justify-between">
										<div className="font-semibold">{r.title}</div>
										<div className="flex items-center gap-2">
											<Badge>{r.type}</Badge>
											<Badge>{r.status}</Badge>
										</div>
									</div>
									<Textarea rows={3} value={r.content} onChange={async (e) => {
										const nv = e.target.value
										await fetch("/api/user/reports", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, batchId: batch!.id, content: nv }) })
										setReports((prev) => prev.map((x) => (x.id === r.id ? { ...x, content: nv } : x)))
									}} />
									{r.fields && (
										<div className="text-xs bg-gray-50 p-2 rounded">
											{Object.entries(r.fields).map(([k, v]) => (
												<div key={k} className="flex justify-between gap-2"><span className="text-gray-600">{k}</span><span className="font-semibold">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span></div>
											))}
										</div>
									)}
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={async () => {
											const res = await fetch("/api/export/report-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report: r }) })
											const blob = await res.blob()
											const url = URL.createObjectURL(blob)
											const a = document.createElement("a"); a.href = url; a.download = `report-${r.id}.pdf`; a.click(); URL.revokeObjectURL(url)
										}}>Export PDF</Button>
										<Button size="sm" variant="outline" onClick={async () => {
											await fetch(`/api/user/reports?id=${encodeURIComponent(r.id)}&batchId=${encodeURIComponent(batch!.id)}`, { method: "DELETE" })
											setReports((prev) => prev.filter((x) => x.id !== r.id))
										}}>Delete</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</TabsContent>

				{/* MESSAGES: send and list */}
				<TabsContent value="messages" className="space-y-6">
					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Send Message to Admin</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-1">
									<Label>Subject</Label>
									<Input value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} placeholder="Subject" />
								</div>
								<div className="md:col-span-2">
									<Label>Message</Label>
									<Textarea rows={4} value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Write your message..." />
								</div>
							</div>
							<Button onClick={handleSendMessage} disabled={isSendingMessage}>{isSendingMessage ? "Sending..." : "Send Message"}</Button>
						</CardContent>
					</Card>

					<Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Messages</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{messages.map((m) => (
								<div key={m.id} className="border rounded p-3 space-y-2">
									<div className="flex items-center justify-between">
										<Input className="font-semibold" value={m.subject} onChange={async (e) => {
											const val = e.target.value
											await fetch("/api/user/messages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, batchId: batch!.id, subject: val }) })
											setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, subject: val } : x)))
										}} />
										<Badge>{m.status}</Badge>
									</div>
									<div className="text-xs text-gray-500">{new Date(m.date).toLocaleString()}</div>
									<Textarea rows={3} value={m.content} onChange={async (e) => {
										const val = e.target.value
										await fetch("/api/user/messages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, batchId: batch!.id, content: val }) })
										setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, content: val } : x)))
									}} />
									<div className="flex gap-2">
										<Button size="sm" variant="outline" onClick={async () => {
											await fetch(`/api/user/messages?id=${encodeURIComponent(m.id)}&batchId=${encodeURIComponent(batch!.id)}`, { method: "DELETE" })
											setMessages((prev) => prev.filter((x) => x.id !== m.id))
										}}>Delete</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</AdminShell>
	)
} 