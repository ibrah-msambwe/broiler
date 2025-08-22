import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    const supabase = createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user - only using fields that exist in the database
    const userData = {
      email: email,
      password: password, // In production, this should be hashed
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      settings: {
        autoBackup: true,
        backupFrequency: "daily",
        securityLevel: "high",
        passwordEncryption: "AES-256",
        viewablePasswords: true,
      },
    }

    const { data: newUser, error: createError } = await supabase.from("users").insert([userData]).select().single()

    if (createError) {
      console.error("Failed to create user:", createError)
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    // Return user data (excluding password)
    const user = {
      id: newUser.id,
      email: newUser.email,
      created_at: newUser.created_at,
      last_login: newUser.last_login,
    }

    console.log(`✅ New user registered: ${email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      user: user,
      message: "Registration successful",
      welcome_message: `Welcome to SecureVault Pro!`,
    })
  } catch (error) {
    console.error("User registration failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
