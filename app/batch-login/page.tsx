"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Lock, Mail, Eye, EyeOff } from "lucide-react"

export default function BatchLoginPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setLoading(true)
		
		console.log("🚀 Attempting batch login...")
		
		try {
			// Test if the API endpoint is accessible
			console.log("🔍 Testing API endpoint...")
			const testResponse = await fetch('/api/test', { method: 'GET' })
			if (!testResponse.ok) {
				console.error("❌ API test failed:", testResponse.status)
				setError("Server is not responding. Please check if the development server is running.")
				return
			}
			console.log("✅ API endpoint is accessible")
			
			// Attempt the actual login
			console.log("🔐 Sending login request...")
			const r = await fetch('/api/auth/batch-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			})
			
			console.log("📡 Login response received:", r.status)
			
			if (!r.ok) {
				const j = await r.json()
				console.error("❌ Login failed:", j)
				setError(j?.error || 'Invalid credentials')
				return
			}
			
			const j = await r.json()
			console.log("✅ Login successful:", j)
			
			// Store user data
			localStorage.setItem('user', JSON.stringify(j.user))
			if (j.batchId) localStorage.setItem('batchId', j.batchId)
			if (j.batch?.username) localStorage.setItem('batchUsername', j.batch.username)
			
			// Redirect to dashboard
			router.push('/batch-dashboard')
		} catch (error) {
			console.error("❌ Network error:", error)
			setError("Network error. Please check your internet connection and try again.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Batch Operator Login</CardTitle>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert className="mb-4">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="relative">
							<Label htmlFor="username">Batch Username</Label>
							<Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 pl-10" required />
							<Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
						</div>
						<div className="relative">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 pr-10 pl-10" required />
							<Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
							<Button type="button" variant="ghost" size="icon" className="absolute right-2 top-9 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</Button>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Logging in..." : "Login"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
} 