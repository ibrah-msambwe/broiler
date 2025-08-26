import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { encryptPasswordIfNeeded } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const { email, password, securityAnswer } = await request.json()
    const supabase = createServerSupabaseClient()

    // This endpoint is deprecated - no demo credentials allowed
    return NextResponse.json({ 
      error: "Login is deprecated. Please use the main login page." 
    }, { status: 400 })


  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
