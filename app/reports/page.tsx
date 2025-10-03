"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DynamicReportForm from "@/components/reports/dynamic-report-form"
import { getReportTypeIcon, REPORT_TYPES } from "@/lib/report-types"
import { FileText, Plus, Eye } from "lucide-react"
import { toast } from "sonner"

interface Report {
  id: string
  batchId: string
  type: string
  title: string
  content: string
  priority: string
  status: string
  date: string
  fields?: Record<string, any>
  reportType?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReportType, setSelectedReportType] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      // This would normally fetch from your API
      // For now, we'll use mock data
      const mockReports: Report[] = [
        {
          id: "1",
          batchId: "batch-1",
          type: "Daily Report",
          title: "Daily Report - 2024-01-15",
          content: "Daily monitoring report",
          priority: "Normal",
          status: "Submitted",
          date: "2024-01-15T10:00:00Z",
          reportType: "daily",
          fields: {
            bird_count: 480,
            mortality_count: 2,
            feed_consumed: 25.5,
            temperature: 32.5,
            health_status: "Good"
          }
        },
        {
          id: "2",
          batchId: "batch-1",
          type: "Mortality Report",
          title: "Mortality Report - 2024-01-14",
          content: "Report of bird deaths",
          priority: "High",
          status: "Under Review",
          date: "2024-01-14T15:30:00Z",
          reportType: "mortality",
          fields: {
            death_count: 3,
            age_at_death: 15,
            cause_of_death: "Disease",
            symptoms: "Lethargy and loss of appetite"
          }
        }
      ]
      setReports(mockReports)
    } catch (error) {
      console.error("Error loading reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReports = selectedReportType === "all" 
    ? reports 
    : reports.filter(report => report.reportType === selectedReportType)

  const reportTypeCounts = REPORT_TYPES.reduce((acc, type) => {
    acc[type.id] = reports.filter(report => report.reportType === type.id).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports Management</h1>
          <p className="text-gray-600 mt-2">Create and manage farm reports</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Report</TabsTrigger>
          <TabsTrigger value="view">View Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <DynamicReportForm 
            batchId="current-batch"
            farmerName="Current Farmer"
            onReportSubmitted={(report) => {
              setReports(prev => [report, ...prev])
              toast.success("Report submitted successfully!")
            }}
          />
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          {/* Report Type Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter by Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedReportType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedReportType("all")}
                >
                  All Reports ({reports.length})
                </Button>
                {REPORT_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedReportType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedReportType(type.id)}
                    className="flex items-center gap-2"
                  >
                    <span>{type.icon}</span>
                    {type.name} ({reportTypeCounts[type.id] || 0})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-500">
                    {selectedReportType === "all" 
                      ? "No reports have been submitted yet." 
                      : `No ${REPORT_TYPES.find(t => t.id === selectedReportType)?.name} reports found.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getReportTypeIcon(report.reportType || 'daily')}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <p className="text-sm text-gray-600">{report.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={
                            report.priority === 'Critical' ? 'border-red-500 text-red-600' :
                            report.priority === 'High' ? 'border-orange-500 text-orange-600' :
                            report.priority === 'Normal' ? 'border-blue-500 text-blue-600' :
                            'border-gray-500 text-gray-600'
                          }
                        >
                          {report.priority}
                        </Badge>
                        <Badge variant="secondary">{report.status}</Badge>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{report.content}</p>

                    <div className="text-sm text-gray-500 mb-4">
                      Submitted: {new Date(report.date).toLocaleString()}
                    </div>

                    {report.fields && Object.keys(report.fields).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-3">Report Details:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(report.fields).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-sm text-gray-800 font-semibold">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
