import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  
  try {
    console.log("🚀 Starting comprehensive communication system setup...")

    // Read the SQL script
    const fs = require('fs')
    const path = require('path')
    const sqlScript = fs.readFileSync(
      path.join(process.cwd(), 'communication-system-tables-corrected.sql'), 
      'utf8'
    )

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error executing statement:`, error.message)
          errors.push(`Statement failed: ${statement.substring(0, 100)}... Error: ${error.message}`)
          errorCount++
        } else {
          successCount++
        }
      } catch (err: any) {
        console.error(`❌ Exception executing statement:`, err.message)
        errors.push(`Statement failed: ${statement.substring(0, 100)}... Exception: ${err.message}`)
        errorCount++
      }
    }

    console.log(`✅ Successfully executed ${successCount} statements`)
    console.log(`❌ Failed to execute ${errorCount} statements`)

    if (errorCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Communication system setup completed with ${errorCount} errors`,
        stats: {
          total: statements.length,
          successful: successCount,
          failed: errorCount
        },
        errors: errors.slice(0, 10), // Show first 10 errors
        suggestion: "Some statements may have failed due to existing objects. Check the errors and run individual statements if needed."
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Communication system setup completed successfully!",
      stats: {
        total: statements.length,
        successful: successCount,
        failed: errorCount
      },
      nextSteps: [
        "1. Verify all tables were created in your Supabase dashboard",
        "2. Check that RLS policies are active",
        "3. Test the communication system in your app",
        "4. Set up user data migration from existing tables"
      ]
    })

  } catch (error: any) {
    console.error("💥 Unexpected error during communication system setup:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      suggestion: "Please run the SQL script manually in your Supabase dashboard"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Communication System Setup API",
    description: "POST to this endpoint to set up the comprehensive communication system tables",
    features: [
      "User management for communication",
      "Enhanced conversation system",
      "Rich messaging with attachments",
      "Notification system",
      "Analytics and statistics",
      "Message templates",
      "Group conversations",
      "Real-time updates"
    ],
    tables: [
      "communication_users",
      "user_communication_preferences", 
      "conversations",
      "group_conversation_participants",
      "messages",
      "message_reactions",
      "message_attachments",
      "user_notifications",
      "system_announcements",
      "communication_stats",
      "message_templates"
    ]
  })
}
