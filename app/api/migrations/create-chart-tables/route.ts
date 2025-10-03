import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	
	try {
		// Check if tables already exist
		const { data: messagesCheck } = await supabase
			.from('chart_messages')
			.select('id')
			.limit(1)

		const { data: conversationsCheck } = await supabase
			.from('conversations')
			.select('id')
			.limit(1)

		// If tables exist, return success
		if (messagesCheck !== null && conversationsCheck !== null) {
			return NextResponse.json({
				success: true,
				message: "Chart tables already exist",
				tables: ["chart_messages", "conversations"]
			})
		}

		// Since we can't create tables via the client, we'll return instructions
		return NextResponse.json({
			success: false,
			message: "Tables need to be created manually in Supabase dashboard",
			instructions: {
				step1: "Go to Supabase Dashboard > SQL Editor",
				step2: "Run the following SQL to create the tables:",
				sql: `
-- Create conversations table first
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID NOT NULL,
    participant_2_id UUID NOT NULL,
    participant_1_name VARCHAR(200) NOT NULL,
    participant_2_name VARCHAR(200) NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count_1 INTEGER DEFAULT 0,
    unread_count_2 INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id)
);

-- Create chart_messages table
CREATE TABLE IF NOT EXISTS chart_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    sender_name VARCHAR(200) NOT NULL,
    receiver_name VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_conversation ON chart_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
				`
			}
		})

	} catch (error: any) {
		console.error("Migration error:", error)
		return NextResponse.json({ 
			error: "Migration failed",
			details: error.message 
		}, { status: 500 })
	}
}
