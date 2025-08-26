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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-xl transform translate-x-2 translate-y-2"></div>
                <Image
                  src="/images/chick-hero.png"
                  alt="TARIQ BROiler Manager"
                  width={40}
                  height={40}
                  className="relative z-10 drop-shadow-2xl filter brightness-110 contrast-110"
                  style={{
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(255,165,0,0.4))",
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
                    <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">
                      TARIQ
                    </span>{" "}
                    BROILER MANAGEMENT
                  </span>
                </h1>
                <p className="text-sm text-gray-500">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white/80"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
              <Button variant="outline" onClick={() => router.push("/")} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToHome}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t.title}</CardTitle>
              <CardDescription className="text-center">{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>


              <form onSubmit={handleSubmit} className="space-y-6">
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
