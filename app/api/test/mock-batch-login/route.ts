import { NextResponse } from "next/server"

// Mock batch data for testing
const mockBatches = [
  {
    id: "mock-batch-001",
    name: "Mock Test Batch",
    username: "test001",
    password: "test123",
    farmer_name: "Test Farmer",
    start_date: "2024-01-01",
    bird_count: 100,
    status: "Active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-batch-002", 
    name: "Demo Batch",
    username: "demo001",
    password: "demo123",
    farmer_name: "Demo Farmer",
    start_date: "2024-01-01",
    bird_count: 500,
    status: "Active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log(`🔍 Mock batch login attempt: ${username}`)

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json({ 
        error: "Both username and password are required" 
      }, { status: 400 })
    }

    // Find matching batch
    const batch = mockBatches.find(
      b => b.username === username && b.password === password
    )

    if (!batch) {
      console.log(`❌ No mock batch found for username: ${username}`)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log(`✅ Mock login successful for batch: ${batch.name}`)

    return NextResponse.json({
      user: { 
        role: "batch", 
        username: batch.username, 
        email: null, 
        id: batch.id,
        batchId: batch.id
      },
      batchId: batch.id,
      batch,
    })

  } catch (e: any) {
    console.error("❌ Error in mock batch login:", e)
    return NextResponse.json({ 
      error: "Server error. Please try again later.",
      details: String(e?.message || e)
    }, { status: 500 })
  }
}

