"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Lock, User } from "lucide-react"

export default function BatchLoginPage() {
	const [username, setUsername] = useState("batch_alpha")
	const [password, setPassword] = useState("alpha123")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setLoading(true)
		try {
			const res = await fetch("/api/auth/batch-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || "Login failed")
			localStorage.setItem("user", JSON.stringify(data.user))
			router.push("/batch-dashboard")
		} catch (err: any) {
			setError(err.message || "Login failed")
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
						<div>
							<Label htmlFor="username">Username</Label>
							<Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" />
						</div>
						<div>
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
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