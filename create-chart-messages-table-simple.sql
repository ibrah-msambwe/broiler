-- =============================================
-- SIMPLE CHART MESSAGES TABLE SETUP
-- =============================================
-- Run this in your Supabase SQL Editor
-- This creates only the essential table for messaging

-- Drop existing table if you want a fresh start (OPTIONAL - remove comments to use)
-- DROP TABLE IF EXISTS chart_messages CASCADE;

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

-- Enable Row Level Security (RLS) - but allow all operations for now
ALTER TABLE chart_messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all for simplicity)
CREATE POLICY "Allow all users to view messages" ON chart_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow all users to send messages" ON chart_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update messages" ON chart_messages
    FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete messages" ON chart_messages
    FOR DELETE USING (true);

-- Insert a test message to verify table works
INSERT INTO chart_messages (
    sender_id,
    receiver_id,
    sender_name,
    receiver_name,
    message,
    is_admin_message
) VALUES (
    'admin-tariq',
    'test-user',
    'Tariq (Admin)',
    'Test User',
    'Welcome to TARIQ Broiler Communication System! 🎉',
    true
);

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Chart_messages table created successfully!';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ RLS policies applied';
    RAISE NOTICE '✅ Test message inserted';
    RAISE NOTICE '🚀 Communication system is ready to use!';
END $$;

-- Verify table was created
SELECT 
    'chart_messages' as table_name,
    COUNT(*) as message_count,
    'Table created successfully!' as status
FROM chart_messages;
