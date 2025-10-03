import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Get all users for communication and management
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('type') // admin, farmer, batch_user, or all
    const includeInactive = searchParams.get('include_inactive') === 'true'

    let query = supabase
      .from('unified_users')
      .select(`
        id,
        user_type,
        name,
        email,
        phone,
        username,
        batch_id,
        batch_name,
        farmer_id,
        farmer_name,
        is_active,
        is_online,
        last_seen,
        status,
        avatar_url,
        address,
        notes,
        created_at,
        updated_at
      `)

    // Filter by user type if specified
    if (userType && userType !== 'all') {
      query = query.eq('user_type', userType)
    }

    // Filter active users unless specifically requested
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: users, error } = await query.order('user_type', { ascending: true }).order('name', { ascending: true })

    if (error) {
      console.error("Error fetching unified users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data for frontend
    const transformedUsers = users?.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      userType: user.user_type,
      batchId: user.batch_id,
      batchName: user.batch_name,
      farmerId: user.farmer_id,
      farmerName: user.farmer_name,
      isActive: user.is_active,
      isOnline: user.is_online,
      lastSeen: user.last_seen,
      status: user.status,
      avatarUrl: user.avatar_url,
      address: user.address,
      notes: user.notes,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      displayName: user.user_type === 'batch_user' && user.batch_name 
        ? `${user.name} (${user.batch_name})`
        : user.name
    })) || []

    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length,
      byType: {
        admin: transformedUsers.filter(u => u.userType === 'admin').length,
        farmer: transformedUsers.filter(u => u.userType === 'farmer').length,
        batch_user: transformedUsers.filter(u => u.userType === 'batch_user').length
      }
    })

  } catch (error: any) {
    console.error("Error in unified users API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const {
      userType,
      name,
      email,
      phone,
      passwordHash,
      username,
      batchId,
      farmerId,
      address,
      notes
    } = body

    // Validate required fields
    if (!userType || !name) {
      return NextResponse.json({ error: "userType and name are required" }, { status: 400 })
    }

    if (userType === 'batch_user' && !batchId) {
      return NextResponse.json({ error: "batchId is required for batch_user" }, { status: 400 })
    }

    // Use the database function to create user
    const { data: userId, error: createError } = await supabase.rpc('create_unified_user', {
      p_user_type: userType,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_password_hash: passwordHash,
      p_username: username,
      p_batch_id: batchId,
      p_farmer_id: farmerId
    })

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Update additional fields if provided
    if (address || notes) {
      const { error: updateError } = await supabase
        .from('unified_users')
        .update({ address, notes })
        .eq('id', userId)

      if (updateError) {
        console.error("Error updating user details:", updateError)
      }
    }

    // Get the created user
    const { data: newUser, error: fetchError } = await supabase
      .from('unified_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error("Error fetching created user:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        username: newUser.username,
        userType: newUser.user_type,
        batchId: newUser.batch_id,
        batchName: newUser.batch_name,
        farmerId: newUser.farmer_id,
        farmerName: newUser.farmer_name,
        isActive: newUser.is_active,
        isOnline: newUser.is_online,
        status: newUser.status,
        avatarUrl: newUser.avatar_url,
        address: newUser.address,
        notes: newUser.notes,
        createdAt: newUser.created_at
      }
    })

  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('unified_users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deactivate user (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('unified_users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error("Error deactivating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully"
    })

  } catch (error: any) {
    console.error("Error deactivating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
