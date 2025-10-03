import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Get all user activities
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("📊 Fetching user activities...")

    // Get all user activities ordered by latest first
    const { data: activities, error } = await supabase
      .from("user_activities")
      .select("*")
      .order("last_seen", { ascending: false })

    if (error) {
      console.error("❌ Error fetching user activities:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ User activities fetched:", activities?.length || 0)
    return NextResponse.json({ 
      activities: activities || [],
      success: true,
      count: activities?.length || 0
    })

  } catch (error: any) {
    console.error("💥 Unexpected error fetching user activities:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create or update user activity
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { 
      userId, 
      userName, 
      userType, 
      batchId, 
      batchName, 
      action, 
      ipAddress, 
      userAgent,
      isOnline 
    } = body || {}

    if (!userId || !userName) {
      return NextResponse.json({ 
        error: "Missing required fields: userId and userName" 
      }, { status: 400 })
    }

    console.log("📝 Recording user activity:", { userId, userName, action, isOnline })

    // Check if user activity already exists
    const { data: existingActivity, error: fetchError } = await supabase
      .from("user_activities")
      .select("*")
      .eq("user_id", userId)
      .single()

    const now = new Date().toISOString()

    if (existingActivity) {
      // Update existing activity
      const { data, error } = await supabase
        .from("user_activities")
        .update({
          user_name: userName,
          user_type: userType || existingActivity.user_type,
          batch_id: batchId || existingActivity.batch_id,
          batch_name: batchName || existingActivity.batch_name,
          last_action: action || existingActivity.last_action,
          last_seen: now,
          ip_address: ipAddress || existingActivity.ip_address,
          user_agent: userAgent || existingActivity.user_agent,
          is_online: isOnline !== undefined ? isOnline : existingActivity.is_online,
          updated_at: now
        })
        .eq("user_id", userId)
        .select("*")
        .single()

      if (error) {
        console.error("❌ Error updating user activity:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("✅ User activity updated:", data)
      return NextResponse.json({ 
        success: true, 
        activity: data,
        message: "User activity updated successfully"
      })
    } else {
      // Create new activity
      const { data, error } = await supabase
        .from("user_activities")
        .insert({
          user_id: userId,
          user_name: userName,
          user_type: userType || "user",
          batch_id: batchId || null,
          batch_name: batchName || null,
          last_action: action || "login",
          last_seen: now,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
          is_online: isOnline !== undefined ? isOnline : true,
          created_at: now,
          updated_at: now
        })
        .select("*")
        .single()

      if (error) {
        console.error("❌ Error creating user activity:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log("✅ User activity created:", data)
      return NextResponse.json({ 
        success: true, 
        activity: data,
        message: "User activity created successfully"
      })
    }

  } catch (error: any) {
    console.error("💥 Unexpected error recording user activity:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user online status
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { userId, isOnline, lastAction } = body || {}

    if (!userId) {
      return NextResponse.json({ 
        error: "Missing required field: userId" 
      }, { status: 400 })
    }

    console.log("🔄 Updating user status:", { userId, isOnline, lastAction })

    const { data, error } = await supabase
      .from("user_activities")
      .update({
        is_online: isOnline,
        last_action: lastAction || "status_update",
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .select("*")
      .single()

    if (error) {
      console.error("❌ Error updating user status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ User status updated:", data)
    return NextResponse.json({ 
      success: true, 
      activity: data,
      message: "User status updated successfully"
    })

  } catch (error: any) {
    console.error("💥 Unexpected error updating user status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove user activity (when user logs out)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ 
        error: "Missing required parameter: userId" 
      }, { status: 400 })
    }

    console.log("🗑️ Removing user activity:", userId)

    const { error } = await supabase
      .from("user_activities")
      .delete()
      .eq("user_id", userId)

    if (error) {
      console.error("❌ Error removing user activity:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ User activity removed:", userId)
    return NextResponse.json({ 
      success: true,
      message: "User activity removed successfully"
    })

  } catch (error: any) {
    console.error("💥 Unexpected error removing user activity:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
