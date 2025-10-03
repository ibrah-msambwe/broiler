"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ChevronRight,
  Home,
  Activity,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  activeSection: string
  className?: string
}

const sectionConfig = {
  dashboard: {
    title: "Dashboard",
    description: "Overview and system statistics",
    icon: LayoutDashboard,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  farmers: {
    title: "Farmer Profiles",
    description: "Manage farmer accounts and farm information",
    icon: Users,
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  batches: {
    title: "Batch Management",
    description: "Monitor and manage broiler batches",
    icon: Building,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  messages: {
    title: "Messages & Chat",
    description: "Real-time communication system",
    icon: MessageSquare,
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  chart: {
    title: "Analytics & Reports",
    description: "Performance analytics and reporting",
    icon: BarChart3,
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  analytics: {
    title: "Analytics & Insights",
    description: "AI-powered insights and performance analytics",
    icon: Brain,
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  "user-activity": {
    title: "User Activity",
    description: "Monitor user activities and system usage",
    icon: Activity,
    color: "bg-cyan-500",
    textColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  settings: {
    title: "System Settings",
    description: "Configure system preferences and settings",
    icon: Settings,
    color: "bg-gray-500",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  },
  "system-settings": {
    title: "System Settings",
    description: "Configure system preferences and AI recommendations",
    icon: Settings,
    color: "bg-gray-500",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  }
}

export default function SectionHeader({ activeSection, className }: SectionHeaderProps) {
  const config = sectionConfig[activeSection as keyof typeof sectionConfig] || sectionConfig.dashboard
  const Icon = config.icon

  return (
    <div className={cn(
      "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-3">
          {/* Section Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shadow-md",
            config.color
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          {/* Section Info */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-3 w-3 text-gray-400" />
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Admin Panel</span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <span className={cn("text-xs font-semibold", config.textColor)}>
                {config.title}
              </span>
            </div>
            
            {/* Section Title */}
            <h2 className={cn(
              "text-lg font-bold text-gray-800 truncate",
              config.textColor
            )}>
              {config.title}
            </h2>
            
            {/* Section Description */}
            <p className="text-gray-600 text-xs truncate">
              {config.description}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <Badge 
              variant="outline" 
              className="text-xs font-medium"
            >
              Active
            </Badge>
            <div className="text-xs">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
