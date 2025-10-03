"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, Filter, Eye, Trash2 } from "lucide-react"
import { getReportTypeIcon } from "@/lib/report-types"
import { toast } from "sonner"

interface Report {
  id: string
  type: "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination"
  title: string
  content: string
  status: "Sent" | "Draft" | "Approved" | "Rejected" | "Pending"
  date: string
  priority: "Normal" | "High" | "Urgent" | "Critical"
  data: Record<string, any>
  adminComment?: string
  created_at?: string
  batchId: string
  batchName: string
  farmerName: string
}

interface SimplifiedReportsSectionProps {
  reports: Report[]
  onReportSubmitted: (report: Report) => void
  onReportDeleted: (reportId: string) => void
  batchId: string
  farmerName: string
}

export default function SimplifiedReportsSection({
  reports,
  onReportSubmitted,
  onReportDeleted,
  batchId,
  farmerName
}: SimplifiedReportsSectionProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isViewReportOpen, setIsViewReportOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [exportFilters, setExportFilters] = useState({
    startDate: "",
    endDate: "",
    reportTypes: [] as string[],
    status: "all"
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200"
      case "High": return "bg-orange-100 text-orange-800 border-orange-200"
      case "Urgent": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200"
      case "Rejected": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const handleExportReports = async () => {
    try {
      const response = await fetch('/api/export/all-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          startDate: exportFilters.startDate || null,
          endDate: exportFilters.endDate || null,
          reportTypes: exportFilters.reportTypes.length > 0 ? exportFilters.reportTypes : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Create and download the HTML file
        const blob = new Blob([data.html], { type: 'text/html' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reports-export-${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`Exported ${data.count} reports successfully!`)
        setIsExportDialogOpen(false)
      } else {
        toast.error('Failed to export reports')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error exporting reports')
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setIsViewReportOpen(true)
  }

  const handleDeleteReport = async (reportId: string) => {
    // Report deletion is restricted - users must contact admin
    toast.error('Report deletion is not allowed. Please contact Tariq (System Admin) for assistance.', {
      duration: 5000,
      description: 'Contact: tariq@admin.com or call +255-XXX-XXXX'
    })
  }

  const reportTypes = [
    { id: "daily", name: "Daily Report", icon: "📊" },
    { id: "mortality", name: "Mortality Report", icon: "💀" },
    { id: "health", name: "Health Report", icon: "🏥" },
    { id: "feed", name: "Feed Report", icon: "🌾" },
    { id: "vaccination", name: "Vaccination Report", icon: "💉" },
    { id: "environment", name: "Environment Report", icon: "🌡️" }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-gray-600">Manage and export your farm reports</p>
        </div>
        <Button 
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export All Reports
        </Button>
      </div>

      {/* Report Type Cards */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Report
          </CardTitle>
          <p className="text-sm text-gray-600">Select a report type to fill out the form</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {reportTypes.map((type) => (
              <Card
                key={type.id}
                className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-2 hover:border-blue-300 active:scale-95 touch-manipulation"
                onClick={() => {
                  // This will be handled by the parent component
                  window.dispatchEvent(new CustomEvent('openReportPopup', { detail: type.id }))
                }}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl mb-2">{type.icon}</div>
                  <h3 className="font-semibold text-sm sm:text-base mb-2">{type.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Tap to Create
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submitted Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports submitted yet</p>
              <p className="text-sm">Create your first report using the cards above</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-3 sm:p-4 space-y-3 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl">{getReportTypeIcon(report.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base sm:text-lg truncate">{report.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {report.type} Report • {new Date(report.created_at || report.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getPriorityColor(report.priority)} text-xs`}>
                      {report.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(report.status)} text-xs`}>
                      {report.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 line-clamp-2">
                  {report.content}
                </div>

                {report.adminComment && (
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    <div className="text-sm font-medium text-yellow-800">Admin Comment:</div>
                    <div className="text-sm text-yellow-700">{report.adminComment}</div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t gap-2">
                  <div className="text-xs text-gray-500">
                    Submitted: {new Date(report.created_at || report.date).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewReport(report)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteReport(report.id)}
                      className="flex-1 sm:flex-none"
                      title="Contact Tariq (System Admin) to delete reports"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Contact Admin
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={exportFilters.startDate}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={exportFilters.endDate}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Report Types</Label>
              <Select
                value={exportFilters.reportTypes.length > 0 ? exportFilters.reportTypes[0] : "all"}
                onValueChange={(value) => 
                  setExportFilters(prev => ({ 
                    ...prev, 
                    reportTypes: value === "all" ? [] : [value] 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Daily">Daily Reports</SelectItem>
                  <SelectItem value="Mortality">Mortality Reports</SelectItem>
                  <SelectItem value="Health">Health Reports</SelectItem>
                  <SelectItem value="Feed">Feed Reports</SelectItem>
                  <SelectItem value="Vaccination">Vaccination Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleExportReports} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={isViewReportOpen} onOpenChange={setIsViewReportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Details
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedReport.title}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedReport.type} Report • {new Date(selectedReport.created_at || selectedReport.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Content:</h4>
                <p className="text-sm">{selectedReport.content}</p>
              </div>

              {selectedReport.data && Object.keys(selectedReport.data).length > 0 && (
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Report Data:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedReport.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.adminComment && (
                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-800 mb-2">Admin Comment:</h4>
                  <p className="text-sm text-yellow-700">{selectedReport.adminComment}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
