import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔧 Populating sample users for communication system...")

    // Check if communication_users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("communication_users")
      .select("id")
      .limit(1)

    if (tableError) {
      console.log("Communication_users table doesn't exist, creating sample data in profiles table instead")
      
      // Insert sample users into profiles table
      const sampleUsers = [
        {
          username: "Admin User",
          email: "admin@broiler.com",
          role: "admin"
        },
        {
          username: "John Farmer",
          email: "john@broiler.com", 
          role: "farmer"
        },
        {
          username: "Sarah Farmer",
          email: "sarah@broiler.com",
          role: "farmer"
        },
        {
          username: "Batch User 1",
          email: "batch1@broiler.com",
          role: "user"
        },
        {
          username: "Batch User 2", 
          email: "batch2@broiler.com",
          role: "user"
        },
        {
          username: "Regular User",
          email: "user@broiler.com",
          role: "user"
        }
      ]

      const { data: insertedUsers, error: insertError } = await supabase
        .from("profiles")
        .insert(sampleUsers)
        .select()

      if (insertError) {
        console.error("Error inserting sample users:", insertError)
        return NextResponse.json({ 
          success: false, 
          error: insertError.message 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Sample users created in profiles table",
        users: insertedUsers
      })
    }

    // If communication_users table exists, insert there
    const sampleCommUsers = [
      {
        user_id: "admin-1",
        name: "Admin User",
        email: "admin@broiler.com",
        role: "admin",
        is_online: true,
        status: "available"
      },
      {
        user_id: "farmer-1",
        name: "John Farmer", 
        email: "john@broiler.com",
        role: "farmer",
        is_online: true,
        status: "available"
      },
      {
        user_id: "farmer-2",
        name: "Sarah Farmer",
        email: "sarah@broiler.com", 
        role: "farmer",
        is_online: false,
        status: "offline"
      },
      {
        user_id: "user-1",
        name: "Batch User 1",
        email: "batch1@broiler.com",
        role: "batch_user",
        is_online: true,
        status: "available"
      },
      {
        user_id: "user-2",
        name: "Batch User 2",
        email: "batch2@broiler.com",
        role: "batch_user", 
        is_online: false,
        status: "offline"
      },
      {
        user_id: "user-3",
        name: "Regular User",
        email: "user@broiler.com",
        role: "user",
        is_online: true,
        status: "available"
      }
    ]

    const { data: insertedCommUsers, error: commInsertError } = await supabase
      .from("communication_users")
      .insert(sampleCommUsers)
      .select()

    if (commInsertError) {
      console.error("Error inserting sample communication users:", commInsertError)
      return NextResponse.json({ 
        success: false, 
        error: commInsertError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Sample users created in communication_users table",
      users: insertedCommUsers
    })

  } catch (error: any) {
    console.error("💥 Error populating sample users:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Sample Users Population API",
    description: "POST to this endpoint to create sample users for testing the communication system",
    usage: "POST /api/communication/populate-sample-users"
  })
}
