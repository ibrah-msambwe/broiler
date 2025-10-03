import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("🔧 Setting up chat tables...")

    // Create chart_messages table
    const createMessagesTableSQL = `
      CREATE TABLE IF NOT EXISTS chart_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id VARCHAR(255) NOT NULL,
        receiver_id VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        receiver_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        is_read BOOLEAN DEFAULT false,
        is_admin_message BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: createMessagesTableSQL
    })

    if (messagesError) {
      console.error("❌ Error creating chart_messages table:", messagesError)
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    // Create conversations table
    const createConversationsTableSQL = `
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user1_id VARCHAR(255) NOT NULL,
        user2_id VARCHAR(255) NOT NULL,
        user1_name VARCHAR(255) NOT NULL,
        user2_name VARCHAR(255) NOT NULL,
        last_message TEXT,
        last_message_time TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user1_id, user2_id)
      );
    `

    const { error: conversationsError } = await supabase.rpc('exec_sql', {
      sql: createConversationsTableSQL
    })

    if (conversationsError) {
      console.warn("⚠️ Warning creating conversations table:", conversationsError)
    }

    // Create indexes for better performance
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
    `

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexesSQL
    })

    if (indexError) {
      console.warn("⚠️ Warning creating indexes:", indexError)
    }

    // Insert some sample messages for testing
    const insertSampleMessagesSQL = `
      INSERT INTO chart_messages (sender_id, receiver_id, sender_name, receiver_name, message, message_type, is_read, is_admin_message) VALUES
      ('admin-tariq', 'demo-farmer-1', 'Tariq (Admin)', 'John Farmer', 'Welcome to the system! How can I help you today?', 'text', false, true),
      ('demo-farmer-1', 'admin-tariq', 'John Farmer', 'Tariq (Admin)', 'Hello Admin! I have a question about my batch.', 'text', false, false),
      ('admin-tariq', 'demo-farmer-2', 'Tariq (Admin)', 'Sarah Farmer', 'Hi Sarah! Your reports look good this week.', 'text', false, true)
      ON CONFLICT (id) DO NOTHING;
    `

    const { error: sampleError } = await supabase.rpc('exec_sql', {
      sql: insertSampleMessagesSQL
    })

    if (sampleError) {
      console.warn("⚠️ Warning inserting sample messages:", sampleError)
    }

    console.log("✅ Chat tables setup completed successfully")
    return NextResponse.json({ 
      success: true, 
      message: "Chat tables setup completed successfully",
      tables: ["chart_messages", "conversations"],
      indexes: ["idx_chart_messages_sender", "idx_chart_messages_receiver", "idx_chart_messages_created_at", "idx_conversations_user1", "idx_conversations_user2"]
    })

  } catch (error: any) {
    console.error("💥 Unexpected error setting up chat tables:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}