import { type NextRequest, NextResponse } from "next/server"

// Data recovery endpoint for accessing data from any device
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // This endpoint is deprecated - no demo credentials allowed
    return NextResponse.json({ 
      error: "Data recovery is deprecated. Please contact administrator for assistance." 
    }, { status: 400 })


  } catch (error) {
    console.error("Data recovery failed:", error)
    return NextResponse.json({ error: "Failed to recover data" }, { status: 500 })
  }
}
