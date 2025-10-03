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
		// Helper function to handle date fields - convert empty strings to null
		const handleDateField = (value: any) => {
			if (value === undefined || value === '' || value === null) return null
			return value
		}

		const insert = {
			name,
			farmer_name: farmerName || null,
			start_date: handleDateField(startDate),
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
			expected_harvest_date: handleDateField(startDate),
			current_weight: 0,
			feed_conversion_ratio: 1.5,
			vaccinations: 0,
			last_health_check: handleDateField(startDate),
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
		// Helper function to handle date fields - convert empty strings to null
		const handleDateField = (value: any) => {
			if (value === undefined) return undefined
			if (value === '' || value === null) return null
			return value
		}

		// Helper to normalize status values to match database constraint
		const normalizeStatus = (status: string) => {
			// If database uses lowercase, uncomment this:
			// return status.toLowerCase()
			
			// If database uses capitalized (Planning, Active, etc.), use as-is:
			return status
		}

		const update = {
			...(name !== undefined ? { name } : {}),
			...(farmerName !== undefined ? { farmer_name: farmerName } : {}),
			...(startDate !== undefined ? { start_date: handleDateField(startDate) } : {}),
			...(birdCount !== undefined ? { bird_count: birdCount } : {}),
			...(status !== undefined ? { status: normalizeStatus(status) } : {}),
			...(mortality !== undefined ? { mortality } : {}),
			...(feedUsed !== undefined ? { feed_used: feedUsed } : {}),
			...(healthStatus !== undefined ? { health_status: healthStatus } : {}),
			...(temperature !== undefined ? { temperature } : {}),
			...(humidity !== undefined ? { humidity } : {}),
			...(username !== undefined ? { username } : {}),
			...(password !== undefined ? { password } : {}),
			...(color !== undefined ? { color } : {}),
			...(expectedHarvestDate !== undefined ? { expected_harvest_date: handleDateField(expectedHarvestDate) } : {}),
			...(currentWeight !== undefined ? { current_weight: currentWeight } : {}),
			...(feedConversionRatio !== undefined ? { feed_conversion_ratio: feedConversionRatio } : {}),
			...(vaccinations !== undefined ? { vaccinations } : {}),
			...(lastHealthCheck !== undefined ? { last_health_check: handleDateField(lastHealthCheck) } : {}),
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

export async function DELETE(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const id = searchParams.get("id")
		
		if (!id) {
			return NextResponse.json({ error: "Batch ID is required" }, { status: 400 })
		}

		// First, delete all related data to maintain referential integrity
		// Delete mortality records
		await supabase.from("mortality_records").delete().eq("batch_id", id)
		
		// Delete reports
		await supabase.from("reports").delete().eq("batch_id", id)
		
		// Delete messages
		await supabase.from("messages").delete().eq("batch_id", id)
		
		// Delete admin notifications related to this batch
		await supabase.from("admin_notifications").delete().eq("batch_id", id)
		
		// Delete devices associated with this batch
		await supabase.from("devices").delete().eq("batch_id", id)
		
		// Finally, delete the batch itself
		const { error } = await supabase.from("batches").delete().eq("id", id)
		
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		
		return NextResponse.json({ 
			ok: true, 
			message: "Batch and all related data deleted successfully" 
		})
	} catch (e: any) {
		console.error("Error deleting batch:", e)
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 