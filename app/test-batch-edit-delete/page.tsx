"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Building, 
  Edit, 
  Trash2, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye,
  AlertTriangle 
} from "lucide-react"
import { toast } from "sonner"

interface Batch {
  id: string
  name: string
  farmerName: string
  startDate: string
  birdCount: number
  mortality: number
  feedUsed: number
  status: "Planning" | "Starting" | "Active" | "Finalizing" | "Completed"
  healthStatus: "Excellent" | "Good" | "Fair" | "Poor"
  username: string
  password: string
  notes?: string
}

const TestBatchEditDeletePage = () => {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isStatusEditOpen, setIsStatusEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load batches on component mount
  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/batches')
      const data = await response.json()
      if (response.ok) {
        setBatches(data.batches || [])
        console.log('Batches loaded:', data.batches?.length || 0)
      } else {
        console.error('Failed to load batches:', data.error)
        toast.error(`Failed to load batches: ${data.error}`)
      }
    } catch (error: any) {
      console.error('Error loading batches:', error)
      toast.error(`Error loading batches: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch({ ...batch })
    setIsEditOpen(true)
  }

  const handleEditStatus = (batch: Batch) => {
    setEditingBatch({ ...batch })
    setIsStatusEditOpen(true)
  }

  const handleDeleteBatch = (batch: Batch) => {
    setBatchToDelete(batch)
    setIsDeleteConfirmOpen(true)
  }

  const saveBatchEdit = async () => {
    if (!editingBatch) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/batches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBatch.id,
          name: editingBatch.name,
          birdCount: editingBatch.birdCount,
          startDate: editingBatch.startDate,
          mortality: editingBatch.mortality,
          feedUsed: editingBatch.feedUsed,
          username: editingBatch.username,
          password: editingBatch.password,
          notes: editingBatch.notes
        })
      })

      const data = await response.json()
      if (response.ok) {
        setBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch } : b))
        setIsEditOpen(false)
        setEditingBatch(null)
        toast.success('✅ Batch updated successfully!')
      } else {
        toast.error(`❌ Failed to update batch: ${data.error}`)
      }
    } catch (error: any) {
      console.error('Error updating batch:', error)
      toast.error(`❌ Error updating batch: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const saveStatusEdit = async () => {
    if (!editingBatch) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/batches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBatch.id,
          status: editingBatch.status,
          healthStatus: editingBatch.healthStatus
        })
      })

      const data = await response.json()
      if (response.ok) {
        setBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...editingBatch } : b))
        setIsStatusEditOpen(false)
        setEditingBatch(null)
        toast.success('✅ Status updated successfully!')
      } else {
        toast.error(`❌ Failed to update status: ${data.error}`)
      }
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast.error(`❌ Error updating status: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!batchToDelete) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/batches?id=${encodeURIComponent(batchToDelete.id)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBatches(prev => prev.filter(b => b.id !== batchToDelete.id))
        setIsDeleteConfirmOpen(false)
        setBatchToDelete(null)
        toast.success('✅ Batch deleted successfully!')
      } else {
        const data = await response.json()
        toast.error(`❌ Failed to delete batch: ${data.error}`)
      }
    } catch (error: any) {
      console.error('Error deleting batch:', error)
      toast.error(`❌ Error deleting batch: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning": return "bg-yellow-100 text-yellow-800"
      case "Starting": return "bg-blue-100 text-blue-800"
      case "Active": return "bg-green-100 text-green-800"
      case "Finalizing": return "bg-orange-100 text-orange-800"
      case "Completed": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excellent": return "bg-emerald-100 text-emerald-800"
      case "Good": return "bg-green-100 text-green-800"
      case "Fair": return "bg-yellow-100 text-yellow-800"
      case "Poor": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Building className="h-8 w-8" />
              Test Batch Edit & Delete
            </CardTitle>
            <p className="text-purple-100 mt-2 text-lg">
              Test the batch editing and deletion functionality
            </p>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{batches.length}</div>
              <div className="text-sm text-gray-600">Total Batches</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {batches.filter(b => b.status === 'Active').length}
              </div>
              <div className="text-sm text-gray-600">Active Batches</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {batches.filter(b => b.status === 'Planning').length}
              </div>
              <div className="text-sm text-gray-600">Planning</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {batches.filter(b => b.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Batches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : batches.length > 0 ? (
            batches.map((batch) => (
              <Card key={batch.id} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Birds</p>
                      <p className="font-bold text-blue-800">{batch.birdCount.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Mortality</p>
                      <p className="font-bold text-red-800">{batch.mortality.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health:</span>
                      <Badge className={getHealthColor(batch.healthStatus)}>{batch.healthStatus}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-mono font-semibold">{batch.username}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditBatch(batch)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditStatus(batch)}
                      className="flex-1"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Status
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteBatch(batch)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No batches found. Create some batches first.</p>
            </div>
          )}
        </div>

        {/* Edit Batch Dialog */}
        {editingBatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Edit Batch Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Batch Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingBatch.name}
                    onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-birds">Bird Count *</Label>
                    <Input
                      id="edit-birds"
                      type="number"
                      value={editingBatch.birdCount}
                      onChange={(e) => setEditingBatch({ ...editingBatch, birdCount: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-start">Start Date *</Label>
                    <Input
                      id="edit-start"
                      type="date"
                      value={editingBatch.startDate}
                      onChange={(e) => setEditingBatch({ ...editingBatch, startDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-mortality">Mortality</Label>
                    <Input
                      id="edit-mortality"
                      type="number"
                      value={editingBatch.mortality}
                      onChange={(e) => setEditingBatch({ ...editingBatch, mortality: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-feed">Feed Used</Label>
                    <Input
                      id="edit-feed"
                      type="number"
                      value={editingBatch.feedUsed}
                      onChange={(e) => setEditingBatch({ ...editingBatch, feedUsed: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-username">Username *</Label>
                    <Input
                      id="edit-username"
                      value={editingBatch.username}
                      onChange={(e) => setEditingBatch({ ...editingBatch, username: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-password">Password *</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={editingBatch.password}
                      onChange={(e) => setEditingBatch({ ...editingBatch, password: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingBatch.notes || ''}
                    onChange={(e) => setEditingBatch({ ...editingBatch, notes: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={saveBatchEdit} 
                    disabled={isSaving}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Status Dialog */}
        {isStatusEditOpen && editingBatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Edit Batch Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-1">Batch: {editingBatch.name}</h3>
                  <p className="text-sm text-blue-600">Current Status: <span className="font-semibold">{editingBatch.status}</span></p>
                </div>

                <div>
                  <Label htmlFor="status-select">Status *</Label>
                  <Select
                    value={editingBatch.status}
                    onValueChange={(v) => setEditingBatch({ ...editingBatch, status: v as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Starting">Starting</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Finalizing">Finalizing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="health-select">Health Status *</Label>
                  <Select
                    value={editingBatch.healthStatus}
                    onValueChange={(v) => setEditingBatch({ ...editingBatch, healthStatus: v as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={saveStatusEdit} 
                    disabled={isSaving}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Activity className="h-4 w-4 mr-2" />
                    )}
                    Update Status
                  </Button>
                  <Button variant="outline" onClick={() => setIsStatusEditOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteConfirmOpen && batchToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Delete Batch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Are you sure you want to delete <strong>{batchToDelete.name}</strong>? This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Batch:</strong> {batchToDelete.name}</p>
                  <p><strong>Farmer:</strong> {batchToDelete.farmerName}</p>
                  <p><strong>Birds:</strong> {batchToDelete.birdCount.toLocaleString()}</p>
                  <p><strong>Status:</strong> {batchToDelete.status}</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={confirmDelete} 
                    disabled={isSaving}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Batch
                  </Button>
                  <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestBatchEditDeletePage
