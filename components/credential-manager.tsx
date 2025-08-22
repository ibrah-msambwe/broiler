"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Key,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Download,
  Lock,
  Shield,
  CheckCircle,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { generateStrongPassword, decryptPassword, isBcryptHash, isAesEncrypted } from "@/lib/encryption"

interface Credential {
  id: string
  device_id: string
  device_name?: string
  username: string
  password: string
  service?: string
  notes?: string
  created_at: string
}

interface Device {
  id: string
  name: string
  type: string
}

interface CredentialManagerProps {
  onStatsUpdate: () => void
}

export default function CredentialManager({ onStatsUpdate }: CredentialManagerProps) {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [decryptedPasswords, setDecryptedPasswords] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    device_id: "",
    username: "",
    password: "",
    service: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [migrationNeeded, setMigrationNeeded] = useState(false)

  useEffect(() => {
    loadCredentials()
    loadDevices()
  }, [])

  const loadCredentials = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/credentials")
      if (response.ok) {
        const data = await response.json()
        setCredentials(data)

        // Check if any credentials need migration from bcrypt to AES
        const needsMigration = data.some((cred) => isBcryptHash(cred.password))
        setMigrationNeeded(needsMigration)

        onStatsUpdate()
        console.log(`✅ Loaded ${data.length} credentials from Supabase`)
      }
    } catch (error) {
      console.error("Failed to load credentials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDevices = async () => {
    try {
      const response = await fetch("/api/devices")
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
        console.log(`✅ Loaded ${data.length} devices from Supabase`)
      }
    } catch (error) {
      console.error("Failed to load devices:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingCredential ? `/api/credentials/${editingCredential.id}` : "/api/credentials"
      const method = editingCredential ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Credential ${method === "POST" ? "created" : "updated"}:`, result)
        loadCredentials()
        resetForm()
        setIsAddDialogOpen(false)
        setEditingCredential(null)
      } else {
        const error = await response.json()
        console.error("Failed to save credential:", error)
        alert(`Failed to save credential: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to save credential:", error)
      alert("Failed to save credential. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (credentialId: string) => {
    if (!confirm("Are you sure you want to delete this credential?")) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/credentials/${credentialId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log(`✅ Credential deleted: ${credentialId}`)
        loadCredentials()
      } else {
        const error = await response.json()
        alert(`Failed to delete credential: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to delete credential:", error)
      alert("Failed to delete credential. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      device_id: "",
      username: "",
      password: "",
      service: "",
      notes: "",
    })
  }

  const startEdit = async (credential: Credential) => {
    setEditingCredential(credential)

    try {
      // For bcrypt hashes, we can't decrypt them, so we'll start with an empty password
      if (isBcryptHash(credential.password)) {
        setFormData({
          device_id: credential.device_id,
          username: credential.username,
          password: "", // Empty for bcrypt hashes
          service: credential.service || "",
          notes: credential.notes || "",
        })
      } else {
        // For AES encrypted passwords, try to decrypt
        try {
          const decryptedPassword = decryptPassword(credential.password)
          setFormData({
            device_id: credential.device_id,
            username: credential.username,
            password: decryptedPassword,
            service: credential.service || "",
            notes: credential.notes || "",
          })
        } catch (error) {
          console.error("Failed to decrypt password for editing:", error)
          setFormData({
            device_id: credential.device_id,
            username: credential.username,
            password: "", // Empty if can't decrypt
            service: credential.service || "",
            notes: credential.notes || "",
          })
        }
      }
    } catch (error) {
      console.error("Error preparing credential for editing:", error)
      setFormData({
        device_id: credential.device_id,
        username: credential.username,
        password: "", // Empty if error
        service: credential.service || "",
        notes: credential.notes || "",
      })
    }

    setIsAddDialogOpen(true)
  }

  const togglePasswordVisibility = async (credentialId: string) => {
    if (showPasswords[credentialId]) {
      // Hide password
      setShowPasswords((prev) => ({
        ...prev,
        [credentialId]: false,
      }))
    } else {
      // Show password - try to decrypt it
      try {
        const credential = credentials.find((c) => c.id === credentialId)
        if (credential) {
          let displayPassword = credential.password

          // Handle different password formats
          if (isBcryptHash(credential.password)) {
            displayPassword = "[BCRYPT HASH - CANNOT DECRYPT]"
          } else {
            try {
              displayPassword = decryptPassword(credential.password)
            } catch (error) {
              console.error("Failed to decrypt password:", error)
              // If decryption fails, show the original (might be plain text)
              displayPassword = credential.password
            }
          }

          setDecryptedPasswords((prev) => ({
            ...prev,
            [credentialId]: displayPassword,
          }))

          setShowPasswords((prev) => ({
            ...prev,
            [credentialId]: true,
          }))
        }
      } catch (error) {
        console.error("Error toggling password visibility:", error)
        // Show error message but still allow viewing
        setDecryptedPasswords((prev) => ({
          ...prev,
          [credentialId]: "[ERROR VIEWING PASSWORD]",
        }))
        setShowPasswords((prev) => ({
          ...prev,
          [credentialId]: true,
        }))
      }
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show a brief success indicator
      console.log("✅ Copied to clipboard")
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(16)
    setFormData((prev) => ({ ...prev, password: newPassword }))
  }

  const exportSingleCredentialPDF = async (credential: Credential) => {
    try {
      const response = await fetch("/api/export/single-credential-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `credential-${credential.service || "export"}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export credential PDF:", error)
    }
  }

  const getPasswordDisplay = (credential: Credential): string => {
    if (showPasswords[credential.id] && decryptedPasswords[credential.id]) {
      return decryptedPasswords[credential.id]
    }
    return "••••••••••••"
  }

  const getPasswordForCopy = (credential: Credential): string => {
    if (decryptedPasswords[credential.id]) {
      return decryptedPasswords[credential.id]
    }

    // For bcrypt hashes, we can't decrypt
    if (isBcryptHash(credential.password)) {
      return "[BCRYPT HASH - CANNOT COPY]"
    }

    // Try to decrypt on demand for copying
    try {
      return decryptPassword(credential.password)
    } catch (error) {
      console.error("Failed to decrypt password for copying:", error)
      // Return original if decryption fails (might be plain text)
      return credential.password
    }
  }

  const getEncryptionBadge = (credential: Credential) => {
    if (isBcryptHash(credential.password)) {
      return (
        <Badge className="bg-orange-500 text-white text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Bcrypt (Legacy)
        </Badge>
      )
    }

    if (isAesEncrypted(credential.password)) {
      return (
        <Badge className="bg-green-500 text-white text-xs">
          <Shield className="h-3 w-3 mr-1" />
          AES Encrypted
        </Badge>
      )
    }

    return (
      <Badge className="bg-gray-500 text-white text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Unknown Format
      </Badge>
    )
  }

  const migrateCredentials = async () => {
    if (
      !confirm(
        "This will convert all bcrypt passwords to AES encryption. You'll need to set new passwords for these credentials. Continue?",
      )
    ) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/credentials/migrate-to-aes", {
        method: "POST",
      })

      if (response.ok) {
        alert("Migration started. Please update passwords for any credentials that were using bcrypt.")
        loadCredentials()
      } else {
        alert("Failed to start migration. Please try again.")
      }
    } catch (error) {
      console.error("Migration error:", error)
      alert("Migration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔐 Secure Credential Vault
          </h2>
          <p className="text-gray-600 text-lg">
            Store and manage passwords with AES-256 encryption - viewable when needed
          </p>
          <div className="flex items-center space-x-4 mt-3">
            <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              AES-256 Encrypted
            </Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Supabase Cloud
            </Badge>
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1">
              <Eye className="h-3 w-3 mr-1" />
              Viewable Passwords
            </Badge>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingCredential(null)
              }}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-3 text-lg"
              disabled={isLoading}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-2 border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Key className="h-6 w-6 mr-2 text-blue-600" />
                {editingCredential ? "Edit Credential" : "Add New Credential"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                {editingCredential ? "Update credential information" : "Add a new credential to your secure vault"}
              </DialogDescription>
            </DialogHeader>

            {/* Enhanced Security Notice */}
            <Alert className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50">
              <Shield className="h-5 w-5 text-emerald-600" />
              <AlertDescription className="text-emerald-800 font-medium">
                <strong>🔒 Enhanced Security:</strong> Passwords are encrypted with AES-256 and stored securely in
                Supabase. You can view them anytime with the eye icon - perfect for a password manager!
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="device_id" className="text-gray-700 font-semibold">
                    Device/System
                  </Label>
                  <Select
                    value={formData.device_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, device_id: value }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Select a device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service" className="text-gray-700 font-semibold">
                    Service/Application
                  </Label>
                  <Input
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                    placeholder="SSH, Database, Web Panel, etc."
                    className="h-12 border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-semibold">
                  Username/Email
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="admin, user@example.com"
                  className="h-12 border-2 border-gray-300 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold">
                  Password
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="h-12 border-2 border-gray-300 focus:border-blue-500"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="h-12 px-4 border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-emerald-600 font-medium">
                  🔒 Will be encrypted with AES-256 and viewable when needed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 font-semibold">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this credential"
                  className="min-h-[100px] border-2 border-gray-300 focus:border-blue-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingCredential ? "Updating..." : "Adding..."}
                  </div>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    {editingCredential ? "Update Credential" : "Add Credential"}
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Migration Notice */}
      {migrationNeeded && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div className="flex-1">
            <AlertDescription className="text-orange-800 font-medium">
              <strong>Legacy Passwords Detected:</strong> Some passwords are using bcrypt hashing and cannot be viewed.
              You'll need to update these credentials to use AES encryption.
            </AlertDescription>
          </div>
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-100"
            onClick={migrateCredentials}
            disabled={isLoading}
          >
            <Shield className="h-4 w-4 mr-1" />
            Migrate to AES
          </Button>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading credentials from Supabase...</p>
        </div>
      )}

      {/* Enhanced Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {credentials.map((credential) => (
          <Card
            key={credential.id}
            className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-200/50 hover:border-blue-300 transform hover:scale-105"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl shadow-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {credential.service || "Credential"}
                  </CardTitle>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge variant="outline" className="border-blue-300 text-blue-700 font-medium">
                    {credential.device_name}
                  </Badge>
                  {getEncryptionBadge(credential)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Username:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                      {credential.username}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(credential.username)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Password:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border min-w-[120px]">
                      {getPasswordDisplay(credential)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePasswordVisibility(credential.id)}
                      className="h-8 w-8 p-0 hover:bg-green-100"
                    >
                      {showPasswords[credential.id] ? (
                        <EyeOff className="h-4 w-4 text-green-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(getPasswordForCopy(credential))}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      disabled={isBcryptHash(credential.password)}
                    >
                      <Copy className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </div>
              </div>

              {isBcryptHash(credential.password) && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 text-xs">
                    This password uses bcrypt hashing and cannot be viewed. Please edit this credential to set a new
                    password with AES encryption.
                  </AlertDescription>
                </Alert>
              )}

              {credential.notes && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">{credential.notes}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 flex items-center space-x-2 pt-2 border-t border-gray-200">
                <Lock className="h-3 w-3" />
                <span>Added: {new Date(credential.created_at).toLocaleDateString()}</span>
                <Badge className="bg-emerald-500 text-white text-xs ml-auto">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Stored in Supabase
                </Badge>
              </div>

              <div className="flex space-x-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(credential)}
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 font-medium"
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportSingleCredentialPDF(credential)}
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(credential.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {credentials.length === 0 && !isLoading && (
        <Card className="bg-gradient-to-br from-white to-blue-50 shadow-2xl border-2 border-blue-200">
          <CardContent className="text-center py-16">
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-xl">
              <Key className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No credentials stored yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Start by adding your first credential with AES-256 encryption</p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-emerald-600">
                <Shield className="h-5 w-5" />
                <span className="font-medium">AES-256 Encryption - Viewable when needed</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Stored permanently in Supabase Cloud</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <Eye className="h-5 w-5" />
                <span className="font-medium">Access from any device worldwide</span>
              </div>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Credential
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
