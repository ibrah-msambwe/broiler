import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Setting up chat system tables...")

    // Check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    if (!checkError) {
      console.log("✅ Chat tables already exist!")
      return NextResponse.json({
        success: true,
        message: "Chat tables already exist and are ready!",
        alreadyExists: true
      })
    }

    // Table doesn't exist, create it
    const createTableSQL = `
      -- Create chart_messages table if not exists
      CREATE TABLE IF NOT EXISTS chart_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sender_id TEXT NOT NULL,
          receiver_id TEXT NOT NULL,
          sender_name TEXT NOT NULL,
          receiver_name TEXT NOT NULL,
          message TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          conversation_id UUID,
          batch_id UUID,
          is_read BOOLEAN DEFAULT FALSE,
          is_admin_message BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_batch ON chart_messages(batch_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_is_read ON chart_messages(is_read);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_conversation ON chart_messages(sender_id, receiver_id);
    `

    // Try using rpc if available
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTableSQL })

    if (rpcError) {
      console.log("⚠️ RPC method not available, trying direct insert...")
      
      // If RPC doesn't work, try to insert a test record which will fail if table doesn't exist
      // This is a fallback approach
      return NextResponse.json({
        success: false,
        error: "Cannot create tables automatically. Please run the SQL manually.",
        sqlScript: createTableSQL,
        instructions: "Copy the SQL above and run it in your Supabase SQL Editor"
      }, { status: 500 })
    }

    console.log("✅ Chat tables created successfully!")

    // Insert a welcome message
    const { error: insertError } = await supabase
      .from("chart_messages")
      .insert({
        sender_id: 'admin-tariq',
        receiver_id: 'system',
        sender_name: 'Tariq (Admin)',
        receiver_name: 'System',
        message: 'Welcome to TARIQ Communication System! 🎉 Chat is now ready.',
        is_admin_message: true
      })

    if (insertError) {
      console.log("⚠️ Could not insert welcome message:", insertError.message)
    }

    return NextResponse.json({
      success: true,
      message: "Chat system tables created successfully!",
      tableCreated: true
    })

  } catch (error: any) {
    console.error("❌ Error setting up chat system:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      details: "Please run fix-communication-table-complete.sql manually in Supabase SQL Editor"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if chat tables exist
    const { data, error } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    if (error) {
      return NextResponse.json({
        tableExists: false,
        message: "Chat tables not initialized",
        error: error.message
      })
    }

    // Get message count
    const { count } = await supabase
      .from("chart_messages")
      .select("*", { count: 'exact', head: true })

    return NextResponse.json({
      tableExists: true,
      message: "Chat system is ready!",
      messageCount: count || 0
    })

  } catch (error: any) {
    return NextResponse.json({
      tableExists: false,
      error: error.message
    }, { status: 500 })
  }
}

