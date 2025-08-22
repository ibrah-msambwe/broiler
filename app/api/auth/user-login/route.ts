import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const supabase = createServerSupabaseClient()

    // Check if user exists in database
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !existingUser) {
      return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 })
    }

    // Validate password (in real app, this would be hashed)
    if (existingUser.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Update last login
    const { error: updateError } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("email", email)

    if (updateError) {
      console.error("Failed to update last login:", updateError)
    }

    // Return user data (excluding password and role)
    const user = {
      id: existingUser.id,
      email: existingUser.email,
      created_at: existingUser.created_at,
      last_login: new Date().toISOString(),
    }

    console.log(`✅ User login successful: ${email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      user: user,
      message: "Login successful",
      access_level: "user_data_only",
    })
  } catch (error) {
    console.error("User login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
