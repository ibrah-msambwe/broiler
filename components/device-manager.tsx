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
import { Plus, Server, Smartphone, Laptop, Monitor, Edit, Trash2, Globe, HardDrive, Cloud } from "lucide-react"

interface Device {
  id: string
  name: string
  type: string
  category: string
  ip_address?: string
  mac_address?: string
  domain?: string
  location?: string
  notes?: string
  created_at: string
  user_email: string
}

interface DeviceManagerProps {
  onStatsUpdate: () => void
}

export default function DeviceManager({ onStatsUpdate }: DeviceManagerProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    ip_address: "",
    mac_address: "",
    domain: "",
    location: "",
    notes: "",
  })

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const response = await fetch("/api/devices")
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
        onStatsUpdate()

        // Auto-save devices data online
        await fetch("/api/data/cloud-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: "ibrahim8msambwe@gmail.com",
            data_type: "devices",
            data: data,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch (error) {
      console.error("Failed to load devices:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingDevice ? `/api/devices/${editingDevice.id}` : "/api/devices"
      const method = editingDevice ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_email: "ibrahim8msambwe@gmail.com",
        }),
      })

      if (response.ok) {
        loadDevices()
        resetForm()
        setIsAddDialogOpen(false)
        setEditingDevice(null)

        // Save to cloud immediately after device change
        await fetch("/api/data/cloud-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: "ibrahim8msambwe@gmail.com",
            data_type: "device_update",
            action: method,
            device_data: formData,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch (error) {
      console.error("Failed to save device:", error)
    }
  }

  const handleDelete = async (deviceId: string) => {
    if (!confirm("Are you sure you want to delete this device?")) return

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadDevices()

        // Save deletion to cloud
        await fetch("/api/data/cloud-save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: "ibrahim8msambwe@gmail.com",
            data_type: "device_delete",
            device_id: deviceId,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch (error) {
      console.error("Failed to delete device:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      category: "",
      ip_address: "",
      mac_address: "",
      domain: "",
      location: "",
      notes: "",
    })
  }

  const startEdit = (device: Device) => {
    setEditingDevice(device)
    setFormData({
      name: device.name,
      type: device.type,
      category: device.category,
      ip_address: device.ip_address || "",
      mac_address: device.mac_address || "",
      domain: device.domain || "",
      location: device.location || "",
      notes: device.notes || "",
    })
    setIsAddDialogOpen(true)
  }

  const getDeviceIcon = (type: string, category: string) => {
    if (category === "domain") return <Globe className="h-5 w-5" />
    if (category === "system") return <HardDrive className="h-5 w-5" />
    if (category === "cloud") return <Cloud className="h-5 w-5" />

    switch (type) {
      case "server":
        return <Server className="h-5 w-5" />
      case "laptop":
        return <Laptop className="h-5 w-5" />
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      case "desktop":
        return <Monitor className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "device":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "system":
        return "bg-green-100 text-green-800 border-green-200"
      case "domain":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cloud":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Device & System Management
          </h2>
          <p className="text-gray-600 text-lg">Manage devices, systems, domains, and cloud services with online sync</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingDevice(null)
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Device/System
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                {editingDevice ? "Edit Device/System" : "Add New Device/System"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Add devices, systems, domains, or cloud services to your secure vault
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-medium">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="device">Physical Device</SelectItem>
                      <SelectItem value="system">System/Software</SelectItem>
                      <SelectItem value="domain">Domain/Website</SelectItem>
                      <SelectItem value="cloud">Cloud Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-700 font-medium">
                    Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="mobile">Mobile Device</SelectItem>
                      <SelectItem value="router">Router/Network</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="api">API Service</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Server, Gmail Account, AWS Console"
                  className="h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ip_address" className="text-gray-700 font-medium">
                    IP Address
                  </Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ip_address: e.target.value }))}
                    placeholder="192.168.1.100"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-gray-700 font-medium">
                    Domain/URL
                  </Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
                    placeholder="example.com or https://app.service.com"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mac_address" className="text-gray-700 font-medium">
                    MAC Address
                  </Label>
                  <Input
                    id="mac_address"
                    value={formData.mac_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mac_address: e.target.value }))}
                    placeholder="00:1B:44:11:3A:B7"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Server Room A, Home Office, Cloud"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes, configurations, or important details"
                  className="min-h-[80px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              >
                {editingDevice ? "Update Device/System" : "Add Device/System"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card
            key={device.id}
            className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    {getDeviceIcon(device.type, device.category)}
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-800">{device.name}</CardTitle>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getCategoryColor(device.category)}>{device.category}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {device.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {device.domain && (
                <div className="text-sm p-2 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">Domain:</span>
                  <span className="text-purple-700 ml-2">{device.domain}</span>
                </div>
              )}
              {device.ip_address && (
                <div className="text-sm p-2 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">IP:</span>
                  <span className="text-blue-700 ml-2">{device.ip_address}</span>
                </div>
              )}
              {device.location && (
                <div className="text-sm p-2 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Location:</span>
                  <span className="text-green-700 ml-2">{device.location}</span>
                </div>
              )}
              {device.notes && (
                <div className="text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{device.notes}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 pt-2 border-t">
                Added: {new Date(device.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(device)}
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(device.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {devices.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Server className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No devices or systems registered</h3>
            <p className="text-gray-600 mb-6">Start by adding your first device, system, or domain</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Device/System
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
