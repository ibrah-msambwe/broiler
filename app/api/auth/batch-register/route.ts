import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	try {
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

		if (!name || !username || !password) {
			return NextResponse.json({ error: "name, username and password are required" }, { status: 400 })
		}

		const supabase = createServerSupabaseClient()
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
			username,
			password,
			color: color || "bg-indigo-500",
			expected_harvest_date: startDate || null,
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