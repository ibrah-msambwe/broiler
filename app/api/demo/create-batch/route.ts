import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Create a demo batch for testing
    const demoBatch = {
      name: "Demo Batch 001",
      username: "demo001",
      password: "demo123",
      farmer_name: "Demo Farmer",
      start_date: new Date().toISOString().split('T')[0],
      bird_count: 500,
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("batches")
      .insert(demoBatch)
      .select()
      .single()
    
    if (error) {
      console.error("Failed to create demo batch:", error)
      return NextResponse.json({ 
        error: "Failed to create demo batch",
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Demo batch created successfully",
      batch: {
        username: data.username,
        password: data.password,
        name: data.name
      }
    })
    
  } catch (e: any) {
    console.error("Error creating demo batch:", e)
    return NextResponse.json({ 
      error: "Failed to create demo batch",
      details: e.message 
    }, { status: 500 })
  }
} 