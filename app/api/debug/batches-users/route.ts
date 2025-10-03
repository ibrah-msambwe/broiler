import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching real users from batches table...")
    
    // Fetch from batches table
    const { data: batchesData, error: batchesError } = await supabase
      .from("batches")
      .select("id, farmer_name, username, created_at, name, code")
      .order("created_at", { ascending: false })

    if (batchesError) {
      console.error("❌ Batches table error:", batchesError)
      return NextResponse.json({
        success: false,
        error: batchesError.message,
        users: []
      })
    }

    console.log("✅ Batches query successful")
    console.log("📊 Raw batches data:", batchesData)
    console.log("📊 Batches count:", batchesData?.length || 0)

    // Process users from batches
    const usersFromBatches = batchesData
      ?.filter(batch => (batch.farmer_name || batch.username))
      .map(batch => ({
        id: batch.username || `batch-${batch.id}`,
        name: batch.farmer_name || batch.username || `Batch ${batch.id}`,
        email: `${batch.username || `batch-${batch.id}`}@example.com`,
        role: "batch_user" as const,
        created_at: batch.created_at,
        isOnline: Math.random() > 0.3,
        lastSeen: Math.random() > 0.5 ? "2m ago" : "Online",
        unreadCount: Math.floor(Math.random() * 5)
      })) || []

    console.log("✅ Processed users from batches:", usersFromBatches.length)
    console.log("📊 Processed users:", usersFromBatches)

    return NextResponse.json({
      success: true,
      users: usersFromBatches,
      totalBatches: batchesData?.length || 0,
      processedUsers: usersFromBatches.length
    })

  } catch (error) {
    console.error("❌ Error fetching batches users:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      users: []
    })
  }
}
