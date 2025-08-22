import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all users (admin access) - removing 'role' from the select since it doesn't exist
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, created_at, last_login")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch all users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    console.log(`✅ Admin fetched ${users?.length || 0} users`)

    return NextResponse.json(users || [])
  } catch (error) {
    console.error("Failed to get all users:", error)
    return NextResponse.json({ error: "Failed to get all users" }, { status: 500 })
  }
}
