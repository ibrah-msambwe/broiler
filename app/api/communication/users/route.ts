import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔍 Fetching communication users...")

    // First, try to get users from the new communication_users table
    const { data: commUsers, error: commError } = await supabase
      .from("communication_users")
      .select("*")
      .eq("is_active", true)

    if (commUsers && commUsers.length > 0) {
      console.log(`✅ Found ${commUsers.length} users from communication_users table`)
      const formattedUsers = commUsers
        .filter(user => user.role === "admin" || user.role === "batch_user") // Only admin and batch users
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isOnline: user.is_online,
          lastSeen: user.last_seen,
          avatar: user.avatar_url,
          status: user.status
        }))

      const byRole = formattedUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return NextResponse.json({
        users: formattedUsers,
        byRole,
        total: formattedUsers.length
      })
    }

    // If no users in communication_users table, try to get from existing tables
    console.log("No users in communication_users table, trying existing tables...")

    // Try to get from profiles table first
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email, role, created_at")
      .limit(20)

    let allUsers: any[] = []

    if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} users from profiles table`)
      const profileUsers = profiles
        .filter(user => user.role === "admin" || user.role === "batch_user") // Only admin and batch users
        .map(user => ({
          id: user.id,
          name: user.username || "Unknown User",
          email: user.email || "",
          role: user.role || "user",
          isOnline: false,
          lastSeen: user.created_at,
          avatar: null,
          status: "offline",
          source: "profiles"
        }))
      allUsers = [...allUsers, ...profileUsers]
    }

    // Get batch users from batches table (only batch users, no farmers)
    const { data: batches, error: batchesError } = await supabase
      .from("batches")
      .select("id, name, farmer_name, username, password, status, created_at")
      .limit(20)

    if (batches && batches.length > 0) {
      console.log(`✅ Found ${batches.length} batches, creating batch users from batches table`)
      
      // Create batch users (people who manage each batch) - NO FARMERS
      const batchUsers = batches.map((batch, index) => ({
        id: `batch-user-${batch.id}`,
        name: `${batch.name} Manager`,
        email: `${batch.username || "batch"}@broiler.com`,
        role: "batch_user",
        isOnline: false,
        lastSeen: batch.created_at || new Date().toISOString(),
        avatar: null,
        status: "offline",
        batchId: batch.id,
        batchName: batch.name,
        source: "batches"
      }))

      allUsers = [...allUsers, ...batchUsers]
    }

    // If we have users from any source, return them
    if (allUsers.length > 0) {
      const byRole = allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const sources = [...new Set(allUsers.map(u => u.source))].join(", ")

      return NextResponse.json({
        users: allUsers,
        byRole,
        total: allUsers.length,
        source: sources
      })
    }

    // If no users found anywhere, return sample data for testing
    console.log("No users found in database, returning sample data for testing")
    const sampleUsers = [
      {
        id: "admin-1",
        name: "Admin User",
        email: "admin@broiler.com",
        role: "admin",
        isOnline: true,
        lastSeen: new Date().toISOString(),
        avatar: null,
        status: "available"
      },
      {
        id: "user-1",
        name: "Batch User 1",
        email: "batch1@broiler.com",
        role: "batch_user",
        isOnline: true,
        lastSeen: new Date().toISOString(),
        avatar: null,
        status: "available"
      },
      {
        id: "user-2",
        name: "Batch User 2",
        email: "batch2@broiler.com",
        role: "batch_user",
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000).toISOString(),
        avatar: null,
        status: "offline"
      },
      {
        id: "user-3",
        name: "Batch User 3",
        email: "batch3@broiler.com",
        role: "batch_user",
        isOnline: true,
        lastSeen: new Date().toISOString(),
        avatar: null,
        status: "available"
      }
    ]

    const byRole = sampleUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      users: sampleUsers,
      byRole,
      total: sampleUsers.length,
      note: "Using sample data - no users found in database"
    })

  } catch (error: any) {
    console.error("💥 Error fetching communication users:", error)
    return NextResponse.json({ 
      error: error.message,
      users: [],
      byRole: {},
      total: 0
    }, { status: 500 })
  }
}