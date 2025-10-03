import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    console.log("🔍 Checking chart_messages table...")

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: []
    }

    // Check 1: Does the table exist?
    console.log("Check 1: Table existence...")
    const { data: tableCheck, error: tableError } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    diagnostics.checks.push({
      name: "Table Exists",
      status: tableError ? "FAILED" : "PASSED",
      error: tableError?.message,
      details: tableError ? "Table does not exist or is not accessible" : "Table exists and is accessible"
    })

    if (tableError) {
      diagnostics.recommendation = "Run fix-communication-table-complete.sql in Supabase SQL Editor"
      return NextResponse.json(diagnostics)
    }

    // Check 2: Can we count rows?
    console.log("Check 2: Row count...")
    const { count, error: countError } = await supabase
      .from("chart_messages")
      .select("*", { count: 'exact', head: true })

    diagnostics.checks.push({
      name: "Row Count",
      status: countError ? "FAILED" : "PASSED",
      count: count || 0,
      error: countError?.message
    })

    // Check 3: Can we insert a test message?
    console.log("Check 3: Insert test...")
    const testMessage = {
      sender_id: `test-${Date.now()}`,
      receiver_id: "test-receiver",
      sender_name: "Test Sender",
      receiver_name: "Test Receiver",
      message: "Diagnostic test message",
      is_admin_message: false
    }

    const { data: insertData, error: insertError } = await supabase
      .from("chart_messages")
      .insert(testMessage)
      .select("*")
      .single()

    diagnostics.checks.push({
      name: "Insert Permission",
      status: insertError ? "FAILED" : "PASSED",
      error: insertError?.message,
      errorCode: insertError?.code,
      errorDetails: insertError?.details,
      hint: insertError?.hint,
      details: insertError 
        ? "Cannot insert messages - likely RLS policy issue" 
        : "Can insert messages successfully"
    })

    // If insert failed, provide specific guidance
    if (insertError) {
      diagnostics.recommendation = "RLS (Row Level Security) is blocking inserts. Run fix-communication-table-complete.sql to disable RLS."
      diagnostics.sqlScript = "fix-communication-table-complete.sql"
      
      // Check if it's an RLS issue
      if (insertError.message.includes("policy") || 
          insertError.message.includes("permission denied") ||
          insertError.code === "42501") {
        diagnostics.issue = "RLS_POLICY_BLOCKING"
        diagnostics.solution = "Disable RLS or create permissive policies"
      }
    }

    // Check 4: Can we update?
    if (insertData) {
      console.log("Check 4: Update test...")
      const { error: updateError } = await supabase
        .from("chart_messages")
        .update({ is_read: true })
        .eq("id", insertData.id)

      diagnostics.checks.push({
        name: "Update Permission",
        status: updateError ? "FAILED" : "PASSED",
        error: updateError?.message
      })

      // Clean up test message
      await supabase
        .from("chart_messages")
        .delete()
        .eq("id", insertData.id)
    }

    // Overall status
    const allPassed = diagnostics.checks.every((check: any) => check.status === "PASSED")
    diagnostics.overallStatus = allPassed ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"

    if (allPassed) {
      diagnostics.message = "Communication system is fully functional!"
    } else {
      diagnostics.message = "Communication system has issues that need to be fixed"
    }

    return NextResponse.json(diagnostics, { 
      status: allPassed ? 200 : 500 
    })

  } catch (error: any) {
    console.error("💥 Diagnostic error:", error)
    return NextResponse.json({ 
      error: error.message,
      recommendation: "Run fix-communication-table-complete.sql in Supabase SQL Editor"
    }, { status: 500 })
  }
}
