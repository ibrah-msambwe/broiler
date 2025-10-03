import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Create a test batch for login testing
    const testBatch = {
      name: "Test Batch 001",
      username: "test001",
      password: "test123",
      farmer_name: "Test Farmer",
      start_date: new Date().toISOString().split('T')[0],
      bird_count: 100,
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("batches")
      .insert(testBatch)
      .select()
      .single()
    
    if (error) {
      console.error("Failed to create test batch:", error)
      return NextResponse.json({ 
        error: "Failed to create test batch",
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Test batch created successfully",
      batch: {
        id: data.id,
        username: data.username,
        password: data.password,
        name: data.name
      }
    })
    
  } catch (e: any) {
    console.error("Error creating test batch:", e)
    return NextResponse.json({ 
      error: "Failed to create test batch",
      details: e.message 
    }, { status: 500 })
  }
}

