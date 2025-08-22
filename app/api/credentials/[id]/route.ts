import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { encryptPasswordIfNeeded } from "@/lib/encryption"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updatedCredential = {
      device_id: data.device_id || null,
      device_name: deviceName,
      username: data.username,
      password: encryptedPassword, // Store AES encrypted password
      service: data.service || null,
      notes: data.notes || null,
      last_updated: new Date().toISOString(),
    }

    const { data: credential, error } = await supabase
      .from("credentials")
      .update(updatedCredential)
      .eq("id", params.id)
      .eq("user_email", userEmail)
      .select()
      .single()

    if (error) {
      console.error("Failed to update credential:", error)
      return NextResponse.json({ error: "Failed to update credential" }, { status: 500 })
    }

    console.log(`✅ Credential updated for ${userEmail}:`, {
      id: credential.id,
      service: credential.service,
      encryption_status: "AES-256 encrypted - viewable",
    })

    return NextResponse.json(credential)
  } catch (error) {
    console.error("Failed to update credential:", error)
    return NextResponse.json({ error: "Failed to update credential" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    const { error } = await supabase.from("credentials").delete().eq("id", params.id).eq("user_email", userEmail)

    if (error) {
      console.error("Failed to delete credential:", error)
      return NextResponse.json({ error: "Failed to delete credential" }, { status: 500 })
    }

    console.log(`✅ Credential deleted for ${userEmail}:`, params.id)
    return NextResponse.json({ message: "Credential deleted successfully" })
  } catch (error) {
    console.error("Failed to delete credential:", error)
    return NextResponse.json({ error: "Failed to delete credential" }, { status: 500 })
  }
}
