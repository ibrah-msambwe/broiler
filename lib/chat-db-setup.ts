// Automatic chat database setup utility
import { supabase } from "./supabase"

let setupAttempted = false
let setupSuccess = false

/**
 * Ensures chat tables exist in the database.
 * This function is idempotent - safe to call multiple times.
 */
export async function ensureChatTablesExist(): Promise<boolean> {
  // If we've already successfully set up, return true
  if (setupSuccess) {
    return true
  }

  // If we've already attempted and failed, don't retry immediately
  if (setupAttempted) {
    return setupSuccess
  }

  setupAttempted = true

  try {
    console.log("🔧 Checking if chat tables exist...")

    // Quick check - try to query the table
    const { error: checkError } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    if (!checkError) {
      console.log("✅ Chat tables already exist!")
      setupSuccess = true
      return true
    }

    // Table doesn't exist, try to create it
    console.log("📝 Chat tables not found, attempting to create...")

    const createTableSQL = `
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

      CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_batch ON chart_messages(batch_id);
      CREATE INDEX IF NOT EXISTS idx_chart_messages_is_read ON chart_messages(is_read);

      ALTER TABLE chart_messages DISABLE ROW LEVEL SECURITY;

      GRANT ALL ON chart_messages TO authenticated;
      GRANT ALL ON chart_messages TO anon;
      GRANT ALL ON chart_messages TO postgres;
    `

    // Try using RPC to execute SQL
    const { error: rpcError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })

    if (rpcError) {
      console.warn("⚠️ Could not auto-create tables via RPC:", rpcError.message)
      setupSuccess = false
      return false
    }

    // Verify the table was created
    const { error: verifyError } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    if (verifyError) {
      console.warn("⚠️ Table creation verification failed:", verifyError.message)
      setupSuccess = false
      return false
    }

    console.log("✅ Chat tables created successfully!")
    setupSuccess = true
    return true

  } catch (error) {
    console.error("❌ Error in ensureChatTablesExist:", error)
    setupSuccess = false
    return false
  }
}

/**
 * Reset the setup state (useful for testing or retrying)
 */
export function resetSetupState() {
  setupAttempted = false
  setupSuccess = false
}

