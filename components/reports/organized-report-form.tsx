"use client"

import { useState } from "react"
import { FileText, AlertTriangle, CheckCircle, Clock, User, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ReportFields {
  // Daily Report Fields
  openCount?: number
  closeCount?: number
  feedUsedBags?: number
  waterConsumption?: number
  dailyNotes?: string
  
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

interface OrganizedReportFormProps {
  reportType: string
  reportPriority: string
  reportTitle: string
  reportContent: string
  reportFields: ReportFields
  isSubmittingReport: boolean
  onTypeChange: (type: string) => void
  onPriorityChange: (priority: string) => void
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onFieldChange: (field: string, value: any) => void
  onSubmit: () => void
}

export default function OrganizedReportForm({
  reportType,
  reportPriority,
  reportTitle,
  reportContent,
  reportFields,
  isSubmittingReport,
  onTypeChange,
  onPriorityChange,
  onTitleChange,
  onContentChange,
  onFieldChange,
  onSubmit
}: OrganizedReportFormProps) {
  
  const reportTypeOptions = [
    { type: "Daily", icon: "📊", color: "bg-blue-500", desc: "Daily Progress" },
    { type: "Mortality", icon: "💀", color: "bg-red-500", desc: "Death Reports" },
    { type: "Health", icon: "🏥", color: "bg-green-500", desc: "Health Status" },
    { type: "Feed", icon: "🌾", color: "bg-yellow-500", desc: "Feed Management" },
    { type: "Vaccination", icon: "💉", color: "bg-purple-500", desc: "Vaccination Records" },
    { type: "Environment", icon: "🌡️", color: "bg-orange-500", desc: "Environmental Data" },
    { type: "Growth", icon: "📈", color: "bg-indigo-500", desc: "Growth Metrics" },
    { type: "Emergency", icon: "🚨", color: "bg-red-600", desc: "Urgent Issues" }
  ]

  const priorityOptions = [
    { value: "Low", color: "bg-gray-500" },
    { value: "Normal", color: "bg-blue-500" },
    { value: "High", color: "bg-orange-500" },
    { value: "Critical", color: "bg-red-600" }
  ]

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> 
            Select Report Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onTypeChange(option.type)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  reportType === option.type
                    ? `${option.color} text-white border-transparent shadow-lg`
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-semibold text-sm">{option.type}</div>
                <div className="text-xs opacity-80">{option.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Creation Form */}
      {reportType && (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> 
              Create {reportType} Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Report Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Priority Level</Label>
                <Select value={reportPriority} onValueChange={onPriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                          {priority.value}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Report Title</Label>
                <Input 
                  value={reportTitle} 
                  onChange={(e) => onTitleChange(e.target.value)} 
                  placeholder={`${reportType} Report Title`}
                />
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

            {/* Report Summary */}
            <div>
              <Label>Report Summary</Label>
              <Textarea 
                rows={3} 
                value={reportContent} 
                onChange={(e) => onContentChange(e.target.value)} 
                placeholder={`Brief summary of ${reportType.toLowerCase()} report...`}
              />
            </div>

            {/* Dynamic Fields Based on Report Type */}
            {reportType === "Daily" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">📊 Daily Progress Report</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/70 border border-blue-200 rounded-lg p-4">
                  <div>
                    <Label>Opening Count (Birds)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 480" 
                      value={reportFields.openCount || ""} 
                      onChange={(e) => onFieldChange("openCount", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Closing Count (Birds)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 478" 
                      value={reportFields.closeCount || ""} 
                      onChange={(e) => onFieldChange("closeCount", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Feed Used (Bags)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 5" 
                      value={reportFields.feedUsedBags || ""} 
                      onChange={(e) => onFieldChange("feedUsedBags", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Water Consumption (Liters)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 200" 
                      value={reportFields.waterConsumption || ""} 
                      onChange={(e) => onFieldChange("waterConsumption", Number(e.target.value))} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notes & Observations</Label>
                    <Textarea 
                      rows={2} 
                      placeholder="Any observations or notes..." 
                      value={reportFields.dailyNotes || ""} 
                      onChange={(e) => onFieldChange("dailyNotes", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {reportType === "Mortality" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">💀 Mortality Report</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50/70 border border-red-200 rounded-lg p-4">
                  <div>
                    <Label>Number of Deaths</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 2" 
                      value={reportFields.deathCount || ""} 
                      onChange={(e) => onFieldChange("deathCount", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Age of Birds (Days)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 25" 
                      value={reportFields.birdAge || ""} 
                      onChange={(e) => onFieldChange("birdAge", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Cause of Death</Label>
                    <Select 
                      value={reportFields.deathCause || ""} 
                      onValueChange={(v) => onFieldChange("deathCause", v)}
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
                      value={reportFields.deathLocation || ""} 
                      onChange={(e) => onFieldChange("deathLocation", e.target.value)} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Detailed Description</Label>
                    <Textarea 
                      rows={3} 
                      placeholder="Describe the circumstances, symptoms, or any other relevant details..." 
                      value={reportFields.deathDescription || ""} 
                      onChange={(e) => onFieldChange("deathDescription", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {reportType === "Health" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">🏥 Health Status Report</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50/70 border border-green-200 rounded-lg p-4">
                  <div>
                    <Label>Overall Health Status</Label>
                    <Select 
                      value={reportFields.healthStatus || ""} 
                      onValueChange={(v) => onFieldChange("healthStatus", v)}
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
                      value={reportFields.temperature || ""} 
                      onChange={(e) => onFieldChange("temperature", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Humidity (%)</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g., 65.0" 
                      value={reportFields.humidity || ""} 
                      onChange={(e) => onFieldChange("humidity", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Vaccination Status</Label>
                    <Select 
                      value={reportFields.vaccinationStatus || ""} 
                      onValueChange={(v) => onFieldChange("vaccinationStatus", v)}
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
                      value={reportFields.healthObservations || ""} 
                      onChange={(e) => onFieldChange("healthObservations", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {reportType === "Feed" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">🌾 Feed Management Report</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50/70 border border-yellow-200 rounded-lg p-4">
                  <div>
                    <Label>Feed Type</Label>
                    <Select 
                      value={reportFields.feedType || ""} 
                      onValueChange={(v) => onFieldChange("feedType", v)}
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
                      value={reportFields.feedQuantity || ""} 
                      onChange={(e) => onFieldChange("feedQuantity", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Feed Cost per Bag</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g., 25.50" 
                      value={reportFields.feedCostPerBag || ""} 
                      onChange={(e) => onFieldChange("feedCostPerBag", Number(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label>Storage Condition</Label>
                    <Select 
                      value={reportFields.storageCondition || ""} 
                      onValueChange={(v) => onFieldChange("storageCondition", v)}
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
                      value={reportFields.feedQualityNotes || ""} 
                      onChange={(e) => onFieldChange("feedQualityNotes", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                onClick={onSubmit} 
                disabled={isSubmittingReport}
                className="px-8 py-2"
              >
                {isSubmittingReport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    📤 Submit {reportType} Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 