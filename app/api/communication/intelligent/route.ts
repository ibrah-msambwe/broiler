import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()
  const { action, userId, conversationId, messageId } = body

  try {
    console.log(`🤖 Intelligent communication action: ${action}`)

    switch (action) {
      case "mark_all_read":
        // Mark all messages as read for a user
        const { error: markReadError } = await supabase
          .from("chart_messages")
          .update({ is_read: true })
          .eq("receiver_id", userId)
          .eq("is_read", false)

        if (markReadError) {
          console.error("Error marking messages as read:", markReadError)
          return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
        }

        // Update conversation unread counts
        const { data: conversations } = await supabase
          .from("conversations")
          .select("*")
          .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)

        if (conversations) {
          for (const conv of conversations) {
            const isParticipant1 = conv.participant_1_id === userId
            const unreadCount = isParticipant1 ? conv.unread_count_1 : conv.unread_count_2
            
            if (unreadCount > 0) {
              await supabase
                .from("conversations")
                .update({
                  unread_count_1: isParticipant1 ? 0 : conv.unread_count_1,
                  unread_count_2: isParticipant1 ? conv.unread_count_2 : 0
                })
                .eq("id", conv.id)
            }
          }
        }

        return NextResponse.json({ success: true, message: "All messages marked as read" })

      case "archive_conversation":
        // Archive a conversation
        const { error: archiveError } = await supabase
          .from("conversations")
          .update({ is_active: false })
          .eq("id", conversationId)

        if (archiveError) {
          console.error("Error archiving conversation:", archiveError)
          return NextResponse.json({ error: "Failed to archive conversation" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Conversation archived" })

      case "delete_message":
        // Delete a message (soft delete by marking as system message)
        const { error: deleteError } = await supabase
          .from("chart_messages")
          .update({ 
            message: "[Message deleted]",
            message_type: "system"
          })
          .eq("id", messageId)

        if (deleteError) {
          console.error("Error deleting message:", deleteError)
          return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Message deleted" })

      case "auto_respond":
        // Auto-respond to messages based on keywords
        const { message, senderId, receiverId } = body
        
        if (!message || !senderId || !receiverId) {
          return NextResponse.json({ error: "message, senderId, and receiverId are required" }, { status: 400 })
        }

        let autoResponse = ""
        const messageText = message.toLowerCase()

        // Intelligent auto-responses based on message content
        if (messageText.includes("help") || messageText.includes("support")) {
          autoResponse = "I'm here to help! Please describe your issue and I'll assist you as soon as possible."
        } else if (messageText.includes("report") || messageText.includes("submit")) {
          autoResponse = "Thank you for your report. It has been received and will be reviewed by our team."
        } else if (messageText.includes("urgent") || messageText.includes("emergency")) {
          autoResponse = "URGENT: Your message has been flagged as urgent and forwarded to the admin team immediately."
        } else if (messageText.includes("batch") || messageText.includes("chick")) {
          autoResponse = "I understand you're asking about batch management. Please provide more details about your specific concern."
        } else if (messageText.includes("thank") || messageText.includes("thanks")) {
          autoResponse = "You're welcome! I'm glad I could help. Feel free to reach out anytime."
        }

        if (autoResponse) {
          // Send auto-response
          const { error: autoResponseError } = await supabase
            .from("chart_messages")
            .insert({
              sender_id: "system",
              receiver_id: senderId,
              sender_name: "System Assistant",
              receiver_name: "User",
              message: autoResponse,
              message_type: "system",
              conversation_id: conversationId,
              is_read: false,
              is_admin_message: false
            })

          if (autoResponseError) {
            console.error("Error sending auto-response:", autoResponseError)
            return NextResponse.json({ error: "Failed to send auto-response" }, { status: 500 })
          }

          return NextResponse.json({ 
            success: true, 
            message: "Auto-response sent",
            response: autoResponse
          })
        }

        return NextResponse.json({ success: true, message: "No auto-response needed" })

      case "cleanup_old_messages":
        // Clean up messages older than 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { error: cleanupError } = await supabase
          .from("chart_messages")
          .update({ 
            message: "[Message archived - older than 30 days]",
            message_type: "system"
          })
          .lt("created_at", thirtyDaysAgo.toISOString())
          .neq("message_type", "system")

        if (cleanupError) {
          console.error("Error cleaning up old messages:", cleanupError)
          return NextResponse.json({ error: "Failed to cleanup old messages" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Old messages cleaned up" })

      case "get_conversation_stats":
        // Get conversation statistics for a user
        const { data: userConversations } = await supabase
          .from("conversations")
          .select("*")
          .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)

        const { data: userMessages } = await supabase
          .from("chart_messages")
          .select("*")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

        const stats = {
          totalConversations: userConversations?.length || 0,
          activeConversations: userConversations?.filter(c => c.is_active).length || 0,
          totalMessages: userMessages?.length || 0,
          unreadMessages: userMessages?.filter(m => m.receiver_id === userId && !m.is_read).length || 0,
          sentMessages: userMessages?.filter(m => m.sender_id === userId).length || 0,
          receivedMessages: userMessages?.filter(m => m.receiver_id === userId).length || 0
        }

        return NextResponse.json({ success: true, stats })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

  } catch (error: any) {
    console.error("Error in intelligent communication:", error)
    return NextResponse.json({ 
      error: "Intelligent communication failed",
      details: error.message 
    }, { status: 500 })
  }
}
