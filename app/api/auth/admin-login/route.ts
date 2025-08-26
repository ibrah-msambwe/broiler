import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, securityAnswer } = await request.json()

    // This endpoint is deprecated - use Supabase auth instead
    return NextResponse.json({ 
      error: "Admin login is deprecated. Please use the main admin login page." 
    }, { status: 400 })


  } catch (error) {
    console.error("Admin login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
