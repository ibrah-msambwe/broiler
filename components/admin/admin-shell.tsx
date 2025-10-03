  "use client"

import React, { useEffect, useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Building, BarChart3, Settings, MessageSquare, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import NotificationCenter from "./notification-center"

export type AdminShellProps = {
  active: string
  onSelect: (value: string) => void
  children: React.ReactNode
  menuItems?: Array<{ id: string; label: string; icon: React.ComponentType<any> }>
  language?: "en" | "sw"
  onLanguageChange?: (lang: "en" | "sw") => void
  onLogout?: () => void
  // Custom branding for different user types
  brandTitle?: string
  brandSubtitle?: string
  brandInitial?: string
}

function MobileSidebarAutoOpen() {
  const { isMobile, setOpenMobile } = useSidebar()
  useEffect(() => {
    // Allow sidebar to stay open on mobile - user can control it with trigger button
    if (isMobile) setOpenMobile(true)
  }, [isMobile, setOpenMobile])
  return null
}

// Separate component that can use useSidebar hook
function SidebarMenuContent({ active, onSelect, menuItems }: { 
  active: string; 
  onSelect: (value: string) => void; 
  menuItems?: Array<{ id: string; label: string; icon: React.ComponentType<any> }> 
}) {
  const { setOpen } = useSidebar()
  
  const defaultMenu: Array<{ id: string; label: string; icon: React.ComponentType<any> }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "farmers", label: "Farmer Profiles", icon: Users },
    { id: "batches", label: "Batch Management", icon: Building },
    { id: "messages", label: "Messages & Chat", icon: MessageSquare },
    { id: "chart", label: "Analytics & Reports", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ]
  const items = menuItems && menuItems.length > 0 ? menuItems : defaultMenu

  const handleMenuSelect = (menuId: string) => {
    // Don't minimize the sidebar when a menu item is selected - let it stay expanded
    // Only call the original onSelect function
    onSelect(menuId)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] text-blue-600 font-medium px-4 py-2 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0 px-2">
          {items.map((m) => (
            <SidebarMenuItem key={m.id}>
              <SidebarMenuButton 
                isActive={active === m.id} 
                onClick={() => handleMenuSelect(m.id)} 
                className="group data-[active=true]:bg-blue-50 data-[active=true]:text-blue-800 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 rounded-none border-0 h-9 px-3 w-full justify-start" 
                size="sm"
              >
                <m.icon className="shrink-0 h-4 w-4 mr-3" />
                <span className="text-[13px] font-normal lg:block" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {/* Show full label on desktop and tablet, abbreviated on mobile */}
                  <span className="hidden lg:inline">{m.label}</span>
                  <span className="lg:hidden md:inline hidden">
                    {m.label.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="md:hidden">
                    {active === m.id ? m.label : (m.label || '').split(' ').map(word => word[0]).join('')}
                  </span>
                </span>
                {/* Active indicator for small devices */}
                {active === m.id && (
                  <div className="md:hidden ml-auto">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default function AdminShell({ active, onSelect, children, menuItems, language, onLanguageChange, onLogout, brandTitle, brandSubtitle, brandInitial }: AdminShellProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const defaultMenu: Array<{ id: string; label: string; icon: React.ComponentType<any> }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "farmers", label: "Farmer Profiles", icon: Users },
    { id: "batches", label: "Batch Management", icon: Building },
    { id: "messages", label: "Messages & Chat", icon: MessageSquare },
    { id: "chart", label: "Analytics & Reports", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ]
  const items = menuItems && menuItems.length > 0 ? menuItems : defaultMenu
  
  // Use custom branding or defaults
  const displayTitle = brandTitle || "TARIQ"
  const displaySubtitle = brandSubtitle || "Admin Panel"
  const displayInitial = brandInitial || "T"

  return (
    <>
      {/* Desktop View - Traditional Sidebar */}
      <div className="hidden lg:block">
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" className="bg-white text-gray-800 border-r border-blue-200">
            <SidebarHeader className="p-4 border-b border-blue-200">
              <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {displayInitial}
                </div>
                <div className="font-medium text-gray-800" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="text-base font-semibold text-blue-800">{displayTitle}</div>
                  <div className="text-xs text-blue-600">{displaySubtitle}</div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent className="overflow-y-auto">
              <SidebarMenuContent active={active} onSelect={onSelect} menuItems={items} />
            </SidebarContent>
            <SidebarFooter className="p-3 text-xs text-gray-500 text-center font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>© TARIQ</SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <div className="sticky top-0 z-20 bg-white border-b border-blue-200">
              <div className="h-12 px-4 flex items-center gap-3">
                <SidebarTrigger className="inline-flex hover:bg-blue-50 rounded p-1 transition-colors flex-shrink-0" />
                
                {/* Search Bar */}
                <div className="flex-1 max-w-md min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-blue-300 bg-white focus:border-blue-500 focus:outline-none text-sm"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="text-base lg:text-lg font-semibold text-blue-800 tracking-wide flex-shrink-0" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {active ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden lg:inline">{displayTitle} {displaySubtitle === "Admin Panel" ? "Dashboard" : ""}</span>
                      <span className="lg:hidden">{displayTitle}</span>
                      <span className="text-sm text-blue-400 hidden lg:inline">•</span>
                      <span className="text-sm text-blue-600 hidden lg:inline">
                        {items.find(item => item.id === active)?.label || 'Dashboard'}
                      </span>
                    </div>
                  ) : (
                    <span>{displayTitle}</span>
                  )}
                </div>
                
                {/* Right Side Controls */}
                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                  <NotificationCenter />
                  <div className="flex items-center gap-0 bg-blue-50 border border-blue-300">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={cn("h-8 px-3 text-xs font-normal border-0 rounded-none", language === "en" ? "bg-white border-r border-blue-300 text-blue-800" : "hover:bg-white/50 text-blue-700")} 
                      onClick={() => onLanguageChange?.("en")}
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      EN
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={cn("h-8 px-3 text-xs font-normal border-0 rounded-none", language === "sw" ? "bg-white text-blue-800" : "hover:bg-white/50 text-blue-700")} 
                      onClick={() => onLanguageChange?.("sw")}
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      SW
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onLogout}
                    className="hover:bg-blue-50 border-blue-300 h-8 px-3 text-xs font-normal rounded-none text-blue-700"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            <div className="w-full px-4 py-4 bg-white min-h-screen">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Mobile View - Flutter-style Android App */}
      <div className="lg:hidden flex flex-col h-screen bg-gray-50">
        {/* Modern Android App Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-lg shadow-md">
                {displayInitial}
              </div>
              <div>
                <div className="text-base font-semibold">{displayTitle}</div>
                <div className="text-xs text-blue-100">{displaySubtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Settings Icon Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Find settings menu item (could be "settings" or "system-settings")
                  const settingsItem = items.find(item => 
                    item.id === "settings" || item.id === "system-settings"
                  )
                  if (settingsItem) {
                    onSelect(settingsItem.id)
                  }
                }}
                className="h-9 w-9 p-0 rounded-full hover:bg-white/20 flex items-center justify-center"
              >
                <Settings className="h-5 w-5 text-white" />
              </Button>
              <NotificationCenter />
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onLogout}
                className="h-8 px-3 text-xs font-medium text-white hover:bg-white/20"
              >
                Exit
              </Button>
            </div>
          </div>
          {/* Active Tab Indicator */}
          <div className="px-4 pb-2">
            <div className="text-sm font-medium text-white/90">
              {items.find(item => item.id === active)?.label || 'Dashboard'}
            </div>
          </div>
        </div>

        {/* Main Content Area - Full Screen */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            {children}
          </div>
        </div>

        {/* Flutter-style Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
          <div className="flex items-center justify-around px-2 py-2">
            {items.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-500 active:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-200",
                    isActive ? "text-blue-600" : "text-gray-600"
                  )}>
                    {item.label.split(' ')[0]}
                  </span>
                  {isActive && (
                    <div className="absolute -top-1 w-10 h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
} 