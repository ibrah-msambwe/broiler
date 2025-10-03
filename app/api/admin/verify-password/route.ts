import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({
        valid: false,
        error: "Password is required"
      }, { status: 400 })
    }

    // Get admin credentials from environment or hardcoded
    // In production, this should check against database
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "A1B2C3"
    
    // Alternative: Check against multiple admin passwords
    const VALID_ADMIN_PASSWORDS = [
      process.env.ADMIN_PASSWORD || "A1B2C3",
      "A1B2C3",      // Tariq's actual admin password
      "tariq123",
      "admin123",
      "tariq"
    ]

    // Verify password
    const isValid = VALID_ADMIN_PASSWORDS.includes(password)

    if (isValid) {
      console.log("✅ Admin password verified successfully")
      return NextResponse.json({
        valid: true,
        message: "Password verified"
      })
    } else {
      console.log("❌ Invalid admin password attempt")
      return NextResponse.json({
        valid: false,
        error: "Invalid password"
      }, { status: 401 })
    }

  } catch (error: any) {
    console.error("❌ Error verifying password:", error)
    return NextResponse.json({
      valid: false,
      error: error.message || "Failed to verify password"
    }, { status: 500 })
  }
}

