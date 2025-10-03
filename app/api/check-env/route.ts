import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set (starts with: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...)" : "❌ Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing (This might be the issue!)",
    },
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "..." || "Not set",
    issue: !process.env.SUPABASE_SERVICE_ROLE_KEY ? 
      "⚠️ SUPABASE_SERVICE_ROLE_KEY is missing! Add it to your .env.local file" : 
      "All environment variables are set"
  }

  return NextResponse.json(envCheck, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

