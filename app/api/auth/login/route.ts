import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { encryptPasswordIfNeeded } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body exists
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ 
        error: "Invalid request format. Please provide valid JSON data." 
      }, { status: 400 })
    }

    const { email, password, securityAnswer } = body

    // This endpoint is deprecated - redirect to proper login
    return NextResponse.json({ 
      error: "This login endpoint is deprecated. Please use the main login page.",
      redirect: "/login"
    }, { status: 400 })

  } catch (error) {
    console.error("Login failed:", error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        error: "Invalid JSON format in request body" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Internal server error. Please try again later." 
    }, { status: 500 })
  }
}
