import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "running",
    environment: {
      nodeEnv: process.env.NODE_ENV || "unknown",
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    database: {
      status: "unknown",
      error: null as string | null
    }
  }

  try {
    // Test database connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("batches")
      .select("count")
      .limit(1)
    
    if (error) {
      healthCheck.database.status = "error"
      healthCheck.database.error = error.message
      healthCheck.status = "error"
    } else {
      healthCheck.database.status = "connected"
    }
  } catch (e: any) {
    healthCheck.database.status = "failed"
    healthCheck.database.error = e.message
    healthCheck.status = "error"
  }

  const statusCode = healthCheck.status === "ok" ? 200 : 500
  
  return NextResponse.json(healthCheck, { status: statusCode })
} 