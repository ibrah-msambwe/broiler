import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { isBcryptHash } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    // Get all credentials
    const { data: credentials, error } = await supabase.from("credentials").select("*").eq("user_email", userEmail)

    if (error) {
      console.error("Failed to fetch credentials for migration:", error)
      return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
    }

    // Find bcrypt hashed passwords
    const bcryptCredentials = credentials?.filter((cred) => isBcryptHash(cred.password)) || []

    if (bcryptCredentials.length === 0) {
      return NextResponse.json({ message: "No bcrypt credentials found to migrate" })
    }

    // For each bcrypt credential, update with a placeholder to indicate it needs a new password
    const updates = bcryptCredentials.map(async (credential) => {
      const { error: updateError } = await supabase
        .from("credentials")
        .update({
          password: "[MIGRATION NEEDED - PLEASE UPDATE PASSWORD]",
          notes: `${credential.notes || ""}\n\n[MIGRATION NOTICE: This credential was using bcrypt encryption. Please update the password to enable viewing.]`,
          last_updated: new Date().toISOString(),
        })
        .eq("id", credential.id)
        .eq("user_email", userEmail)

      if (updateError) {
        console.error(`Failed to update credential ${credential.id}:`, updateError)
        return { id: credential.id, success: false, error: updateError }
      }

      return { id: credential.id, success: true }
    })

    await Promise.all(updates)

    return NextResponse.json({
      message: `Migration initiated for ${bcryptCredentials.length} credentials. Please update their passwords.`,
      migratedCount: bcryptCredentials.length,
    })
  } catch (error) {
    console.error("Migration failed:", error)
    return NextResponse.json({ error: "Failed to migrate credentials" }, { status: 500 })
  }
}
