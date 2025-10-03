import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("🔧 Setting up user_activities table...")

    // Create user_activities table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) DEFAULT 'user',
        batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
        batch_name VARCHAR(255),
        last_action VARCHAR(100) DEFAULT 'login',
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        is_online BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })

    if (tableError) {
      console.error("❌ Error creating user_activities table:", tableError)
      return NextResponse.json({ error: tableError.message }, { status: 500 })
    }

    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activities_is_online ON user_activities(is_online);
      CREATE INDEX IF NOT EXISTS idx_user_activities_last_seen ON user_activities(last_seen);
      CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON user_activities(user_type);
    `

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexesSQL
    })

    if (indexError) {
      console.warn("⚠️ Warning creating indexes:", indexError)
    }

    // Create function to automatically update updated_at timestamp
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_user_activities_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `

    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: createFunctionSQL
    })

    if (functionError) {
      console.warn("⚠️ Warning creating function:", functionError)
    }

    // Create trigger
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS trigger_update_user_activities_updated_at ON user_activities;
      CREATE TRIGGER trigger_update_user_activities_updated_at
        BEFORE UPDATE ON user_activities
        FOR EACH ROW
        EXECUTE FUNCTION update_user_activities_updated_at();
    `

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: createTriggerSQL
    })

    if (triggerError) {
      console.warn("⚠️ Warning creating trigger:", triggerError)
    }

    // Insert sample data
    const insertSampleDataSQL = `
      INSERT INTO user_activities (user_id, user_name, user_type, batch_id, batch_name, last_action, is_online, ip_address) VALUES
      ('admin-001', 'Admin User', 'admin', NULL, NULL, 'login', true, '192.168.1.100'),
      ('farmer-001', 'John Doe', 'farmer', '8eba521a-a83f-4cc1-b876-3e0fcf70cac7', 'Pemba', 'login', true, '192.168.1.101'),
      ('batch-001', 'Pemba Batch', 'batch', '8eba521a-a83f-4cc1-b876-3e0fcf70cac7', 'Pemba', 'login', false, '192.168.1.102'),
      ('farmer-002', 'Jane Smith', 'farmer', '7dd74051-ad2d-45e2-8bf7-1cabe76a4772', 'Msambwe', 'login', true, '192.168.1.103')
      ON CONFLICT (user_id) DO NOTHING;
    `

    const { error: sampleError } = await supabase.rpc('exec_sql', {
      sql: insertSampleDataSQL
    })

    if (sampleError) {
      console.warn("⚠️ Warning inserting sample data:", sampleError)
    }

    console.log("✅ User activities table setup completed successfully")
    return NextResponse.json({ 
      success: true, 
      message: "User activities table setup completed successfully",
      tables: ["user_activities"],
      indexes: ["idx_user_activities_user_id", "idx_user_activities_is_online", "idx_user_activities_last_seen", "idx_user_activities_user_type"],
      functions: ["update_user_activities_updated_at"],
      triggers: ["trigger_update_user_activities_updated_at"]
    })

  } catch (error: any) {
    console.error("💥 Unexpected error setting up user activities table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
