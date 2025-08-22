import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { encryptPasswordIfNeeded } from "@/lib/encryption"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    const { data: credentials, error } = await supabase
      .from("credentials")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch credentials:", error)
      return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
    }

    console.log(`Fetched ${credentials?.length || 0} credentials for ${userEmail}`)
    return NextResponse.json(credentials || [])
  } catch (error) {
    console.error("Failed to get credentials:", error)
    return NextResponse.json({ error: "Failed to get credentials" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    // Get device name if device_id is provided
    let deviceName = data.device_name
    if (data.device_id && !deviceName) {
      const { data: device } = await supabase.from("devices").select("name").eq("id", data.device_id).single()
      deviceName = device?.name || "Unknown Device"
    }

    // Encrypt the password before storing (AES - reversible)
    const encryptedPassword = encryptPasswordIfNeeded(data.password)

    const newCredential = {
      user_email: userEmail,
      device_id: data.device_id || null,
      device_name: deviceName,
      username: data.username,
      password: encryptedPassword, // Store AES encrypted password
      service: data.service || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    }

    const { data: insertedCredential, error } = await supabase
      .from("credentials")
      .insert([newCredential])
      .select()
      .single()

    if (error) {
      console.error("Failed to create credential:", error)
      return NextResponse.json({ error: "Failed to create credential" }, { status: 500 })
    }

    console.log(`✅ Credential created for ${userEmail}:`, {
      id: insertedCredential.id,
      service: insertedCredential.service,
      device_name: insertedCredential.device_name,
      username: insertedCredential.username,
      password: "[AES_ENCRYPTED]",
      encryption_status: "AES-256 encrypted - viewable when needed",
    })

    return NextResponse.json(insertedCredential, { status: 201 })
  } catch (error) {
    console.error("Failed to create credential:", error)
    return NextResponse.json({ error: "Failed to create credential" }, { status: 500 })
  }
}
