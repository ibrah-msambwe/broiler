import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()
  const { senderId, senderName, message, messageType = "text", isAdmin = false, batchId } = body

  if (!senderId || !senderName || !message) {
    return NextResponse.json({ error: "senderId, senderName, and message are required" }, { status: 400 })
  }

  try {
    console.log(`📢 Sending group message from ${senderName} (${senderId})`)

    // Fetch all active users
    const [farmersResult, adminsResult, usersResult] = await Promise.all([
      supabase
        .from("farmers")
        .select("id, name, email")
        .eq("is_active", true),
      supabase
        .from("users")
        .select("id, name, email, role")
        .eq("is_active", true)
    ])

    const allUsers = [
      ...(farmersResult.data || []),
      ...(adminsResult.data || []),
      ...(usersResult.data || [])
    ]

    // Remove duplicates
    const uniqueUsers = allUsers.reduce((acc, user) => {
      const existingUser = acc.find(u => u.email === user.email)
      if (!existingUser) {
        acc.push(user)
      }
      return acc
    }, [] as any[])

    // Create group conversation if it doesn't exist
    let groupConversationId: string | null = null
    
    // Check if group conversation exists
    const { data: existingGroup } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_1_id", "group")
      .eq("participant_2_id", "all")
      .single()

    if (existingGroup) {
      groupConversationId = existingGroup.id
    } else {
      // Create group conversation
      const { data: newGroup, error: groupError } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: "group",
          participant_2_id: "all",
          participant_1_name: "System",
          participant_2_name: "All Users",
          last_message: message,
          last_message_at: new Date().toISOString(),
          is_active: true
        })
        .select("id")
        .single()

      if (groupError) {
        console.error("Error creating group conversation:", groupError)
        return NextResponse.json({ error: "Failed to create group conversation" }, { status: 500 })
      }

      groupConversationId = newGroup.id
    }

    // Send message to each user
    const messagePromises = uniqueUsers.map(async (user) => {
      if (user.id === senderId) return null // Don't send to self

      try {
        // Create individual conversation if it doesn't exist
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .or(`and(participant_1_id.eq.${senderId},participant_2_id.eq.${user.id}),and(participant_1_id.eq.${user.id},participant_2_id.eq.${senderId})`)
          .single()

        let conversationId = existingConv?.id

        if (!conversationId) {
          // Create new conversation
          const { data: newConv, error: convError } = await supabase
            .from("conversations")
            .insert({
              participant_1_id: senderId,
              participant_2_id: user.id,
              participant_1_name: senderName,
              participant_2_name: user.name || "User",
              last_message: message,
              last_message_at: new Date().toISOString(),
              is_active: true
            })
            .select("id")
            .single()

          if (convError) {
            console.error(`Error creating conversation with ${user.name}:`, convError)
            return null
          }

          conversationId = newConv.id
        }

        // Send the message
        const { error: messageError } = await supabase
          .from("chart_messages")
          .insert({
            sender_id: senderId,
            receiver_id: user.id,
            sender_name: senderName,
            receiver_name: user.name || "User",
            message: `[GROUP MESSAGE] ${message}`,
            message_type: messageType,
            conversation_id: conversationId,
            is_read: false,
            is_admin_message: isAdmin,
            batch_id: batchId
          })

        if (messageError) {
          console.error(`Error sending message to ${user.name}:`, messageError)
          return null
        }

        return { userId: user.id, userName: user.name, success: true }
      } catch (error) {
        console.error(`Error processing message for ${user.name}:`, error)
        return { userId: user.id, userName: user.name, success: false, error }
      }
    })

    const results = await Promise.all(messagePromises)
    const successful = results.filter(r => r && r.success)
    const failed = results.filter(r => r && !r.success)

    console.log(`✅ Group message sent: ${successful.length} successful, ${failed.length} failed`)

    // Create admin notification for group message
    try {
      await supabase.from("admin_notifications").insert({
        type: "group_message",
        title: "Group Message Sent",
        message: `${senderName} sent a group message to ${successful.length} users`,
        priority: "Normal",
        status: "unread",
        created_at: new Date().toISOString()
      })
    } catch (notifError) {
      console.warn("Failed to create admin notification:", notifError)
    }

    return NextResponse.json({
      success: true,
      message: "Group message sent successfully",
      stats: {
        totalUsers: uniqueUsers.length,
        successful: successful.length,
        failed: failed.length,
        skipped: 1 // sender
      },
      results: {
        successful: successful.map(r => ({ userId: r.userId, userName: r.userName })),
        failed: failed.map(r => ({ userId: r.userId, userName: r.userName, error: r.error }))
      }
    })

  } catch (error: any) {
    console.error("Error sending group message:", error)
    return NextResponse.json({ 
      error: "Failed to send group message",
      details: error.message 
    }, { status: 500 })
  }
}
