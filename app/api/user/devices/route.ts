import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userEmail = url.searchParams.get("email")

    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: devices, error } = await supabase
      .from("devices")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch user devices:", error)
      return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
    }

    return NextResponse.json(devices || [])
  } catch (error) {
    console.error("Failed to get user devices:", error)
    return NextResponse.json({ error: "Failed to get devices" }, { status: 500 })
  }
}
