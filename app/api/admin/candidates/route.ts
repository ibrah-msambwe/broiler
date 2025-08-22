import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase.from("candidates").select("*").order("created_at", { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ candidates: data || [] })
}

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { action, candidateId } = await request.json()
	if (!candidateId || !action) return NextResponse.json({ error: "Missing parameters" }, { status: 400 })

	// Load candidate
	const { data: cand, error: err1 } = await supabase.from("candidates").select("*").eq("id", candidateId).maybeSingle()
	if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })
	if (!cand) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

	if (action === "approve") {
		// Create batch from candidate (Planning status)
		const { data: batch, error: errB } = await supabase.from("batches").insert({
			name: cand.batch_name,
			farmer_name: cand.contact_name,
			start_date: new Date().toISOString().split("T")[0],
			bird_count: 0,
			status: "Planning",
			mortality: 0,
			feed_used: 0,
			health_status: "Good",
			temperature: 30,
			humidity: 65,
			username: cand.username,
			password: cand.password,
			color: "bg-indigo-500",
			expected_harvest_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			current_weight: 0,
			feed_conversion_ratio: 1.5,
			vaccinations: 0,
			last_health_check: new Date().toISOString().split("T")[0],
		}).select("*").maybeSingle()
		if (errB) return NextResponse.json({ error: errB.message }, { status: 500 })
		// Mark candidate approved
		const { data: candUpd, error: errU } = await supabase.from("candidates").update({ status: "Approved" }).eq("id", candidateId).select("*").maybeSingle()
		if (errU) return NextResponse.json({ error: errU.message }, { status: 500 })
		return NextResponse.json({ approved: batch, candidate: candUpd })
	}
	if (action === "deny") {
		const { data: denied, error: errD } = await supabase.from("candidates").update({ status: "Denied" }).eq("id", candidateId).select("*").maybeSingle()
		if (errD) return NextResponse.json({ error: errD.message }, { status: 500 })
		return NextResponse.json({ candidate: denied })
	}
	return NextResponse.json({ error: "Invalid action" }, { status: 400 })
} 