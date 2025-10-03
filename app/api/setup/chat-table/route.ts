import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔧 Setting up chart_messages table...")

    // Create the table
    const createTableSQL = `
      -- Create chart_messages table
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
      CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_batch ON chart_messages(batch_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_is_read ON chart_messages(is_read);
    `

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })

    if (createError) {
      console.error("❌ Error creating table:", createError)
      
      // Try alternative approach - direct insert to test if table exists
      const { error: testError } = await supabase
        .from("chart_messages")
        .select("id")
        .limit(1)

      if (testError) {
        return NextResponse.json({ 
          success: false,
          error: "Failed to create table. Please run the SQL script manually in Supabase SQL Editor.",
          details: createError.message,
          sqlScript: "create-chart-messages-table-simple.sql"
        }, { status: 500 })
      } else {
        console.log("✅ Table already exists!")
        return NextResponse.json({ 
          success: true,
          message: "Table already exists and is ready to use!",
          tableExists: true
        })
      }
    }

    // Insert a test message
    const { error: insertError } = await supabase
      .from("chart_messages")
      .insert({
        sender_id: 'admin-tariq',
        receiver_id: 'test-user',
        sender_name: 'Tariq (Admin)',
        receiver_name: 'Test User',
        message: 'Welcome to TARIQ Broiler Communication System! 🎉',
        is_admin_message: true
      })

    if (insertError) {
      console.error("⚠️ Error inserting test message:", insertError)
    } else {
      console.log("✅ Test message inserted successfully")
    }

    console.log("✅ Chart_messages table setup completed successfully!")

    return NextResponse.json({ 
      success: true,
      message: "Chart_messages table created successfully!",
      tableCreated: true,
      testMessageInserted: !insertError
    })

  } catch (error: any) {
    console.error("💥 Error setting up chat table:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      instructions: "Please run create-chart-messages-table-simple.sql in your Supabase SQL Editor"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔍 Checking if chart_messages table exists...")

    // Try to query the table
    const { data, error } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    if (error) {
      console.error("❌ Table does not exist or error accessing it:", error)
      return NextResponse.json({ 
        tableExists: false,
        error: error.message,
        instructions: "Run POST /api/setup/chat-table to create the table, or run create-chart-messages-table-simple.sql in Supabase SQL Editor"
      })
    }

    console.log("✅ Table exists and is accessible")

    // Get table stats
    const { count, error: countError } = await supabase
      .from("chart_messages")
      .select("*", { count: 'exact', head: true })

    return NextResponse.json({ 
      tableExists: true,
      messageCount: count || 0,
      message: "Chart_messages table is ready to use!"
    })

  } catch (error: any) {
    console.error("💥 Error checking table:", error)
    return NextResponse.json({ 
      tableExists: false,
      error: error.message
    }, { status: 500 })
  }
}
