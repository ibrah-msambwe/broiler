import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔍 Fetching batch users from batches table...")

    // Get all batches from the batches table
    const { data: batches, error } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching batches:", error)
      return NextResponse.json({ 
        error: error.message,
        users: [],
        total: 0
      }, { status: 500 })
    }

    if (!batches || batches.length === 0) {
      console.log("📋 No batches found in database")
      return NextResponse.json({
        users: [],
        total: 0,
        message: "No batches found in database"
      })
    }

    // Transform batches into communication users
    const batchUsers = batches.map((batch) => ({
      id: `batch-${batch.id}`,
      batchId: batch.id,
      name: `${batch.farmer_name} (${batch.name})`,
      email: `${batch.username || batch.farmer_name.toLowerCase().replace(/\s+/g, '.')}@broiler.com`,
      role: "batch_user",
      farmerName: batch.farmer_name,
      batchName: batch.name,
      username: batch.username,
      status: batch.status || "active",
      isOnline: false, // Will be updated based on recent activity
      lastSeen: batch.created_at || new Date().toISOString(),
      avatar: null,
      location: batch.location || "Unknown",
      phone: batch.phone || "Not provided"
    }))

    // Add admin user
    const adminUser = {
      id: "admin-tariq",
      name: "Tariq (Admin)",
      email: "admin@tariqbroiler.com",
      role: "admin",
      isOnline: true,
      lastSeen: new Date().toISOString(),
      avatar: null,
      status: "available"
    }

    const allUsers = [adminUser, ...batchUsers]

    console.log(`✅ Found ${batches.length} batches, created ${allUsers.length} communication users`)

    return NextResponse.json({
      users: allUsers,
      batchUsers: batchUsers,
      admin: adminUser,
      total: allUsers.length,
      batchCount: batches.length
    })

  } catch (error: any) {
    console.error("💥 Error fetching batch users:", error)
    return NextResponse.json({ 
      error: error.message,
      users: [],
      total: 0
    }, { status: 500 })
  }
}
