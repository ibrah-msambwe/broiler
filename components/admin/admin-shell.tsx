  "use client"

import React, { useEffect } from "react"
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
import { LayoutDashboard, Users, Building, BarChart3, Settings } from "lucide-react"
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
}

function MobileSidebarAutoOpen() {
  const { isMobile, setOpenMobile } = useSidebar()
  useEffect(() => {
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
    { id: "chart", label: "Analytics & Reports", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ]
  const items = menuItems && menuItems.length > 0 ? menuItems : defaultMenu

  const handleMenuSelect = (menuId: string) => {
    // Minimize the sidebar when a menu item is selected
    setOpen(false)
    // Call the original onSelect function
    onSelect(menuId)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase tracking-wide text-[10px] text-gray-400">Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2 md:gap-3">
          {items.map((m) => (
            <SidebarMenuItem key={m.id}>
              <SidebarMenuButton 
                isActive={active === m.id} 
                onClick={() => handleMenuSelect(m.id)} 
                className="group data-[active=true]:shadow-sm md:h-10" 
                size="sm"
              >
                <m.icon className="shrink-0" />
                <span className="text-sm md:text-[0.95rem] bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 group-data-[active=true]:from-indigo-600 group-data-[active=true]:to-emerald-600 font-semibold tracking-wide" style={{ fontFamily: 'Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', textShadow: "1px 1px 0 rgba(0,0,0,0.14), 0 0 10px rgba(99,102,241,0.10)" }}>{m.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default function AdminShell({ active, onSelect, children, menuItems, language, onLanguageChange }: AdminShellProps) {

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="bg-white text-gray-800 border-r">
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center font-extrabold">T</div>
            <div className="font-semibold tracking-wide">TARIQ</div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="overflow-y-auto">
          <SidebarMenuContent active={active} onSelect={onSelect} menuItems={menuItems} />
        </SidebarContent>
        <SidebarFooter className="p-2 text-xs text-gray-400">© TARIQ</SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <MobileSidebarAutoOpen />
        <div className="sticky top-0 z-20 bg-white border-b">
          <div className="h-16 px-4 flex items-center gap-3">
            <SidebarTrigger className="inline-flex" />
            <div className="text-lg md:text-2xl font-extrabold relative select-none tracking-wide" style={{fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'}}>
              <span className="absolute inset-0 blur-md opacity-40 bg-clip-text text-transparent bg-gradient-to-r from-slate-500 to-slate-700">TARIQ BROILER MANAGER</span>
              <span className="absolute inset-0 blur-sm opacity-50 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-500 to-emerald-500">TARIQ BROILER MANAGER</span>
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600" style={{textShadow: "2px 2px 4px rgba(0,0,0,0.25)"}}>TARIQ BROILER MANAGER</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <NotificationCenter />
              <Button size="sm" className={cn("hidden sm:inline-flex", language === "en" ? "bg-blue-600 text-white" : "")} onClick={() => onLanguageChange?.("en")}>EN</Button>
              <Button size="sm" className={cn("hidden sm:inline-flex", language === "sw" ? "bg-blue-600 text-white" : "")} onClick={() => onLanguageChange?.("sw")}>SW</Button>
              <Button size="sm">Logout</Button>
            </div>
          </div>
        </div>
        <div className="w-full px-4 md:px-6 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
} 