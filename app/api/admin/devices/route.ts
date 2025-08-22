import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all devices from all users (admin access)
    const { data: devices, error } = await supabase
      .from("devices")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch all devices:", error)
      return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
    }

    console.log(`✅ Admin fetched ${devices?.length || 0} devices from all users`)

    return NextResponse.json(devices || [])
  } catch (error) {
    console.error("Failed to get all devices:", error)
    return NextResponse.json({ error: "Failed to get all devices" }, { status: 500 })
  }
}
