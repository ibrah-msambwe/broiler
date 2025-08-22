import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, securityAnswer } = await request.json()

    // Validate admin credentials (only admin@tariqbroiler.com)
    if (email !== "admin@tariqbroiler.com" || password !== "admin123") {
      return NextResponse.json({ error: "Invalid administrator credentials" }, { status: 401 })
    }

    // Validate security answer
    if (securityAnswer.toUpperCase() !== "KIBOKO") {
      return NextResponse.json({ error: "Incorrect security answer" }, { status: 401 })
    }

    // Return admin user data
    const admin = {
      id: "admin-1",
      email: email,
      role: "admin",
      name: "Admin User",
      last_login: new Date().toISOString(),
      permissions: ["read_all", "write_all", "delete_all", "export_all", "manage_users"],
    }

    console.log(`✅ Administrator login successful: ${email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      user: admin,
      message: "Administrator login successful",
      access_level: "full_system_access",
    })
  } catch (error) {
    console.error("Admin login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
