import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: []
  }

  // Check 1: Can we connect to Supabase?
  try {
    const { data, error } = await supabase.from("batches").select("id").limit(1)
    results.checks.push({
      name: "Supabase Connection",
      status: error ? "❌ Failed" : "✅ Connected",
      details: error ? error.message : "Connection successful"
    })
  } catch (e: any) {
    results.checks.push({
      name: "Supabase Connection",
      status: "❌ Failed",
      details: e.message
    })
  }

  // Check 2: Does chart_messages table exist?
  try {
    const { data, error } = await supabase
      .from("chart_messages")
      .select("id")
      .limit(1)

    results.checks.push({
      name: "chart_messages Table",
      status: error ? "❌ Not Found" : "✅ Exists",
      details: error ? error.message : `Table exists with ${data?.length || 0} test records`
    })
  } catch (e: any) {
    results.checks.push({
      name: "chart_messages Table",
      status: "❌ Error",
      details: e.message
    })
  }

  // Check 3: Can we insert a test message?
  try {
    const testId = `test-${Date.now()}`
    const { data, error } = await supabase
      .from("chart_messages")
      .insert({
        sender_id: testId,
        receiver_id: "test-receiver",
        sender_name: "Test User",
        receiver_name: "Test Receiver",
        message: "Test message from debug endpoint",
        is_admin_message: false
      })
      .select()

    results.checks.push({
      name: "Insert Test Message",
      status: error ? "❌ Failed" : "✅ Success",
      details: error ? error.message : "Successfully inserted test message"
    })

    // Clean up test message
    if (!error && data && data[0]) {
      await supabase.from("chart_messages").delete().eq("sender_id", testId)
    }
  } catch (e: any) {
    results.checks.push({
      name: "Insert Test Message",
      status: "❌ Error",
      details: e.message
    })
  }

  // Check 4: Environment variables
  results.checks.push({
    name: "Environment Variables",
    status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    details: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"
    }
  })

  return NextResponse.json(results, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

