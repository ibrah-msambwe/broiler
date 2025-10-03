"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState("en")
  const router = useRouter()

  const translations = {
    en: {
      title: "Admin Login",
      subtitle: "Access your admin dashboard",
      username: "Username or Email",
      password: "Password",
      login: "Login as Admin",
      backToHome: "Back to Home",

      usernamePlaceholder: "Enter username or email",
      passwordPlaceholder: "Enter your password",
      invalidCredentials: "Invalid credentials or not an admin",
      loggingIn: "Logging in...",
    },
    sw: {
      title: "Kuingia kwa Msimamizi",
      subtitle: "Fikia dashibodi yako ya usimamizi",
      username: "Jina la Mtumiaji au Barua Pepe",
      password: "Nywila",
      login: "Ingia kama Msimamizi",
      backToHome: "Rudi Nyumbani",

      usernamePlaceholder: "Ingiza jina la mtumiaji au barua pepe",
      passwordPlaceholder: "Ingiza nywila yako",
      invalidCredentials: "Taarifa sio sahihi au si msimamizi",
      loggingIn: "Inaingia...",
    },
  }

  const t = translations[language as keyof typeof translations]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const email = username.includes("@") ? username : `${username}@local.test`
      const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr || !auth?.user) {
        setError(t.invalidCredentials)
        setIsLoading(false)
        return
      }
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("id, username, email, role")
        .eq("id", auth.user.id)
        .maybeSingle()
      if (pErr || !profile || profile.role !== "admin") {
        setError(t.invalidCredentials)
        setIsLoading(false)
        return
      }
      const adminUser = {
        id: profile.id,
        username: profile.username,
        name: "Administrator",
        role: profile.role,
      }
      localStorage.setItem("user", JSON.stringify(adminUser))
      router.push("/admin-dashboard")
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
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
                  <Label htmlFor="username" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t.username}</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
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
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
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
