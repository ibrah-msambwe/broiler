-- =============================================
-- STEP-BY-STEP COMMUNICATION SYSTEM SETUP
-- =============================================
-- Run these commands one by one in Supabase SQL Editor
-- This avoids any timing issues with triggers and functions

-- STEP 1: Create communication_users table
CREATE TABLE IF NOT EXISTS communication_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'farmer', 'user', 'batch_user')),
    avatar_url TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'offline')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- STEP 2: Create user_communication_preferences table
CREATE TABLE IF NOT EXISTS user_communication_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    allow_direct_messages BOOLEAN DEFAULT TRUE,
    allow_group_messages BOOLEAN DEFAULT TRUE,
    allow_file_sharing BOOLEAN DEFAULT TRUE,
    notification_sound BOOLEAN DEFAULT TRUE,
    notification_email BOOLEAN DEFAULT TRUE,
    auto_away_minutes INTEGER DEFAULT 30,
    message_retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_type VARCHAR(50) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'broadcast', 'system')),
    title VARCHAR(200),
    description TEXT,
    participant_1_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    participant_1_name VARCHAR(200) NOT NULL,
    participant_2_name VARCHAR(200) NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count_1 INTEGER DEFAULT 0,
    unread_count_2 INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_by UUID REFERENCES communication_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id, conversation_type)
);

-- STEP 4: Create group_conversation_participants table
CREATE TABLE IF NOT EXISTS group_conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    UNIQUE(conversation_id, user_id)
);

-- STEP 5: Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    sender_name VARCHAR(200) NOT NULL,
    receiver_name VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice', 'video', 'system', 'urgent', 'scheduled')),
    content_data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    reply_to_message_id UUID REFERENCES messages(id),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- STEP 7: Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 8: Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('message', 'mention', 'reaction', 'system', 'urgent')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- STEP 9: Create system_announcements table
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'urgent', 'maintenance')),
    target_roles TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES communication_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 10: Create communication_stats table
CREATE TABLE IF NOT EXISTS communication_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    total_messages_sent INTEGER DEFAULT 0,
    total_messages_received INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    avg_response_time_minutes INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE,
    daily_stats JSONB DEFAULT '{}',
    weekly_stats JSONB DEFAULT '{}',
    monthly_stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 11: Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES communication_users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'greeting', 'response', 'urgent', 'info')),
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 12: Create indexes
CREATE INDEX IF NOT EXISTS idx_communication_users_role ON communication_users(role);
CREATE INDEX IF NOT EXISTS idx_communication_users_online ON communication_users(is_online);
CREATE INDEX IF NOT EXISTS idx_communication_users_active ON communication_users(is_active);
CREATE INDEX IF NOT EXISTS idx_communication_users_last_seen ON communication_users(last_seen);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_is_urgent ON messages(is_urgent);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);

-- STEP 13: Create functions
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
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
    
    INSERT INTO user_notifications (user_id, type, title, message, is_urgent)
    VALUES (
        NEW.receiver_id,
        CASE 
            WHEN NEW.is_urgent THEN 'urgent'
            WHEN NEW.message_type = 'system' THEN 'system'
            ELSE 'message'
        END,
        CASE 
            WHEN NEW.is_urgent THEN '🚨 Urgent Message'
            WHEN NEW.message_type = 'system' THEN 'System Message'
            ELSE 'New Message'
        END,
        CASE 
            WHEN LENGTH(NEW.message) > 100 THEN LEFT(NEW.message, 100) || '...'
            ELSE NEW.message
        END,
        NEW.is_urgent
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_online = TRUE AND OLD.is_online = FALSE THEN
        UPDATE communication_users 
        SET last_seen = NOW() 
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 14: Create triggers
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

DROP TRIGGER IF EXISTS trigger_update_user_online_status ON communication_users;
CREATE TRIGGER trigger_update_user_online_status
    AFTER UPDATE OF is_online ON communication_users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_online_status();

-- STEP 15: Enable RLS
ALTER TABLE communication_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- STEP 16: Create RLS policies
CREATE POLICY "Users can view all active users" ON communication_users
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can update their own profile" ON communication_users
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        participant_1_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid()) OR
        participant_2_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        participant_1_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid()) OR
        participant_2_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        sender_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid()) OR
        receiver_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view their own notifications" ON user_notifications
    FOR SELECT USING (
        user_id IN (SELECT id FROM communication_users WHERE user_id = auth.uid())
    );

-- STEP 17: Grant permissions
GRANT ALL ON communication_users TO authenticated;
GRANT ALL ON user_communication_preferences TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON group_conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON message_reactions TO authenticated;
GRANT ALL ON message_attachments TO authenticated;
GRANT ALL ON user_notifications TO authenticated;
GRANT ALL ON system_announcements TO authenticated;
GRANT ALL ON communication_stats TO authenticated;
GRANT ALL ON message_templates TO authenticated;

-- STEP 18: Insert sample data
INSERT INTO message_templates (user_id, title, content, category, is_public) VALUES
(NULL, 'Welcome Message', 'Hello! Welcome to our broiler management system. How can I help you today?', 'greeting', TRUE),
(NULL, 'Urgent Response', 'I''ve received your urgent message. I''m looking into this immediately and will get back to you shortly.', 'urgent', TRUE),
(NULL, 'Batch Update', 'Your batch has been updated successfully. All changes have been recorded in the system.', 'info', TRUE),
(NULL, 'Report Received', 'Thank you for submitting your report. I''ve reviewed it and it looks good. Keep up the excellent work!', 'response', TRUE),
(NULL, 'Maintenance Notice', 'Scheduled maintenance will occur tonight from 10 PM to 2 AM. The system will be temporarily unavailable.', 'info', TRUE);

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- All tables, indexes, functions, triggers, and RLS policies are now in place.
-- The communication system is ready to use!
