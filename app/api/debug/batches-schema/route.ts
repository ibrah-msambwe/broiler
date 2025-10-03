import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking batches table schema...")
    
    // First, let's see what columns exist by selecting all data
    const { data: batchesData, error: batchesError } = await supabase
      .from("batches")
      .select("*")
      .limit(5)

    if (batchesError) {
      console.error("❌ Batches table error:", batchesError)
      return NextResponse.json({
        success: false,
        error: batchesError.message,
        schema: null
      })
    }

    console.log("✅ Batches query successful")
    console.log("📊 Sample batches data:", batchesData)

    // Get column names from the first record
    const columnNames = batchesData && batchesData.length > 0 
      ? Object.keys(batchesData[0])
      : []

    return NextResponse.json({
      success: true,
      schema: columnNames,
      sampleData: batchesData,
      totalRecords: batchesData?.length || 0
    })

  } catch (error) {
    console.error("❌ Error checking batches schema:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      schema: null
    })
  }
}
