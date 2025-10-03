import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get all users from the auth.users table and their profiles
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        role,
        name,
        created_at,
        last_login,
        is_active
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also get farmers for messaging
    const { data: farmers, error: farmersError } = await supabase
      .from("farmers")
      .select(`
        id,
        name,
        email,
        phone,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (farmersError) {
      console.error("Error fetching farmers:", farmersError)
    }

    // Combine users and farmers for messaging
    const allUsers = [
      ...(users || []).map(user => ({
        ...user,
        type: "user",
        displayName: user.name || user.email,
        avatar: null
      })),
      ...(farmers || []).map(farmer => ({
        id: farmer.id,
        email: farmer.email,
        name: farmer.name,
        phone: farmer.phone,
        role: "farmer",
        type: "farmer",
        displayName: farmer.name || farmer.email,
        avatar: null,
        created_at: farmer.created_at,
        last_login: null,
        is_active: true
      }))
    ]

    return NextResponse.json({
      users: allUsers,
      total: allUsers.length
    })
  } catch (e: any) {
    console.error("Error in users API:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}