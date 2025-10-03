"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { REPORT_TYPES, getReportTypeById, type ReportType, type ReportField } from "@/lib/report-types"
import { Send, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface DynamicReportFormProps {
  batchId: string
  farmerName: string
  onReportSubmitted?: (report: any) => void
  onCancel?: () => void
  preselectedReportType?: string
}

export default function DynamicReportForm({ 
  batchId, 
  farmerName, 
  onReportSubmitted, 
  onCancel,
  preselectedReportType
}: DynamicReportFormProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>(preselectedReportType || "")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reportType = getReportTypeById(selectedReportType)

  // Reset form data when report type changes
  useEffect(() => {
    if (selectedReportType) {
      const newFormData: Record<string, any> = {}
      const type = getReportTypeById(selectedReportType)
      if (type) {
        type.fields.forEach(field => {
          if (field.type === 'boolean') {
            newFormData[field.id] = false
          } else {
            newFormData[field.id] = ''
          }
        })
      }
      setFormData(newFormData)
      setErrors({})
    }
  }, [selectedReportType])

  const validateField = (field: ReportField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (field.type === 'number' && value !== '') {
      const numValue = Number(value)
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `${field.label} must be at least ${field.validation.min}`
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `${field.label} must be at most ${field.validation.max}`
      }
    }

    if (field.type === 'date' && value && isNaN(Date.parse(value))) {
      return `${field.label} must be a valid date`
    }

    return null
  }

  const validateForm = (): boolean => {
    if (!reportType) return false

    const newErrors: Record<string, string> = {}
    let isValid = true

    reportType.fields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    if (!reportType || !validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setIsSubmitting(true)
    try {
      const reportData = {
        batchId,
        type: reportType.name,
        title: `${reportType.name} - ${new Date().toLocaleDateString()}`,
        content: `Report submitted by ${farmerName}`,
        priority: reportType.priority,
        fields: formData,
        reportType: selectedReportType
      }

      console.log("📤 Submitting report:", reportData)
      const response = await fetch('/api/user/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      const result = await response.json()
      console.log("📥 Report submission response:", { status: response.status, result })
      
      if (response.ok) {
        toast.success("Report submitted successfully!")
        onReportSubmitted?.(result.report)
        // Reset form
        setSelectedReportType("")
        setFormData({})
        setErrors({})
      } else {
        console.error("❌ Report submission failed:", result)
        toast.error(`Failed to submit report: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: ReportField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'boolean':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
            </Label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Type Selection - Only show if no preselected type */}
      {!preselectedReportType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Report Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REPORT_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReportType === type.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedReportType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{type.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            type.priority === 'Critical' ? 'border-red-500 text-red-600' :
                            type.priority === 'High' ? 'border-orange-500 text-orange-600' :
                            type.priority === 'Normal' ? 'border-blue-500 text-blue-600' :
                            'border-gray-500 text-gray-600'
                          }`}
                        >
                          {type.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Form Fields */}
      {reportType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{reportType.icon}</span>
              {reportType.name} - Form Fields
            </CardTitle>
            <p className="text-sm text-gray-600">{reportType.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportType.fields.map((field) => (
                <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions - Only show if no preselected type and no type selected */}
      {!preselectedReportType && !selectedReportType && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Select a Report Type
            </h3>
            <p className="text-gray-500">
              Choose a report type from the options above to see the relevant form fields.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
