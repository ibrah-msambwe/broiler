import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Debug route to check what batches exist
export async function GET() {
  try {
    console.log("🔍 Checking all batches in database...")
    
    const { data: batches, error } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching batches:", error)
      return NextResponse.json({ 
        error: error.message,
        batches: []
      }, { status: 500 })
    }

    console.log(`✅ Found ${batches?.length || 0} batches`)
    
    return NextResponse.json({ 
      success: true,
      count: batches?.length || 0,
      batches: batches || [],
      message: `Found ${batches?.length || 0} batches in database`
    })

  } catch (error: any) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({ 
      error: error.message,
      batches: []
    }, { status: 500 })
  }
}

