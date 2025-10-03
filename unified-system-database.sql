-- =============================================
-- UNIFIED BROILER MANAGEMENT SYSTEM DATABASE
-- =============================================
-- Complete self-contained system with automatic calculations
-- Run this in your Supabase SQL Editor

-- =============================================
-- 1. UNIFIED USERS TABLE (All user types)
-- =============================================

CREATE TABLE IF NOT EXISTS unified_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'farmer', 'batch_user')),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password_hash TEXT, -- For batch users
    username VARCHAR(100) UNIQUE, -- For batch users
    
    -- Batch-specific fields (only for farmers and batch_users)
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    batch_name VARCHAR(200),
    farmer_id UUID, -- For batch_users, references the farmer
    farmer_name VARCHAR(200),
    
    -- User status and preferences
    is_active BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'offline')),
    
    -- Profile information
    avatar_url TEXT,
    address TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_farmer_batch CHECK (
        (user_type = 'admin' AND batch_id IS NULL) OR
        (user_type = 'farmer' AND batch_id IS NULL) OR
        (user_type = 'batch_user' AND batch_id IS NOT NULL)
    )
);

-- =============================================
-- 2. ENHANCED BATCHES TABLE
-- =============================================

-- Add missing columns to batches table if they don't exist
DO $$ 
BEGIN
    -- Add mortality tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'total_mortality') THEN
        ALTER TABLE batches ADD COLUMN total_mortality INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'mortality_rate') THEN
        ALTER TABLE batches ADD COLUMN mortality_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'remaining_birds') THEN
        ALTER TABLE batches ADD COLUMN remaining_birds INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'last_mortality_update') THEN
        ALTER TABLE batches ADD COLUMN last_mortality_update TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add health tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'health_score') THEN
        ALTER TABLE batches ADD COLUMN health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100);
    END IF;
    
    -- Add performance tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'feed_efficiency') THEN
        ALTER TABLE batches ADD COLUMN feed_efficiency DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'weight_gain_rate') THEN
        ALTER TABLE batches ADD COLUMN weight_gain_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
END $$;

-- =============================================
-- 3. AUTOMATIC CALCULATION FUNCTIONS
-- =============================================

-- Function to update batch statistics automatically
CREATE OR REPLACE FUNCTION update_batch_statistics(batch_uuid UUID)
RETURNS VOID AS $$
DECLARE
    batch_record RECORD;
    new_mortality_rate DECIMAL(5,2);
    new_health_score INTEGER;
    new_feed_efficiency DECIMAL(5,2);
BEGIN
    -- Get current batch data
    SELECT * INTO batch_record FROM batches WHERE id = batch_uuid;
    
    IF batch_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate remaining birds
    UPDATE batches 
    SET remaining_birds = GREATEST(0, bird_count - total_mortality)
    WHERE id = batch_uuid;
    
    -- Calculate mortality rate
    IF batch_record.bird_count > 0 THEN
        new_mortality_rate := (batch_record.total_mortality::DECIMAL / batch_record.bird_count::DECIMAL) * 100;
    ELSE
        new_mortality_rate := 0;
    END IF;
    
    -- Calculate health score based on mortality rate
    new_health_score := CASE
        WHEN new_mortality_rate <= 1 THEN 100
        WHEN new_mortality_rate <= 3 THEN 80
        WHEN new_mortality_rate <= 5 THEN 60
        WHEN new_mortality_rate <= 10 THEN 40
        ELSE 20
    END;
    
    -- Calculate feed efficiency (if we have feed data)
    IF batch_record.feed_used > 0 AND batch_record.current_weight > 0 AND batch_record.remaining_birds > 0 THEN
        new_feed_efficiency := batch_record.feed_used / (batch_record.current_weight * batch_record.remaining_birds);
    ELSE
        new_feed_efficiency := 0;
    END IF;
    
    -- Update batch with calculated values
    UPDATE batches 
    SET 
        mortality_rate = new_mortality_rate,
        health_score = new_health_score,
        feed_efficiency = new_feed_efficiency,
        health_status = CASE
            WHEN new_health_score >= 90 THEN 'Excellent'
            WHEN new_health_score >= 70 THEN 'Good'
            WHEN new_health_score >= 50 THEN 'Fair'
            ELSE 'Poor'
        END,
        last_mortality_update = NOW(),
        updated_at = NOW()
    WHERE id = batch_uuid;
    
    -- Log the update
    RAISE NOTICE 'Updated batch %: mortality_rate=%, health_score=%, remaining_birds=%', 
        batch_uuid, new_mortality_rate, new_health_score, batch_record.remaining_birds;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. AUTOMATIC TRIGGERS
-- =============================================

-- Trigger to update batch statistics when mortality changes
CREATE OR REPLACE FUNCTION trigger_update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update statistics for the affected batch
    PERFORM update_batch_statistics(COALESCE(NEW.batch_id, OLD.batch_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on reports table for mortality reports
DROP TRIGGER IF EXISTS trigger_mortality_update ON reports;
CREATE TRIGGER trigger_mortality_update
    AFTER INSERT OR UPDATE ON reports
    FOR EACH ROW
    WHEN (NEW.report_type = 'mortality' OR NEW.report_type = 'daily')
    EXECUTE FUNCTION trigger_update_batch_statistics();

-- =============================================
-- 5. ENHANCED REPORTS TABLE
-- =============================================

-- Add columns to reports table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'processed_data') THEN
        ALTER TABLE reports ADD COLUMN processed_data JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'auto_calculated') THEN
        ALTER TABLE reports ADD COLUMN auto_calculated BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'batch_updated') THEN
        ALTER TABLE reports ADD COLUMN batch_updated BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =============================================
-- 6. UNIFIED USER MANAGEMENT FUNCTIONS
-- =============================================

-- Function to create a new user with automatic batch assignment
CREATE OR REPLACE FUNCTION create_unified_user(
    p_user_type VARCHAR(20),
    p_name VARCHAR(200),
    p_email VARCHAR(255),
    p_phone VARCHAR(20) DEFAULT NULL,
    p_password_hash TEXT DEFAULT NULL,
    p_username VARCHAR(100) DEFAULT NULL,
    p_batch_id UUID DEFAULT NULL,
    p_farmer_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    batch_info RECORD;
    farmer_info RECORD;
BEGIN
    -- Validate user type and required fields
    IF p_user_type NOT IN ('admin', 'farmer', 'batch_user') THEN
        RAISE EXCEPTION 'Invalid user type: %', p_user_type;
    END IF;
    
    IF p_user_type = 'batch_user' AND p_batch_id IS NULL THEN
        RAISE EXCEPTION 'Batch ID required for batch_user';
    END IF;
    
    -- Get batch information if provided
    IF p_batch_id IS NOT NULL THEN
        SELECT name INTO batch_info FROM batches WHERE id = p_batch_id;
        IF batch_info IS NULL THEN
            RAISE EXCEPTION 'Batch not found: %', p_batch_id;
        END IF;
    END IF;
    
    -- Get farmer information if provided
    IF p_farmer_id IS NOT NULL THEN
        SELECT name INTO farmer_info FROM unified_users WHERE id = p_farmer_id AND user_type = 'farmer';
        IF farmer_info IS NULL THEN
            RAISE EXCEPTION 'Farmer not found: %', p_farmer_id;
        END IF;
    END IF;
    
    -- Insert new user
    INSERT INTO unified_users (
        user_type, name, email, phone, password_hash, username,
        batch_id, batch_name, farmer_id, farmer_name
    ) VALUES (
        p_user_type, p_name, p_email, p_phone, p_password_hash, p_username,
        p_batch_id, batch_info.name, p_farmer_id, farmer_info.name
    ) RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all users for communication
CREATE OR REPLACE FUNCTION get_communication_users()
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    email VARCHAR(255),
    user_type VARCHAR(20),
    batch_name VARCHAR(200),
    farmer_name VARCHAR(200),
    is_online BOOLEAN,
    last_seen TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        u.user_type,
        u.batch_name,
        u.farmer_name,
        u.is_online,
        u.last_seen,
        u.status
    FROM unified_users u
    WHERE u.is_active = TRUE
    ORDER BY u.user_type, u.name;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for unified_users table
CREATE INDEX IF NOT EXISTS idx_unified_users_type ON unified_users(user_type);
CREATE INDEX IF NOT EXISTS idx_unified_users_batch ON unified_users(batch_id);
CREATE INDEX IF NOT EXISTS idx_unified_users_farmer ON unified_users(farmer_id);
CREATE INDEX IF NOT EXISTS idx_unified_users_email ON unified_users(email);
CREATE INDEX IF NOT EXISTS idx_unified_users_username ON unified_users(username);

-- Indexes for batches table
CREATE INDEX IF NOT EXISTS idx_batches_mortality ON batches(total_mortality);
CREATE INDEX IF NOT EXISTS idx_batches_health ON batches(health_score);
CREATE INDEX IF NOT EXISTS idx_batches_remaining ON batches(remaining_birds);

-- Indexes for reports table
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_batch ON reports(batch_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

-- =============================================
-- 8. SAMPLE DATA AND INITIALIZATION
-- =============================================

-- Create sample admin user
INSERT INTO unified_users (user_type, name, email, is_active) 
VALUES ('admin', 'System Administrator', 'admin@broiler.com', TRUE)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 9. VIEWS FOR EASY QUERYING
-- =============================================

-- View for batch statistics
CREATE OR REPLACE VIEW batch_statistics AS
SELECT 
    b.id,
    b.name,
    b.farmer_name,
    b.bird_count,
    b.total_mortality,
    b.remaining_birds,
    b.mortality_rate,
    b.health_score,
    b.health_status,
    b.feed_efficiency,
    b.current_weight,
    b.feed_used,
    b.vaccinations,
    b.temperature,
    b.humidity,
    b.status,
    b.start_date,
    b.expected_harvest_date,
    b.last_mortality_update,
    b.created_at,
    b.updated_at
FROM batches b
WHERE b.status != 'Completed';

-- View for user communication list
CREATE OR REPLACE VIEW communication_users_view AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.user_type,
    u.batch_name,
    u.farmer_name,
    u.is_online,
    u.last_seen,
    u.status,
    u.avatar_url,
    CASE 
        WHEN u.user_type = 'admin' THEN 'Admin'
        WHEN u.user_type = 'farmer' THEN 'Farmer'
        WHEN u.user_type = 'batch_user' THEN CONCAT('Batch: ', COALESCE(u.batch_name, 'Unknown'))
        ELSE 'Unknown'
    END as display_name
FROM unified_users u
WHERE u.is_active = TRUE
ORDER BY u.user_type, u.name;

-- =============================================
-- 10. COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'UNIFIED BROILER MANAGEMENT SYSTEM CREATED';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Tables created/updated:';
    RAISE NOTICE '- unified_users (all user types)';
    RAISE NOTICE '- batches (enhanced with auto-calculations)';
    RAISE NOTICE '- reports (enhanced with processing)';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '- update_batch_statistics()';
    RAISE NOTICE '- create_unified_user()';
    RAISE NOTICE '- get_communication_users()';
    RAISE NOTICE '';
    RAISE NOTICE 'Triggers created:';
    RAISE NOTICE '- trigger_mortality_update (auto-updates on reports)';
    RAISE NOTICE '';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '- batch_statistics';
    RAISE NOTICE '- communication_users_view';
    RAISE NOTICE '';
    RAISE NOTICE 'System is now self-contained and ready!';
    RAISE NOTICE '=============================================';
END $$;
