import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all credentials from all users (admin access)
    const { data: credentials, error } = await supabase
      .from("credentials")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch all credentials:", error)
      return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
    }

    console.log(`✅ Admin fetched ${credentials?.length || 0} credentials from all users`)

    return NextResponse.json(credentials || [])
  } catch (error) {
    console.error("Failed to get all credentials:", error)
    return NextResponse.json({ error: "Failed to get all credentials" }, { status: 500 })
  }
}
