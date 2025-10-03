"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Target,
  Activity,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Calendar
} from "lucide-react"
import { useLanguageStorage } from "@/lib/language-context"
import { useState, useEffect } from "react"

interface InsightsSystemProps {
  batches: any[]
  reports: any[]
}

interface Insight {
  id: string
  type: 'critical' | 'warning' | 'success' | 'info'
  category: string
  title: string
  description: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
  affectedBatches: string[]
  actionable: boolean
  icon: any
}

export default function InsightsSystem({ batches, reports }: InsightsSystemProps) {
  const { language } = useLanguageStorage()
  const [insights, setInsights] = useState<Insight[]>([])

  const t = {
    en: {
      title: "AI Insights & Recommendations",
      subtitle: "Data-driven decisions based on weekly report analysis",
      generating: "Analyzing reports...",
      noInsights: "No insights available. System is learning from your data.",
      critical: "Critical",
      warning: "Warning",
      success: "Success",
      info: "Information",
      recommendation: "Recommendation",
      affectedBatches: "Affected Batches",
      takeAction: "Take Action",
      markAsRead: "Mark as Read",
      priority: "Priority",
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    sw: {
      title: "Maarifa ya AI na Mapendekezo",
      subtitle: "Maamuzi yanayotegemea data kulingana na uchanganuzi wa ripoti za kila wiki",
      generating: "Inachanganua ripoti...",
      noInsights: "Hakuna maarifa yanapatikana. Mfumo unajifunza kutoka kwa data yako.",
      critical: "Muhimu Sana",
      warning: "Onyo",
      success: "Mafanikio",
      info: "Taarifa",
      recommendation: "Pendekezo",
      affectedBatches: "Makundi Yaliyoathirika",
      takeAction: "Chukua Hatua",
      markAsRead: "Weka Kama Umesoma",
      priority: "Kipaumbele",
      high: "Juu",
      medium: "Wastani",
      low: "Chini"
    }
  }[language]

  // AI Analysis Engine - Generate insights from batches and reports
  useEffect(() => {
    const generateInsights = () => {
      const newInsights: Insight[] = []

      // Only generate insights if we have real data
      if (batches.length === 0) {
        setInsights([])
        return
      }

      // 1. High Mortality Alert - Based on REAL batch data
      batches.forEach(batch => {
        const totalChicks = batch.totalChicks || batch.birdCount
        const mortalityRate = totalChicks > 0 ? (batch.mortality / totalChicks) * 100 : 0
        
        // Skip if no meaningful data
        if (totalChicks === 0) return
        
        if (mortalityRate > 10) {
          newInsights.push({
            id: `mortality-${batch.id}`,
            type: 'critical',
            category: 'Mortality',
            title: `High Mortality Detected in ${batch.name}`,
            description: `Mortality rate is ${mortalityRate.toFixed(2)}%, which is above the acceptable threshold of 10%. This requires immediate attention.`,
            recommendation: `Immediate actions: 1) Isolate sick birds, 2) Contact veterinarian for diagnosis, 3) Review biosecurity measures, 4) Check water and feed quality, 5) Improve ventilation.`,
            priority: 'high',
            affectedBatches: [batch.name],
            actionable: true,
            icon: AlertTriangle
          })
        } else if (mortalityRate > 5 && mortalityRate <= 10) {
          newInsights.push({
            id: `mortality-warning-${batch.id}`,
            type: 'warning',
            category: 'Mortality',
            title: `Elevated Mortality in ${batch.name}`,
            description: `Mortality rate is ${mortalityRate.toFixed(2)}%. While not critical, this is trending above the optimal 5% target.`,
            recommendation: `Monitor closely: 1) Increase observation frequency, 2) Review recent changes in management, 3) Ensure proper vaccination schedule, 4) Check environmental conditions.`,
            priority: 'medium',
            affectedBatches: [batch.name],
            actionable: true,
            icon: TrendingUp
          })
        } else if (mortalityRate < 3) {
          newInsights.push({
            id: `mortality-success-${batch.id}`,
            type: 'success',
            category: 'Mortality',
            title: `Excellent Mortality Control in ${batch.name}`,
            description: `Outstanding performance! Mortality rate is only ${mortalityRate.toFixed(2)}%, well below industry standards.`,
            recommendation: `Document best practices: Record current management practices, biosecurity measures, and environmental controls as a template for other batches.`,
            priority: 'low',
            affectedBatches: [batch.name],
            actionable: false,
            icon: CheckCircle
          })
        }
      })

      // 2. Feed Conversion Ratio Analysis - Real FCR data
      batches.forEach(batch => {
        const fcr = parseFloat(batch.feedConversionRatio) || 0
        
        // Skip if no FCR data
        if (fcr === 0) return
        
        if (fcr > 2.0) {
          newInsights.push({
            id: `fcr-${batch.id}`,
            type: 'warning',
            category: 'Feed Efficiency',
            title: `Poor Feed Conversion in ${batch.name}`,
            description: `FCR is ${fcr.toFixed(2)}, which is higher than the target of 1.8. This indicates inefficient feed utilization.`,
            recommendation: `Actions to improve FCR: 1) Review feed quality and storage, 2) Check for feed wastage, 3) Ensure proper feeding schedule, 4) Rule out disease issues, 5) Optimize environmental temperature.`,
            priority: 'medium',
            affectedBatches: [batch.name],
            actionable: true,
            icon: TrendingDown
          })
        } else if (fcr < 1.7) {
          newInsights.push({
            id: `fcr-success-${batch.id}`,
            type: 'success',
            category: 'Feed Efficiency',
            title: `Excellent FCR in ${batch.name}`,
            description: `Exceptional feed efficiency! FCR is ${fcr.toFixed(2)}, which is excellent and indicates optimal growth.`,
            recommendation: `Maintain current practices and share this success model with other batches.`,
            priority: 'low',
            affectedBatches: [batch.name],
            actionable: false,
            icon: Target
          })
        }
      })

      // 3. Health Status Analysis
      const poorHealthBatches = batches.filter(b => b.healthStatus === 'Poor')
      if (poorHealthBatches.length > 0) {
        newInsights.push({
          id: 'health-critical',
          type: 'critical',
          category: 'Health',
          title: `${poorHealthBatches.length} Batch(es) with Poor Health Status`,
          description: `Multiple batches are showing poor health indicators. This could indicate a systemic issue or disease outbreak.`,
          recommendation: `Emergency protocol: 1) Immediate veterinary consultation, 2) Implement strict biosecurity, 3) Test for common diseases (Newcastle, Gumboro, etc.), 4) Review vaccination records, 5) Quarantine affected batches.`,
          priority: 'high',
          affectedBatches: poorHealthBatches.map(b => b.name),
          actionable: true,
          icon: Shield
        })
      }

      // 4. Report Submission Analysis - Real report tracking
      const recentReports = reports.filter(r => {
        if (!r.created_at && !r.date) return false
        const reportDate = new Date(r.created_at || r.date)
        const daysSince = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince <= 7
      })

      // Expected: At least 2 reports per batch per week
      const expectedReports = batches.length * 2
      if (batches.length > 0 && recentReports.length < expectedReports) {
        newInsights.push({
          id: 'report-submission',
          type: 'warning',
          category: 'Reporting',
          title: 'Low Report Submission Rate',
          description: `Only ${recentReports.length} reports received in the past week for ${batches.length} active batches. Regular reporting is crucial for proactive management.`,
          recommendation: `Action: 1) Remind batch managers to submit daily reports, 2) Review reporting requirements with farmers, 3) Simplify report submission process if needed.`,
          priority: 'medium',
          affectedBatches: ['All Batches'],
          actionable: true,
          icon: Activity
        })
      }

      // 5. Performance Trend Analysis - Real average across all batches
      const batchesWithData = batches.filter(b => (b.totalChicks || b.birdCount) > 0)
      
      if (batchesWithData.length > 0) {
        const avgMortality = batchesWithData.reduce((sum, b) => {
          const total = b.totalChicks || b.birdCount
          return sum + (total > 0 ? (b.mortality / total) * 100 : 0)
        }, 0) / batchesWithData.length

        if (avgMortality < 5) {
        newInsights.push({
          id: 'performance-excellent',
          type: 'success',
          category: 'Overall Performance',
          title: 'Outstanding Farm Performance',
          description: `Average mortality across all batches is ${avgMortality.toFixed(2)}%, which is excellent. Your farm is performing above industry standards.`,
          recommendation: `Continue current practices and consider: 1) Document your success story, 2) Share best practices with farming community, 3) Maintain current biosecurity protocols.`,
          priority: 'low',
          affectedBatches: ['All Batches'],
          actionable: false,
          icon: ThumbsUp
        })
        }
      }

      // 6. Batch Age & Planning Insights - Real batch age calculation
      const oldBatches = batches.filter(b => {
        if (!b.startDate) return false
        const startDate = new Date(b.startDate)
        if (isNaN(startDate.getTime())) return false
        const daysSince = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince > 35 && b.status === 'Active'
      })

      if (oldBatches.length > 0) {
        newInsights.push({
          id: 'harvest-planning',
          type: 'info',
          category: 'Planning',
          title: `${oldBatches.length} Batch(es) Approaching Harvest Time`,
          description: `Batches are over 35 days old and approaching optimal market weight (35-42 days typical harvest window).`,
          recommendation: `Harvest preparation: 1) Contact buyers and confirm market demand, 2) Schedule harvest logistics, 3) Prepare financial documentation, 4) Plan next batch timing for optimal cash flow.`,
          priority: 'medium',
          affectedBatches: oldBatches.map(b => b.name),
          actionable: true,
          icon: Calendar
        })
      }

      // 7. Critical Reports Analysis - Real pending reports
      const criticalReports = reports.filter(r => 
        r.priority === 'Critical' && 
        r.status === 'Pending'
      )
      
      if (criticalReports.length > 0) {
        newInsights.push({
          id: 'critical-reports',
          type: 'critical',
          category: 'Reports',
          title: `${criticalReports.length} Critical Report(s) Awaiting Review`,
          description: `Urgent reports require immediate admin attention. Delayed response could result in increased losses.`,
          recommendation: `Immediate action required: Review and respond to all critical reports within the next hour. Consider setting up automatic escalation for critical issues.`,
          priority: 'high',
          affectedBatches: criticalReports.map(r => r.batchName),
          actionable: true,
          icon: Zap
        })
      }

      // 8. Recent Report Analysis - Auto-generate insights from latest reports
      const last24HoursReports = reports.filter(r => {
        if (!r.created_at && !r.date) return false
        const reportDate = new Date(r.created_at || r.date)
        const hoursSince = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60)
        return hoursSince <= 24
      })

      if (last24HoursReports.length > 0) {
        // Analyze each recent report for immediate insights
        last24HoursReports.forEach(report => {
          // High mortality in single report
          if (report.data?.mortalityCount && report.data.mortalityCount > 20) {
            newInsights.push({
              id: `recent-report-mortality-${report.id}`,
              type: 'warning',
              category: 'Recent Report',
              title: `High Daily Mortality in Latest Report - ${report.batchName}`,
              description: `Latest report shows ${report.data.mortalityCount} deaths in one day. This requires immediate attention.`,
              recommendation: `Review report details and take immediate action: 1) Check environmental conditions, 2) Inspect feed and water, 3) Look for signs of disease, 4) Consider veterinary consultation.`,
              priority: 'high',
              affectedBatches: [report.batchName],
              actionable: true,
              icon: AlertTriangle
            })
          }

          // Health issues reported
          if (report.type === 'Health' && report.priority === 'High') {
            newInsights.push({
              id: `recent-health-report-${report.id}`,
              type: 'warning',
              category: 'Health Report',
              title: `Health Issue Reported - ${report.batchName}`,
              description: `High priority health report submitted: ${report.title}`,
              recommendation: `Review the health report immediately and follow up with the farmer. Consider: 1) Symptoms observed, 2) Number of birds affected, 3) Treatment administered, 4) Need for veterinary assistance.`,
              priority: 'high',
              affectedBatches: [report.batchName],
              actionable: true,
              icon: Shield
            })
          }
        })
      }

      // Sort by priority and recency
      setInsights(newInsights.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }))
    }

    generateInsights()
    
    // Re-generate insights every 60 seconds to catch new reports
    const interval = setInterval(generateInsights, 60000)
    
    return () => clearInterval(interval)
  }, [batches, reports])

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'success': return 'bg-green-100 text-green-800 border-green-300'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-purple-600" />
            {t.title}
          </CardTitle>
          <CardDescription className="text-base">{t.subtitle}</CardDescription>
        </CardHeader>
      </Card>

      {/* Insights List */}
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {insights.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t.noInsights}</p>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight) => {
              const IconComponent = insight.icon
              return (
                <Card key={insight.id} className={`border-l-4 ${getTypeColor(insight.type)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getTypeColor(insight.type)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <Badge className={getPriorityColor(insight.priority) + ' text-white'}>
                              {insight.priority === 'high' ? t.high : insight.priority === 'medium' ? t.medium : t.low}
                            </Badge>
                            <Badge variant="outline">{insight.category}</Badge>
                          </div>
                          <CardDescription className="text-sm">{insight.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Recommendation */}
                    <div className="bg-white/50 rounded-lg p-3 border border-dashed">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">{t.recommendation}:</p>
                          <p className="text-sm text-gray-600">{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Affected Batches */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">{t.affectedBatches}:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.affectedBatches.map((batchName, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {batchName}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {insight.actionable && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {t.takeAction}
                        </Button>
                        <Button size="sm" variant="outline">
                          {t.markAsRead}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

