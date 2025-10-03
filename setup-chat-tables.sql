-- =============================================
-- CHAT TABLES SETUP SCRIPT
-- =============================================
-- Run this script in your Supabase SQL Editor
-- to enable chat functionality in the broiler app

-- 1. Create conversations table
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

-- 2. Create chart_messages table
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

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_conversation ON chart_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- 4. Create function to update conversation when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the conversation with the latest message info
    UPDATE conversations 
    SET 
        last_message = NEW.message,
        last_message_at = NEW.created_at,
        unread_count_1 = CASE 
            WHEN NEW.sender_id = participant_1_id THEN unread_count_1
            ELSE unread_count_1 + 1
        END,
        unread_count_2 = CASE 
            WHEN NEW.sender_id = participant_2_id THEN unread_count_2
            ELSE unread_count_2 + 1
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to automatically update conversation
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON chart_messages;
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON chart_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_messages ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        participant_1_id = auth.uid() OR 
        participant_2_id = auth.uid()
    );

CREATE POLICY "Users can insert their own conversations" ON conversations
    FOR INSERT WITH CHECK (
        participant_1_id = auth.uid() OR 
        participant_2_id = auth.uid()
    );

CREATE POLICY "Users can update their own conversations" ON conversations
    FOR UPDATE USING (
        participant_1_id = auth.uid() OR 
        participant_2_id = auth.uid()
    );

-- 8. Create RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" ON chart_messages
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        receiver_id = auth.uid()
    );

CREATE POLICY "Users can insert messages" ON chart_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
    );

CREATE POLICY "Users can update their own messages" ON chart_messages
    FOR UPDATE USING (
        sender_id = auth.uid()
    );

-- 9. Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON chart_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- The chat functionality should now work properly.
-- You can test it by refreshing your broiler app.
