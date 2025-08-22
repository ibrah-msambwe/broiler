import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { decryptPassword, isBcryptHash } from "@/lib/encryption"

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

    // Decrypt passwords for admin view
    const credentialsWithDecrypted = credentials?.map((credential) => {
      let decryptedPassword = "••••••••"

      try {
        if (isBcryptHash(credential.password)) {
          decryptedPassword = "[BCRYPT HASH - CANNOT DECRYPT]"
        } else {
          decryptedPassword = decryptPassword(credential.password)
        }
      } catch (error) {
        console.error(`Failed to decrypt password for credential ${credential.id}:`, error)
        decryptedPassword = "[DECRYPTION FAILED]"
      }

      return {
        ...credential,
        decrypted_password: decryptedPassword,
      }
    })

    console.log(`✅ Admin fetched ${credentialsWithDecrypted?.length || 0} credentials from all users`)

    return NextResponse.json(credentialsWithDecrypted || [])
  } catch (error) {
    console.error("Failed to get all credentials:", error)
    return NextResponse.json({ error: "Failed to get all credentials" }, { status: 500 })
  }
}
