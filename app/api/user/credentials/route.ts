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

    const { data: credentials, error } = await supabase
      .from("credentials")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch user credentials:", error)
      return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
    }

    return NextResponse.json(credentials || [])
  } catch (error) {
    console.error("Failed to get user credentials:", error)
    return NextResponse.json({ error: "Failed to get credentials" }, { status: 500 })
  }
}
