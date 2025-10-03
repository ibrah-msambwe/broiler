import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Get all conversations for a user
    const { data: conversations, error } = await supabase
      .from("admin_messages")
      .select(`
        conversation_id,
        sender_id,
        receiver_id,
        message,
        created_at,
        read_at,
        sender:sender_id(name, email, role),
        receiver:receiver_id(name, email, role)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group messages by conversation_id and get the latest message for each
    const conversationMap = new Map()
    
    conversations?.forEach(msg => {
      const convId = msg.conversation_id
      if (!conversationMap.has(convId) || new Date(msg.created_at) > new Date(conversationMap.get(convId).created_at)) {
        conversationMap.set(convId, msg)
      }
    })

    // Convert to array and format
    const formattedConversations = Array.from(conversationMap.values()).map(conv => {
      const otherUser = conv.sender_id === userId ? conv.receiver : conv.sender
      const isUnread = conv.receiver_id === userId && !conv.read_at
      
      return {
        id: conv.conversation_id,
        otherUser: {
          id: otherUser?.id || (conv.sender_id === userId ? conv.receiver_id : conv.sender_id),
          name: otherUser?.name || "Unknown User",
          email: otherUser?.email || "",
          role: otherUser?.role || "user"
        },
        lastMessage: {
          id: conv.id,
          message: conv.message,
          created_at: conv.created_at,
          sender_id: conv.sender_id
        },
        unreadCount: isUnread ? 1 : 0,
        updated_at: conv.created_at
      }
    })

    // Sort by last message time
    formattedConversations.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    })
  } catch (e: any) {
    console.error("Error in conversations API:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { user1_id, user2_id } = body

    if (!user1_id || !user2_id) {
      return NextResponse.json({ 
        error: "user1_id and user2_id are required" 
      }, { status: 400 })
    }

    // Create conversation ID (always smaller ID first)
    const conversationId = `${Math.min(user1_id, user2_id)}_${Math.max(user1_id, user2_id)}`

    // Check if conversation already exists
    const { data: existingConv, error: checkError } = await supabase
      .from("admin_messages")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .limit(1)

    if (checkError) {
      console.error("Error checking conversation:", checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingConv && existingConv.length > 0) {
      return NextResponse.json({
        conversation_id: conversationId,
        exists: true
      })
    }

    // Create a welcome message to initialize the conversation
    const { data: welcomeMessage, error: messageError } = await supabase
      .from("admin_messages")
      .insert({
        sender_id: user1_id,
        receiver_id: user2_id,
        message: "Conversation started",
        message_type: "system",
        conversation_id: conversationId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (messageError) {
      console.error("Error creating welcome message:", messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    return NextResponse.json({
      conversation_id: conversationId,
      welcome_message: welcomeMessage,
      exists: false
    })
  } catch (e: any) {
    console.error("Error in conversations POST API:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
