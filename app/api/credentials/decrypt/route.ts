import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { decryptPassword } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const { credentialId } = await request.json()
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    // Get the credential
    const { data: credential, error } = await supabase
      .from("credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("user_email", userEmail)
      .single()

    if (error || !credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 })
    }

    // Decrypt the password
    const decryptedPassword = decryptPassword(credential.password)

    return NextResponse.json({
      id: credential.id,
      username: credential.username,
      password: decryptedPassword, // Return actual decrypted password
      service: credential.service,
      notes: credential.notes,
      device_name: credential.device_name,
      encryption_info: {
        type: "AES-256",
        message: "Password successfully decrypted and viewable",
        status: "decrypted",
      },
    })
  } catch (error) {
    console.error("Failed to decrypt credential:", error)
    return NextResponse.json(
      {
        error: "Failed to decrypt credential",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
