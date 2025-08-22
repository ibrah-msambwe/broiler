import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    const updatedDevice = {
      name: data.name,
      type: data.type,
      category: data.category,
      ip_address: data.ip_address || null,
      mac_address: data.mac_address || null,
      domain: data.domain || null,
      location: data.location || null,
      notes: data.notes || null,
      last_updated: new Date().toISOString(),
    }

    const { data: device, error } = await supabase
      .from("devices")
      .update(updatedDevice)
      .eq("id", params.id)
      .eq("user_email", userEmail)
      .select()
      .single()

    if (error) {
      console.error("Failed to update device:", error)
      return NextResponse.json({ error: "Failed to update device" }, { status: 500 })
    }

    console.log(`Device updated for ${userEmail}:`, device)
    return NextResponse.json(device)
  } catch (error) {
    console.error("Failed to update device:", error)
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    const { error } = await supabase.from("devices").delete().eq("id", params.id).eq("user_email", userEmail)

    if (error) {
      console.error("Failed to delete device:", error)
      return NextResponse.json({ error: "Failed to delete device" }, { status: 500 })
    }

    console.log(`Device deleted for ${userEmail}:`, params.id)
    return NextResponse.json({ message: "Device deleted successfully" })
  } catch (error) {
    console.error("Failed to delete device:", error)
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 })
  }
}
