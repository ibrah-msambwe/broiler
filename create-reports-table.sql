-- Create reports table with all required columns
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID,
    batch_name TEXT,
    farmer_name TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    date TEXT,
    priority TEXT DEFAULT 'Normal',
    fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_comment TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    admin_notified BOOLEAN DEFAULT FALSE,
    urgency_level TEXT,
    is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_batch_id ON reports(batch_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_farmer_name ON reports(farmer_name);

-- Add some sample data (optional)
INSERT INTO reports (
    batch_id,
    batch_name,
    farmer_name,
    type,
    title,
    content,
    status,
    date,
    priority,
    fields,
    is_read
) VALUES (
    gen_random_uuid(),
    'Sample Batch 1',
    'John Doe',
    'Health',
    'Daily Health Check',
    'All birds are healthy and active. No signs of illness observed.',
    'Pending',
    '2025-01-15',
    'Normal',
    '{"temperature": "22°C", "humidity": "65%", "mortality": 0}',
    false
),
(
    gen_random_uuid(),
    'Sample Batch 2',
    'Jane Smith',
    'Feed',
    'Feed Consumption Report',
    'Feed consumption is normal. Birds are eating well.',
    'Approved',
    '2025-01-14',
    'High',
    '{"feedUsed": "150 kg", "feedConversion": "1.8"}',
    true
);