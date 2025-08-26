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

export async function POST(request: NextRequest) {
  try {
    const { userEmail, deviceName, username, password, service, notes } = await request.json()
    if (!userEmail) return NextResponse.json({ error: "userEmail required" }, { status: 400 })

    const supabase = createServerSupabaseClient()
    const insert = {
      user_email: userEmail,
      device_name: deviceName || null,
      username: username || null,
      password: password || null,
      service: service || null,
      notes: notes || null,
    }
    const { data, error } = await supabase.from("credentials").insert(insert).select("*").maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ credential: data })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, deviceName, username, password, service, notes } = await request.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const supabase = createServerSupabaseClient()
    const update = {
      ...(deviceName !== undefined ? { device_name: deviceName } : {}),
      ...(username !== undefined ? { username } : {}),
      ...(password !== undefined ? { password } : {}),
      ...(service !== undefined ? { service } : {}),
      ...(notes !== undefined ? { notes } : {}),
    }
    const { data, error } = await supabase.from("credentials").update(update).eq("id", id).select("*").maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ credential: data })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
