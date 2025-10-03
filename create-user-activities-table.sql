-- Create user_activities table for tracking user login and online status
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) DEFAULT 'user', -- 'admin', 'farmer', 'user', 'batch'
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  batch_name VARCHAR(255),
  last_action VARCHAR(100) DEFAULT 'login', -- 'login', 'logout', 'refresh', 'status_update'
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_is_online ON user_activities(is_online);
CREATE INDEX IF NOT EXISTS idx_user_activities_last_seen ON user_activities(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON user_activities(user_type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_activities_updated_at
  BEFORE UPDATE ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activities_updated_at();

-- Create function to clean up old offline users (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_offline_users()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activities 
  WHERE is_online = false 
    AND last_seen < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO user_activities (user_id, user_name, user_type, batch_id, batch_name, last_action, is_online, ip_address) VALUES
('admin-001', 'Admin User', 'admin', NULL, NULL, 'login', true, '192.168.1.100'),
('farmer-001', 'John Doe', 'farmer', '8eba521a-a83f-4cc1-b876-3e0fcf70cac7', 'Pemba', 'login', true, '192.168.1.101'),
('batch-001', 'Pemba Batch', 'batch', '8eba521a-a83f-4cc1-b876-3e0fcf70cac7', 'Pemba', 'login', false, '192.168.1.102'),
('farmer-002', 'Jane Smith', 'farmer', '7dd74051-ad2d-45e2-8bf7-1cabe76a4772', 'Msambwe', 'login', true, '192.168.1.103')
ON CONFLICT (user_id) DO NOTHING;
