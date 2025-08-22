import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const batchId = searchParams.get("batchId")
	const username = searchParams.get("username")

	let query = supabase.from("batches").select("*").limit(1)
	if (batchId) query = query.eq("id", batchId)
	else if (username) query = query.eq("username", username)
	else return NextResponse.json({ error: "batchId or username required" }, { status: 400 })

	const { data, error } = await query.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!data) return NextResponse.json({ error: "Batch not found" }, { status: 404 })
	return NextResponse.json({ batch: data })
}

export async function PUT(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const {
		id,
		name,
		bird_count,
		start_date,
		notes,
		status,
		health_status,
		temperature,
		humidity,
		current_weight,
		feed_conversion_ratio,
		vaccinations,
		last_health_check,
		feed_used,
		mortality,
		color,
	} = body || {}
	if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
	const { data, error } = await supabase
		.from("batches")
		.update({
			name,
			bird_count,
			start_date,
			notes,
			status,
			health_status,
			temperature,
			humidity,
			current_weight,
			feed_conversion_ratio,
			vaccinations,
			last_health_check,
			feed_used,
			mortality,
			color,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id)
		.select("*")
		.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!data) return NextResponse.json({ error: "Batch not found" }, { status: 404 })
	return NextResponse.json({ batch: data })
} 