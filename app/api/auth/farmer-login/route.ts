import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Demo farmer credentials
    const validCredentials = [
      { email: "farmer@tariqbroiler.com", password: "farmer123", name: "John Farmer" },
      { email: "farmer1@tariqbroiler.com", password: "farmer123", name: "Ahmed Hassan" },
      { email: "farmer2@tariqbroiler.com", password: "farmer123", name: "Sarah Mohamed" },
    ]

    // Find matching credentials
    const farmer = validCredentials.find((cred) => cred.email === email && cred.password === password)

    if (!farmer) {
      return NextResponse.json({ error: "Invalid farmer credentials" }, { status: 401 })
    }

    // Return farmer user data
    const farmerUser = {
      id: `farmer-${Date.now()}`,
      email: farmer.email,
      name: farmer.name,
      role: "farmer",
      last_login: new Date().toISOString(),
      permissions: ["view_own_batches", "manage_own_batches", "view_reports"],
    }

    console.log(`✅ Farmer login successful: ${email} at ${new Date().toISOString()}`)

    return NextResponse.json({
      user: farmerUser,
      message: "Farmer login successful",
      access_level: "farmer_access",
    })
  } catch (error) {
    console.error("Farmer login failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
