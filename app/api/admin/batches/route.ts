import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase.from("batches").select("*")
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ batches: data || [] })
}

export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const {
			name,
			farmerName,
			startDate,
			birdCount,
			username,
			password,
			color,
			notes,
		} = body || {}
		if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
		const insert = {
			name,
			farmer_name: farmerName || null,
			start_date: startDate || null,
			bird_count: typeof birdCount === "number" ? birdCount : 0,
			status: "Planning",
			mortality: 0,
			feed_used: 0,
			health_status: "Good",
			temperature: 30,
			humidity: 65,
			username: username || null,
			password: password || null,
			color: color || null,
			expected_harvest_date: startDate ? startDate : null,
			current_weight: 0,
			feed_conversion_ratio: 1.5,
			vaccinations: 0,
			last_health_check: startDate || null,
			notes: notes || null,
		}
		const { data, error } = await supabase.from("batches").insert(insert).select("*").maybeSingle()
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })
		return NextResponse.json({ batch: data })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const {
			id,
			name,
			farmerName,
			startDate,
			birdCount,
			status,
			mortality,
			feedUsed,
			healthStatus,
			temperature,
			humidity,
			username,
			password,
			color,
			expectedHarvestDate,
			currentWeight,
			feedConversionRatio,
			vaccinations,
			lastHealthCheck,
			notes,
		} = body || {}
		if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
		const update = {
			...(name !== undefined ? { name } : {}),
			...(farmerName !== undefined ? { farmer_name: farmerName } : {}),
			...(startDate !== undefined ? { start_date: startDate } : {}),
			...(birdCount !== undefined ? { bird_count: birdCount } : {}),
			...(status !== undefined ? { status } : {}),
			...(mortality !== undefined ? { mortality } : {}),
			...(feedUsed !== undefined ? { feed_used: feedUsed } : {}),
			...(healthStatus !== undefined ? { health_status: healthStatus } : {}),
			...(temperature !== undefined ? { temperature } : {}),
			...(humidity !== undefined ? { humidity } : {}),
			...(username !== undefined ? { username } : {}),
			...(password !== undefined ? { password } : {}),
			...(color !== undefined ? { color } : {}),
			...(expectedHarvestDate !== undefined ? { expected_harvest_date: expectedHarvestDate } : {}),
			...(currentWeight !== undefined ? { current_weight: currentWeight } : {}),
			...(feedConversionRatio !== undefined ? { feed_conversion_ratio: feedConversionRatio } : {}),
			...(vaccinations !== undefined ? { vaccinations } : {}),
			...(lastHealthCheck !== undefined ? { last_health_check: lastHealthCheck } : {}),
			...(notes !== undefined ? { notes } : {}),
			updated_at: new Date().toISOString(),
		}
		const { data, error } = await supabase.from("batches").update(update).eq("id", id).select("*").maybeSingle()
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })
		return NextResponse.json({ batch: data })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 