import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    const { data: devices, error } = await supabase
      .from("devices")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch devices:", error)
      return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
    }

    return NextResponse.json(devices || [])
  } catch (error) {
    console.error("Failed to get devices:", error)
    return NextResponse.json({ error: "Failed to get devices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    const newDevice = {
      user_email: userEmail,
      name: data.name,
      type: data.type,
      category: data.category,
      ip_address: data.ip_address || null,
      mac_address: data.mac_address || null,
      domain: data.domain || null,
      location: data.location || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    }

    const { data: insertedDevice, error } = await supabase.from("devices").insert([newDevice]).select().single()

    if (error) {
      console.error("Failed to create device:", error)
      return NextResponse.json({ error: "Failed to create device" }, { status: 500 })
    }

    console.log(`Device created for ${userEmail}:`, insertedDevice)
    return NextResponse.json(insertedDevice, { status: 201 })
  } catch (error) {
    console.error("Failed to create device:", error)
    return NextResponse.json({ error: "Failed to create device" }, { status: 500 })
  }
}
