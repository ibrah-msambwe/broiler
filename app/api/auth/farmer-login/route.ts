import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // This endpoint is deprecated - farmers should use batch login instead
    return NextResponse.json({ 
      error: "Farmer login is deprecated. Please use batch login with your batch credentials." 
    }, { status: 400 })


  } catch (error) {
    console.error("Farmer login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
