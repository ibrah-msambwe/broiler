-- =============================================
-- COMMUNICATION SYSTEM SETUP
-- =============================================
-- This script creates the necessary tables for the communication system
-- Run this in your Supabase SQL Editor

-- =============================================
-- 1. CONVERSATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id TEXT NOT NULL,
    participant_2_id TEXT NOT NULL,
    participant_1_name TEXT NOT NULL,
    participant_2_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- =============================================
-- 2. CHART MESSAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS chart_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    conversation_id UUID, -- Optional reference to conversations table
    batch_id UUID, -- Optional reference to batch
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_conversation ON chart_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chart_messages_batch ON chart_messages(batch_id);

-- =============================================
-- 3. SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert a sample conversation between admin and a batch user
INSERT INTO conversations (
    participant_1_id,
    participant_2_id,
    participant_1_name,
    participant_2_name
) VALUES (
    'admin-tariq',
    'batch-sample-1',
    'Tariq (Admin)',
    'John Doe (Sample Batch)'
) ON CONFLICT DO NOTHING;

-- Insert a sample message
INSERT INTO chart_messages (
    sender_id,
    receiver_id,
    sender_name,
    receiver_name,
    message,
    conversation_id,
    is_admin_message
) 
SELECT 
    'admin-tariq',
    'batch-sample-1',
    'Tariq (Admin)',
    'John Doe (Sample Batch)',
    'Welcome to TARIQ Broiler Management System! How can I help you today?',
    id,
    true
FROM conversations 
WHERE participant_1_id = 'admin-tariq' AND participant_2_id = 'batch-sample-1'
LIMIT 1;

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        participant_1_id = current_setting('app.current_user_id', true) OR 
        participant_2_id = current_setting('app.current_user_id', true)
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        participant_1_id = current_setting('app.current_user_id', true) OR 
        participant_2_id = current_setting('app.current_user_id', true)
    );

-- Create policies for messages
CREATE POLICY "Users can view their messages" ON chart_messages
    FOR SELECT USING (
        sender_id = current_setting('app.current_user_id', true) OR 
        receiver_id = current_setting('app.current_user_id', true)
    );

CREATE POLICY "Users can send messages" ON chart_messages
    FOR INSERT WITH CHECK (
        sender_id = current_setting('app.current_user_id', true)
    );

CREATE POLICY "Users can update their messages" ON chart_messages
    FOR UPDATE USING (
        sender_id = current_setting('app.current_user_id', true)
    );

-- =============================================
-- 5. HELPFUL FUNCTIONS
-- =============================================

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation_id(user1_id TEXT, user2_id TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM conversations 
        WHERE (participant_1_id = user1_id AND participant_2_id = user2_id)
           OR (participant_1_id = user2_id AND participant_2_id = user1_id)
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM chart_messages 
        WHERE receiver_id = user_id AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Communication system tables created successfully!';
    RAISE NOTICE 'Tables created: conversations, chart_messages';
    RAISE NOTICE 'Indexes and policies applied';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Ready for communication functionality!';
END $$;
