import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Verify password before proceeding
    if (!password) {
      return NextResponse.json({
        success: false,
        error: "Password is required for system reset"
      }, { status: 400 })
    }

    // Verify admin password
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "A1B2C3"
    const VALID_ADMIN_PASSWORDS = [
      process.env.ADMIN_PASSWORD || "A1B2C3",
      "A1B2C3",      // Tariq's actual admin password
      "tariq123",
      "admin123",
      "tariq"
    ]

    if (!VALID_ADMIN_PASSWORDS.includes(password)) {
      console.log("❌ System reset attempted with invalid password")
      return NextResponse.json({
        success: false,
        error: "Invalid admin password. System reset denied."
      }, { status: 401 })
    }

    console.log("✅ Admin password verified. Proceeding with system reset...")
    console.log("🔄 System reset in progress...")
    
    const errors: string[] = []
    const deleted: string[] = []

    // List of tables to clear (in order to avoid foreign key constraints)
    const tables = [
      "chart_messages",
      "reports",
      "user_activities",
      "batches",
      "profile"
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all (workaround)

        if (error) {
          console.warn(`⚠️ Could not delete from ${table}:`, error.message)
          errors.push(`${table}: ${error.message}`)
        } else {
          console.log(`✅ Cleared table: ${table}`)
          deleted.push(table)
        }
      } catch (err: any) {
        console.warn(`⚠️ Error deleting from ${table}:`, err.message)
        errors.push(`${table}: ${err.message}`)
      }
    }

    console.log("🎯 System reset completed")
    console.log("✅ Deleted from:", deleted)
    if (errors.length > 0) {
      console.log("⚠️ Errors:", errors)
    }

    return NextResponse.json({
      success: true,
      message: "System reset completed",
      deleted,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error("❌ System reset failed:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to reset system"
    }, { status: 500 })
  }
}

