"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Lock, Mail, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    contactName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    farmingExperience: "",
    farmSize: "",
    broilerExperience: "",
    address: "",
    preferredBatchSize: "",
    expectedStartDate: "",
    additionalInfo: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.contactName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError("All required fields must be filled")
      setLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const computedBatchName = formData.preferredBatchSize ? `Preferred Batch ${formData.preferredBatchSize}` : `Request by ${formData.contactName}`
      const response = await fetch("/api/register-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: formData.contactName,
          email: formData.email,
          batchName: computedBatchName,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Registration submitted. Await admin approval.")
        window.location.href = "/"
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Register Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Create your farmer account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-gray-700 font-medium">
                Full Name *
              </Label>
              <div className="relative">
                <Input
                  id="contactName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.contactName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="+254 700 000 000"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Farming Experience (Years)</Label>
                <Input
                  type="number"
                  placeholder="Select experience level"
                  value={formData.farmingExperience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, farmingExperience: e.target.value }))}
                  className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Farm Size (Acres)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 5 acres"
                  value={formData.farmSize}
                  onChange={(e) => setFormData((prev) => ({ ...prev, farmSize: e.target.value }))}
                  className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Broiler Experience</Label>
                <Input
                  type="text"
                  placeholder="Select broiler experience"
                  value={formData.broilerExperience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, broilerExperience: e.target.value }))}
                  className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Preferred Batch Size</Label>
                <Input
                  type="number"
                  placeholder="Select preferred batch size"
                  value={formData.preferredBatchSize}
                  onChange={(e) => setFormData((prev) => ({ ...prev, preferredBatchSize: e.target.value }))}
                  className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Farm Address *</Label>
              <Input
                type="text"
                placeholder="Enter your farm address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Expected Start Date</Label>
              <Input
                type="date"
                placeholder="mm/dd/yyyy"
                value={formData.expectedStartDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expectedStartDate: e.target.value }))}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Additional Information</Label>
              <Input
                type="text"
                placeholder="Any additional information about your farming goals or requirements"
                value={formData.additionalInfo}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Username *
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pr-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded ${i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"}`}></div>
                ))}
                <span className="text-xs text-gray-500">{passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ""}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pr-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-gray-100"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
