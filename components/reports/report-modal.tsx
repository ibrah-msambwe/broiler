"use client"

import { useState, useEffect } from "react"
import { X, FileText, Download, Eye, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface ReportFields {
  // Daily Report Fields
  openCount?: number
  closeCount?: number
  feedUsedBags?: number
  waterConsumption?: number
  dailyNotes?: string
  deaths?: number
  
  // Mortality Report Fields
  deathCount?: number
  birdAge?: number
  deathCause?: string
  deathLocation?: string
  deathDescription?: string
  
  // Health Report Fields
  healthStatus?: string
  temperature?: number
  humidity?: number
  vaccinationStatus?: string
  healthObservations?: string
  
  // Feed Report Fields
  feedType?: string
  feedQuantity?: number
  feedCostPerBag?: number
  storageCondition?: string
  feedQualityNotes?: string
  
  // Vaccination Report Fields
  vaccineName?: string
  vaccineType?: string
  dosage?: string
  vaccinationDate?: string
  nextDueDate?: string
  vaccinationNotes?: string
  
  // Environment Report Fields
  ambientTemperature?: number
  humidityLevel?: number
  ventilationStatus?: string
  lightingHours?: number
  environmentalNotes?: string
  
  // Growth Report Fields
  currentWeight?: number
  weightGain?: number
  feedConversionRatio?: number
  growthRate?: number
  growthNotes?: string
  
  // Emergency Report Fields
  emergencyType?: string
  severity?: string
  immediateAction?: string
  contactInfo?: string
  emergencyNotes?: string
}

interface Report {
  id: string
  type: "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination" | "Environment" | "Growth" | "Emergency"
  batchId: string
  title: string
  content: string
  status: "Sent" | "Draft" | "Approved" | "Rejected"
  date: string
  priority: "Normal" | "High" | "Urgent" | "Critical"
  fields?: ReportFields
  adminComment?: string
  adminCommentDate?: string
  batchName?: string
  farmerName?: string
}

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportType: "Daily" | "Mortality" | "Health" | "Feed" | "Vaccination" | "Environment" | "Growth" | "Emergency"
  mode: "create" | "view"
  report?: Report
  batchId: string
  batchName: string
  farmerName: string
  onReportSubmitted?: (report: Report) => void
}

export default function ReportModal({
  isOpen,
  onClose,
  reportType,
  mode,
  report,
  batchId,
  batchName,
  farmerName,
  onReportSubmitted
}: ReportModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportData, setReportData] = useState({
    type: reportType,
    priority: "Normal" as Report["priority"],
    title: "",
    content: "",
    fields: {} as ReportFields
  })

  useEffect(() => {
    if (report && mode === "view") {
      setReportData({
        type: report.type,
        priority: report.priority,
        title: report.title,
        content: report.content,
        fields: report.fields || {}
      })
    } else if (mode === "create") {
      setReportData({
        type: reportType,
        priority: "Normal",
        title: "",
        content: "",
        fields: {}
      })
    }
  }, [report, mode, reportType])

  const setField = (key: string, value: any) => {
    setReportData(prev => ({
      ...prev,
      fields: { ...prev.fields, [key]: value }
    }))
  }

  const handleSubmit = async () => {
    if (!reportData.title || !reportData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and content fields.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Handle mortality tracking first
      if (reportData.type === "Mortality" && reportData.fields.deathCount && reportData.fields.deathCount > 0) {
        try {
          await fetch("/api/user/mortality", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              batchId,
              deathCount: reportData.fields.deathCount,
              birdAge: reportData.fields.birdAge || 0,
              cause: reportData.fields.deathCause || "Unknown",
              location: reportData.fields.deathLocation || "",
              description: reportData.fields.deathDescription || "",
              date: new Date().toISOString().split('T')[0]
            }),
          })
        } catch (error) {
          console.error("Failed to create mortality record:", error)
        }
      }

      // Submit the main report
      const res = await fetch("/api/user/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          type: reportData.type,
          title: reportData.title,
          content: reportData.content,
          priority: reportData.priority,
          fields: reportData.fields,
          batchName,
          farmerName
        }),
      })

      const data = await res.json()
      if (data.report) {
        toast({
          title: "✅ Report Submitted Successfully!",
          description: `Your ${reportData.type} report has been sent to admin. You will receive updates here.`,
        })

        if (onReportSubmitted) {
          onReportSubmitted(data.report)
        }
        onClose()
      } else {
        throw new Error(data.error || "Failed to submit report")
      }
    } catch (error) {
      toast({
        title: "❌ Submission Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportToPDF = async () => {
    if (!report) return
    
    try {
      const res = await fetch("/api/export/single-credential-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report,
          batchName,
          farmerName,
          farmDetails: {
            name: "TARIQ Broiler Farm",
            address: "Nairobi, Kenya",
            phone: "+255 614 818 024",
            email: "admin@tariqbroiler.com"
          }
        }),
      })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `report-${report.id}-${report.type}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "📄 PDF Exported",
          description: "Report has been exported to PDF successfully.",
        })
      } else {
        throw new Error("Failed to export PDF")
      }
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (!isOpen) return null

  const renderReportFields = () => {
    switch (reportData.type) {
      case "Daily":
        return (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">📊 Daily Progress Report</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/70 border border-blue-200 rounded-lg p-4">
              <div>
                <Label>Opening Count (Birds)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 480" 
                  value={reportData.fields.openCount || ""} 
                  onChange={(e) => setField("openCount", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Closing Count (Birds)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 478" 
                  value={reportData.fields.closeCount || ""} 
                  onChange={(e) => setField("closeCount", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Deaths Today</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 2" 
                  value={reportData.fields.deaths || ""} 
                  onChange={(e) => setField("deaths", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Feed Used (Bags)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 5" 
                  value={reportData.fields.feedUsedBags || ""} 
                  onChange={(e) => setField("feedUsedBags", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Water Consumption (Liters)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 200" 
                  value={reportData.fields.waterConsumption || ""} 
                  onChange={(e) => setField("waterConsumption", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes & Observations</Label>
                <Textarea 
                  rows={2} 
                  placeholder="Any observations or notes..." 
                  value={reportData.fields.dailyNotes || ""} 
                  onChange={(e) => setField("dailyNotes", e.target.value)} 
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>
        )

      case "Mortality":
        return (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">💀 Mortality Report</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50/70 border border-red-200 rounded-lg p-4">
              <div>
                <Label>Number of Deaths</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 2" 
                  value={reportData.fields.deathCount || ""} 
                  onChange={(e) => setField("deathCount", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Age of Birds (Days)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 25" 
                  value={reportData.fields.birdAge || ""} 
                  onChange={(e) => setField("birdAge", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Cause of Death</Label>
                <Select 
                  value={reportData.fields.deathCause || ""} 
                  onValueChange={(v) => setField("deathCause", v)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Natural">Natural</SelectItem>
                    <SelectItem value="Disease">Disease</SelectItem>
                    <SelectItem value="Accident">Accident</SelectItem>
                    <SelectItem value="Heat Stress">Heat Stress</SelectItem>
                    <SelectItem value="Cold Stress">Cold Stress</SelectItem>
                    <SelectItem value="Feed Issue">Feed Issue</SelectItem>
                    <SelectItem value="Water Issue">Water Issue</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location in House</Label>
                <Input 
                  placeholder="e.g., Section A, Corner" 
                  value={reportData.fields.deathLocation || ""} 
                  onChange={(e) => setField("deathLocation", e.target.value)} 
                  disabled={mode === "view"}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Detailed Description</Label>
                <Textarea 
                  rows={3} 
                  placeholder="Describe the circumstances, symptoms, or any other relevant details..." 
                  value={reportData.fields.deathDescription || ""} 
                  onChange={(e) => setField("deathDescription", e.target.value)} 
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>
        )

      case "Health":
        return (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">🏥 Health Status Report</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50/70 border border-green-200 rounded-lg p-4">
              <div>
                <Label>Overall Health Status</Label>
                <Select 
                  value={reportData.fields.healthStatus || ""} 
                  onValueChange={(v) => setField("healthStatus", v)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g., 32.5" 
                  value={reportData.fields.temperature || ""} 
                  onChange={(e) => setField("temperature", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Humidity (%)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g., 65.0" 
                  value={reportData.fields.humidity || ""} 
                  onChange={(e) => setField("humidity", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Vaccination Status</Label>
                <Select 
                  value={reportData.fields.vaccinationStatus || ""} 
                  onValueChange={(v) => setField("vaccinationStatus", v)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Up to Date">Up to Date</SelectItem>
                    <SelectItem value="Due Soon">Due Soon</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Health Observations</Label>
                <Textarea 
                  rows={3} 
                  placeholder="Describe any health issues, symptoms, or positive observations..." 
                  value={reportData.fields.healthObservations || ""} 
                  onChange={(e) => setField("healthObservations", e.target.value)} 
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>
        )

      case "Feed":
        return (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">🌾 Feed Management Report</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50/70 border border-yellow-200 rounded-lg p-4">
              <div>
                <Label>Feed Type</Label>
                <Select 
                  value={reportData.fields.feedType || ""} 
                  onValueChange={(v) => setField("feedType", v)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter">Starter (0-7 days)</SelectItem>
                    <SelectItem value="Grower">Grower (8-21 days)</SelectItem>
                    <SelectItem value="Finisher">Finisher (22+ days)</SelectItem>
                    <SelectItem value="Custom">Custom Mix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Feed Quantity (Bags)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 5" 
                  value={reportData.fields.feedQuantity || ""} 
                  onChange={(e) => setField("feedQuantity", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Feed Cost per Bag</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g., 25.50" 
                  value={reportData.fields.feedCostPerBag || ""} 
                  onChange={(e) => setField("feedCostPerBag", Number(e.target.value))} 
                  disabled={mode === "view"}
                />
              </div>
              <div>
                <Label>Storage Condition</Label>
                <Select 
                  value={reportData.fields.storageCondition || ""} 
                  onValueChange={(v) => setField("storageCondition", v)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Feed Quality Notes</Label>
                <Textarea 
                  rows={2} 
                  placeholder="Any observations about feed quality, consumption patterns, or issues..." 
                  value={reportData.fields.feedQualityNotes || ""} 
                  onChange={(e) => setField("feedQualityNotes", e.target.value)} 
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Report type "{reportData.type}" form is being prepared.</p>
            <p className="text-sm">Please use the basic fields below for now.</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === "create" ? `Create ${reportData.type} Report` : `View ${reportData.type} Report`}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Report Info - No dropdown, just priority and title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Priority Level</Label>
              <Select 
                value={reportData.priority} 
                onValueChange={(v) => setReportData(prev => ({ ...prev, priority: v as Report["priority"] }))}
                disabled={mode === "view"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date" 
                value={new Date().toISOString().split('T')[0]}
                disabled
              />
            </div>
          </div>

          {/* Report Title */}
          <div>
            <Label>Report Title</Label>
            <Input 
              value={reportData.title} 
              onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))} 
              placeholder={`${reportData.type} Report Title`}
              disabled={mode === "view"}
            />
          </div>

          {/* Report Summary */}
          <div>
            <Label>Report Summary</Label>
            <Textarea 
              rows={3} 
              value={reportData.content} 
              onChange={(e) => setReportData(prev => ({ ...prev, content: e.target.value }))} 
              placeholder={`Brief summary of ${reportData.type.toLowerCase()} report...`}
              disabled={mode === "view"}
            />
          </div>

          {/* Dynamic Fields - No repetition, specific to type */}
          {renderReportFields()}

          {/* Admin Comment Section (for view mode) */}
          {mode === "view" && report?.adminComment && (
            <div className="space-y-3">
              <Separator />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <Label className="text-blue-800 font-semibold">Admin Comment</Label>
                </div>
                <p className="text-blue-700">{report.adminComment}</p>
                {report.adminCommentDate && (
                  <p className="text-xs text-blue-600 mt-2">
                    Commented on: {new Date(report.adminCommentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {mode === "view" && (
              <>
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </>
            )}
            {mode === "create" && (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    📤 Submit Report
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {mode === "create" ? "Cancel" : "Close"}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  )
} 