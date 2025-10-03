import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const limit = parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("admin_messages")
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        created_at,
        read_at,
        sender:sender_id(name, email, role),
        receiver:receiver_id(name, email, role)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (conversationId) {
      // Get messages for a specific conversation
      query = query.or(`conversation_id.eq.${conversationId}`)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      messages: messages || [],
      total: messages?.length || 0
    })
  } catch (e: any) {
    console.error("Error in messages API:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    
    const {
      sender_id,
      receiver_id,
      message,
      message_type = "text",
      conversation_id
    } = body

    if (!sender_id || !receiver_id || !message) {
      return NextResponse.json({ 
        error: "sender_id, receiver_id, and message are required" 
      }, { status: 400 })
    }

    // Create the message
    const { data: newMessage, error } = await supabase
      .from("admin_messages")
      .insert({
        sender_id,
        receiver_id,
        message,
        message_type,
        conversation_id: conversation_id || `${Math.min(sender_id, receiver_id)}_${Math.max(sender_id, receiver_id)}`,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        message,
        message_type,
        created_at,
        conversation_id,
        sender:sender_id(name, email, role),
        receiver:receiver_id(name, email, role)
      `)
      .single()

    if (error) {
      console.error("Error creating message:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create a notification for the receiver
    await supabase
      .from("admin_notifications")
      .insert({
        user_id: receiver_id,
        type: "message",
        title: "New Message",
        message: `You have a new message from ${newMessage.sender?.name || newMessage.sender?.email}`,
        data: {
          message_id: newMessage.id,
          sender_id: sender_id,
          conversation_id: newMessage.conversation_id
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      message: newMessage,
      success: true
    })
  } catch (e: any) {
    console.error("Error in messages POST API:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { messageId, read_at } = body

    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 })
    }

    const { data: updatedMessage, error } = await supabase
      .from("admin_messages")
      .update({
        read_at: read_at || new Date().toISOString()
      })
      .eq("id", messageId)
      .select()
      .single()

    if (error) {
      console.error("Error updating message:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: updatedMessage,
      success: true
    })
  } catch (e: any) {
    console.error("Error in messages PUT API:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
