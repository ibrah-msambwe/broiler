import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { encryptPasswordIfNeeded } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const { email, password, securityAnswer } = await request.json()
    const supabase = createServerSupabaseClient()

    // Validate security answer first
    if (securityAnswer.toUpperCase() !== "KIBOKO") {
      return NextResponse.json({ error: "Incorrect security answer" }, { status: 401 })
    }

    // Validate credentials
    if (email !== "ibrahim8msambwe@gmail.com" || password !== "Msambwe@4687") {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user exists in database, if not create them
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            email: email,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            settings: {
              autoBackup: true,
              backupFrequency: "daily",
              securityLevel: "high",
              passwordEncryption: "AES-256",
              viewablePasswords: true,
            },
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Failed to create user:", createError)
        return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
      }

      // Create default encrypted credentials for new user
      try {
        const defaultCredentials = [
          {
            user_email: email,
            device_name: "Gmail Account",
            username: email,
            password: encryptPasswordIfNeeded(password), // AES encrypted
            service: "Email Account",
            notes: "Primary email account credentials - AES encrypted and viewable",
          },
        ]

        await supabase.from("credentials").insert(defaultCredentials)
        console.log(`✅ Default AES encrypted credentials created for new user: ${email}`)
      } catch (credError) {
        console.error("Failed to create default credentials:", credError)
      }

      console.log(`✅ New user created with AES encryption: ${email}`)
    } else {
      // Update last login for existing user
      const { error: updateError } = await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("email", email)

      if (updateError) {
        console.error("Failed to update last login:", updateError)
      }
    }

    // Return user data (without role field)
    const user = {
      id: existingUser?.id || "new-user",
      email: email,
      last_login: new Date().toISOString(),
      encryption_enabled: true,
      encryption_type: "AES-256",
      viewable_passwords: true,
    }

    console.log(`✅ Successful login for ${email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      user: user,
      message: "Login successful - Data synced from Supabase with AES-256 encryption",
      data_accessible: true,
      cross_device_access: true,
      encryption_status: "AES-256 enabled - passwords viewable when needed",
      database_status: "Supabase connected and operational",
    })
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
