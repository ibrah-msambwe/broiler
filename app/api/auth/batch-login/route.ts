import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	const { username, password } = await request.json()
	if (!username || !password) return NextResponse.json({ error: "username and password required" }, { status: 400 })
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase.from("batches").select("id,name,username,password").eq("username", username).limit(1).maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!data || data.password !== password) return NextResponse.json({ error: "Invalid batch credentials" }, { status: 401 })
	const user = {
		id: `batch-${data.id}`,
		role: "batch" as const,
		username,
		batchId: data.id,
		batchName: data.name,
		last_login: new Date().toISOString(),
	}
	return NextResponse.json({ user, message: "Batch login successful" })
} 