"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Target,
  BarChart3,
  Calendar,
  DollarSign,
  Thermometer
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguageStorage } from "@/lib/language-context"

interface AnalyticsDashboardProps {
  batches: any[]
  reports: any[]
}

export default function AnalyticsDashboard({ batches, reports }: AnalyticsDashboardProps) {
  const { language } = useLanguageStorage()

  const t = {
    en: {
      title: "Analytics Dashboard",
      subtitle: "Comprehensive performance insights and trends",
      mortalityTrend: "Mortality Trend Analysis",
      batchPerformance: "Batch Performance Comparison",
      reportTypes: "Report Distribution by Type",
      feedConversion: "Feed Conversion Ratio (FCR) Trend",
      weeklyInsights: "Weekly Performance Insights",
      avgMortality: "Avg Mortality Rate",
      avgFCR: "Average FCR",
      totalReports: "Total Reports",
      criticalAlerts: "Critical Alerts",
      noData: "No data available",
      viewDetails: "View Details"
    },
    sw: {
      title: "Dashibodi ya Uchanganuzi",
      subtitle: "Maarifa ya kina ya utendaji na mwelekeo",
      mortalityTrend: "Uchanganuzi wa Mwelekeo wa Vifo",
      batchPerformance: "Ulinganisho wa Utendaji wa Makundi",
      reportTypes: "Usambazaji wa Ripoti kwa Aina",
      feedConversion: "Mwelekeo wa Uwiano wa Ubadilishaji wa Chakula (FCR)",
      weeklyInsights: "Maarifa ya Utendaji wa Kila Wiki",
      avgMortality: "Wastani wa Kiwango cha Vifo",
      avgFCR: "Wastani wa FCR",
      totalReports: "Jumla ya Ripoti",
      criticalAlerts: "Arifa Muhimu",
      noData: "Hakuna data inapatikana",
      viewDetails: "Angalia Maelezo"
    }
  }[language]

  // Calculate mortality trend data (last 7 batches)
  const mortalityTrendData = batches.slice(0, 7).reverse().map((batch, index) => {
    const totalChicks = batch.totalChicks || batch.birdCount
    const mortalityRate = totalChicks > 0 ? ((batch.mortality / totalChicks) * 100).toFixed(2) : 0
    return {
      name: batch.name.length > 10 ? batch.name.substring(0, 10) + '...' : batch.name,
      mortality: parseFloat(mortalityRate),
      birds: batch.remainingBirds || batch.birdCount,
      target: 5 // Target mortality rate of 5%
    }
  })

  // Batch performance comparison
  const batchPerformanceData = batches.slice(0, 6).map(batch => {
    const totalChicks = batch.totalChicks || batch.birdCount
    const survivalRate = totalChicks > 0 ? ((batch.remainingBirds || batch.birdCount) / totalChicks * 100).toFixed(1) : 100
    return {
      name: batch.name.length > 8 ? batch.name.substring(0, 8) + '...' : batch.name,
      survival: parseFloat(survivalRate),
      fcr: parseFloat(batch.feedConversionRatio) || 1.8
    }
  })

  // Report type distribution - Handle different report type formats
  const reportTypeData = [
    { name: 'Daily', value: reports.filter(r => r.type === 'Daily' || r.type === 'daily' || r.reportType === 'daily').length, color: '#3b82f6' },
    { name: 'Mortality', value: reports.filter(r => r.type === 'Mortality' || r.type === 'mortality' || r.reportType === 'mortality').length, color: '#ef4444' },
    { name: 'Health', value: reports.filter(r => r.type === 'Health' || r.type === 'health' || r.reportType === 'health').length, color: '#10b981' },
    { name: 'Feed', value: reports.filter(r => r.type === 'Feed' || r.type === 'feed' || r.reportType === 'feed').length, color: '#f59e0b' },
    { name: 'Vaccination', value: reports.filter(r => r.type === 'Vaccination' || r.type === 'vaccination' || r.reportType === 'vaccination').length, color: '#8b5cf6' },
    { name: 'Environment', value: reports.filter(r => r.type === 'Environment' || r.type === 'environment' || r.reportType === 'environment').length, color: '#06b6d4' },
    { name: 'Other', value: reports.filter(r => {
      const type = (r.type || r.reportType || '').toLowerCase()
      return type && !['daily', 'mortality', 'health', 'feed', 'vaccination', 'environment'].includes(type)
    }).length, color: '#9ca3af' }
  ].filter(item => item.value > 0)
  
  // If still no data, show all reports as "Other"
  const finalReportTypeData = reportTypeData.length > 0 ? reportTypeData : (reports.length > 0 ? [{ name: 'All Reports', value: reports.length, color: '#3b82f6' }] : [])

  // FCR Trend (simulated weekly data)
  const fcrTrendData = [
    { week: 'Week 1', fcr: 1.9, target: 1.8 },
    { week: 'Week 2', fcr: 1.85, target: 1.8 },
    { week: 'Week 3', fcr: 1.82, target: 1.8 },
    { week: 'Week 4', fcr: 1.78, target: 1.8 },
    { week: 'Week 5', fcr: 1.75, target: 1.8 },
    { week: 'Week 6', fcr: 1.73, target: 1.8 }
  ]

  // Calculate summary metrics
  const totalBirds = batches.reduce((sum, b) => sum + (b.remainingBirds || b.birdCount), 0)
  const totalMortality = batches.reduce((sum, b) => sum + b.mortality, 0)
  const totalChicks = batches.reduce((sum, b) => sum + (b.totalChicks || b.birdCount), 0)
  const avgMortalityRate = totalChicks > 0 ? ((totalMortality / totalChicks) * 100).toFixed(2) : 0
  const avgFCR = batches.length > 0 
    ? (batches.reduce((sum, b) => sum + parseFloat(b.feedConversionRatio || 1.8), 0) / batches.length).toFixed(2)
    : "1.80"
  const criticalAlerts = batches.filter(b => {
    const mortalityRate = ((b.mortality / (b.totalChicks || b.birdCount)) * 100)
    return mortalityRate > 10 || b.healthStatus === 'Poor'
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold">{t.avgMortality}</p>
                <p className="text-3xl font-bold text-blue-900">{avgMortalityRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {parseFloat(avgMortalityRate) < 5 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Excellent</span>
                    </>
                  ) : parseFloat(avgMortalityRate) < 10 ? (
                    <>
                      <Activity className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Good</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">High</span>
                    </>
                  )}
                </div>
              </div>
              <Activity className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold">{t.avgFCR}</p>
                <p className="text-3xl font-bold text-green-900">{avgFCR}</p>
                <div className="flex items-center gap-1 mt-1">
                  {parseFloat(avgFCR) < 1.8 ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Target Met</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-3 w-3 text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">Needs Improvement</span>
                    </>
                  )}
                </div>
              </div>
              <Target className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold">{t.totalReports}</p>
                <p className="text-3xl font-bold text-purple-900">{reports.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">This month</span>
                </div>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold">{t.criticalAlerts}</p>
                <p className="text-3xl font-bold text-orange-900">{criticalAlerts}</p>
                <div className="flex items-center gap-1 mt-1">
                  {criticalAlerts > 0 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">Needs Attention</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">All Clear</span>
                    </>
                  )}
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mortality Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              {t.mortalityTrend}
            </CardTitle>
            <CardDescription>Track mortality rates across batches</CardDescription>
          </CardHeader>
          <CardContent>
            {mortalityTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mortalityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mortality" stroke="#ef4444" strokeWidth={2} name="Mortality Rate (%)" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target (5%)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">{t.noData}</div>
            )}
          </CardContent>
        </Card>

        {/* Batch Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t.batchPerformance}
            </CardTitle>
            <CardDescription>Compare survival rates across batches</CardDescription>
          </CardHeader>
          <CardContent>
            {batchPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batchPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="survival" fill="#10b981" name="Survival Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">{t.noData}</div>
            )}
          </CardContent>
        </Card>

        {/* Report Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              {t.reportTypes}
            </CardTitle>
            <CardDescription>Breakdown of report submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {finalReportTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={finalReportTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {finalReportTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-gray-400 mb-2">📊</div>
                <p className="font-medium">{t.noData}</p>
                <p className="text-sm mt-1">Reports will appear here when farmers submit them</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FCR Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {t.feedConversion}
            </CardTitle>
            <CardDescription>Monitor feed efficiency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fcrTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[1.5, 2.0]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="fcr" stroke="#10b981" fill="#10b98120" name="Actual FCR" />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" fill="#3b82f620" strokeDasharray="5 5" name="Target FCR" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

