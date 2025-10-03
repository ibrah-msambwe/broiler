"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
// removed Supabase auth import; using server-side batch login instead

export default function FarmerLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("en")
  const router = useRouter()

  const translations = {
    en: {
      title: "Batch Login",
      subtitle: "Access your batch dashboard",
      email: "Batch Username",
      password: "Password",
      login: "Login to Batch",
      backToHome: "Back to Home",

      emailPlaceholder: "Enter your batch username",
      passwordPlaceholder: "Enter your password",
      invalidCredentials: "Invalid username or password",
      loggingIn: "Logging in...",
    },
    sw: {
      title: "Kuingia kwa Kundi",
      subtitle: "Fikia dashibodi ya kundi lako",
      email: "Jina la Mtumiaji la Kundi",
      password: "Nywila",
      login: "Ingia kwenye Kundi",
      backToHome: "Rudi Nyumbani",

      emailPlaceholder: "Ingiza jina la mtumiaji la kundi",
      passwordPlaceholder: "Ingiza nywila yako",
      invalidCredentials: "Jina la mtumiaji au nywila si sahihi",
      loggingIn: "Inaingia...",
    },
  }

  const t = translations[language as keyof typeof translations]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Use server endpoint to authenticate against batches table
      const res = await fetch("/api/auth/batch-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || t.invalidCredentials)
        return
      }
      // Optional gate on status if needed
      if (data.batch?.status && data.batch.status !== "Active" && data.batch.status !== "Planning") {
        setError("Batch not approved yet. Please contact admin.")
        return
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      if (data.batchId) localStorage.setItem("batchId", data.batchId)
      if (data.batch?.username) localStorage.setItem("batchUsername", data.batch.username)
      router.push("/batch-dashboard")
    } catch (error) {
      setError(t.invalidCredentials)
    } finally {
      setIsLoading(false)
    }
  }

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

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] px-3 sm:px-4 py-4 sm:py-6">
        <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">{t.title}</h2>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-lg text-center">{t.title}</CardTitle>
              <CardDescription className="text-center text-sm">{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{t.email}</span>
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>{t.password}</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                      className="h-12 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? t.loggingIn : t.login}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
