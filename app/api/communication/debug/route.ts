import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔍 Debugging communication system...")

    const debugInfo = {
      timestamp: new Date().toISOString(),
      tables: {},
      errors: [],
      recommendations: []
    }

    // Check communication_users table
    try {
      const { data: commUsers, error: commError } = await supabase
        .from("communication_users")
        .select("count")
        .limit(1)
      
      debugInfo.tables.communication_users = {
        exists: !commError,
        error: commError?.message || null,
        count: commUsers?.length || 0
      }
    } catch (e: any) {
      debugInfo.tables.communication_users = {
        exists: false,
        error: e.message,
        count: 0
      }
    }

    // Check profiles table
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1)
      
      debugInfo.tables.profiles = {
        exists: !profilesError,
        error: profilesError?.message || null,
        count: profiles?.length || 0
      }
    } catch (e: any) {
      debugInfo.tables.profiles = {
        exists: false,
        error: e.message,
        count: 0
      }
    }

    // Check batches table
    try {
      const { data: batches, error: batchesError } = await supabase
        .from("batches")
        .select("count")
        .limit(1)
      
      debugInfo.tables.batches = {
        exists: !batchesError,
        error: batchesError?.message || null,
        count: batches?.length || 0
      }
    } catch (e: any) {
      debugInfo.tables.batches = {
        exists: false,
        error: e.message,
        count: 0
      }
    }

    // Check conversations table
    try {
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("count")
        .limit(1)
      
      debugInfo.tables.conversations = {
        exists: !convError,
        error: convError?.message || null,
        count: conversations?.length || 0
      }
    } catch (e: any) {
      debugInfo.tables.conversations = {
        exists: false,
        error: e.message,
        count: 0
      }
    }

    // Check chart_messages table
    try {
      const { data: messages, error: msgError } = await supabase
        .from("chart_messages")
        .select("count")
        .limit(1)
      
      debugInfo.tables.chart_messages = {
        exists: !msgError,
        error: msgError?.message || null,
        count: messages?.length || 0
      }
    } catch (e: any) {
      debugInfo.tables.chart_messages = {
        exists: false,
        error: e.message,
        count: 0
      }
    }

    // Generate recommendations
    if (!debugInfo.tables.communication_users.exists) {
      debugInfo.recommendations.push("Create communication_users table for better user management")
    }

    if (!debugInfo.tables.conversations.exists) {
      debugInfo.recommendations.push("Create conversations table for chat functionality")
    }

    if (!debugInfo.tables.chart_messages.exists) {
      debugInfo.recommendations.push("Create chart_messages table for message storage")
    }

    if (debugInfo.tables.batches.exists && debugInfo.tables.batches.count > 0) {
      debugInfo.recommendations.push("Use batches table as primary user source (farmers and batch managers)")
    }

    if (debugInfo.tables.profiles.exists && debugInfo.tables.profiles.count > 0) {
      debugInfo.recommendations.push("Use profiles table as secondary user source")
    }

    // Test the users API
    try {
      const usersResponse = await fetch(`${request.nextUrl.origin}/api/communication/users`)
      const usersData = await usersResponse.json()
      
      debugInfo.usersApi = {
        status: usersResponse.status,
        success: usersResponse.ok,
        userCount: usersData.users?.length || 0,
        source: usersData.source || "unknown",
        error: usersData.error || null
      }
    } catch (e: any) {
      debugInfo.usersApi = {
        status: 500,
        success: false,
        userCount: 0,
        source: "error",
        error: e.message
      }
    }

    return NextResponse.json(debugInfo)

  } catch (error: any) {
    console.error("💥 Error in debug API:", error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()
  const { action } = body

  try {
    switch (action) {
      case "create_sample_users":
        // Create sample users in profiles table
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
            username: "Batch Manager 1",
            email: "batch1@broiler.com",
            role: "user"
          },
          {
            username: "Batch Manager 2",
            email: "batch2@broiler.com",
            role: "user"
          }
        ]

        const { data: insertedUsers, error: insertError } = await supabase
          .from("profiles")
          .insert(sampleUsers)
          .select()

        if (insertError) {
          return NextResponse.json({ 
            success: false, 
            error: insertError.message 
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: "Sample users created successfully",
          users: insertedUsers
        })

      case "test_conversation":
        // Test creating a conversation
        const { participant1Id, participant2Id, participant1Name, participant2Name } = body

        if (!participant1Id || !participant2Id || !participant1Name || !participant2Name) {
          return NextResponse.json({ 
            success: false, 
            error: "Missing participant information" 
          }, { status: 400 })
        }

        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            participant_1_id: participant1Id,
            participant_2_id: participant2Id,
            participant_1_name: participant1Name,
            participant_2_name: participant2Name
          })
          .select()
          .single()

        if (convError) {
          return NextResponse.json({ 
            success: false, 
            error: convError.message 
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: "Conversation created successfully",
          conversation
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: "Unknown action" 
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error("💥 Error in debug POST:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
