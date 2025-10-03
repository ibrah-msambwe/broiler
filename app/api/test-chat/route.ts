import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log("🧪 Testing chat system...")
  
  try {
    const body = await request.json()
    const { senderId, receiverId, senderName, receiverName, message } = body

    console.log("📥 Received data:", { senderId, receiverId, senderName, receiverName, messageLength: message?.length })

    // Direct insert - no checks, no retries, just try it
    const { data, error } = await supabase
      .from("chart_messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        sender_name: senderName,
        receiver_name: receiverName,
        message: message,
        message_type: "text",
        is_read: false,
        is_admin_message: false
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Insert failed:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error details:", error.details)
      console.error("Error hint:", error.hint)
      
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        fullError: JSON.stringify(error, null, 2)
      }, { status: 500 })
    }

    console.log("✅ Message inserted successfully:", data.id)
    
    return NextResponse.json({
      success: true,
      message: data
    })

  } catch (error: any) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log("🧪 Testing table access...")
  
  try {
    // Try to read from the table
    const { data, error, count } = await supabase
      .from("chart_messages")
      .select("*", { count: 'exact' })
      .limit(5)

    if (error) {
      console.error("❌ Read failed:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details
      }, { status: 500 })
    }

    console.log("✅ Table read successful")
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      messageCount: count || 0,
      sampleMessages: data?.length || 0,
      messages: data
    })

  } catch (error: any) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

