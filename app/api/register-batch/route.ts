import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	const { contactName, email, batchName, username, password } = await request.json()
	if (!contactName || !email || !batchName || !username || !password) {
		return NextResponse.json({ error: "Missing fields" }, { status: 400 })
	}
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase.from("candidates").insert({
		contact_name: contactName,
		email,
		batch_name: batchName,
		username,
		password,
		status: "Pending",
	}).select("*").maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ candidate: data, message: "Registration submitted. Await admin approval." })
} 