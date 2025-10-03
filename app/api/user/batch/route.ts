import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const batchId = searchParams.get("batchId")
		const username = searchParams.get("username")

		// Validate that at least one parameter is provided
		if (!batchId && !username) {
			return NextResponse.json({ 
				error: "Either batchId or username parameter is required",
				help: "Add ?batchId=123 or ?username=your_username to the URL"
			}, { status: 400 })
		}

		// Validate parameter formats
		if (batchId && (typeof batchId !== 'string' || batchId.trim().length === 0)) {
			return NextResponse.json({ 
				error: "batchId must be a non-empty string" 
			}, { status: 400 })
		}

		if (username && (typeof username !== 'string' || username.trim().length === 0)) {
			return NextResponse.json({ 
				error: "username must be a non-empty string" 
			}, { status: 400 })
		}

		let query = supabase.from("batches").select("*").limit(1)
		if (batchId) query = query.eq("id", batchId)
		else if (username) query = query.eq("username", username)

		const { data, error } = await query.maybeSingle()
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })
		if (!data) return NextResponse.json({ error: "Batch not found" }, { status: 404 })
		return NextResponse.json({ batch: data })
	} catch (error) {
		console.error("Error in batch GET:", error)
		return NextResponse.json({ 
			error: "Internal server error. Please try again later." 
		}, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		
		// Validate request body exists
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ 
				error: "Invalid request format. Please provide valid JSON data." 
			}, { status: 400 })
		}

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
		} = body

		// Validate required fields
		if (!id) {
			return NextResponse.json({ 
				error: "Batch ID is required",
				help: "Please provide the 'id' field in your request body"
			}, { status: 400 })
		}

		// Validate ID format
		if (typeof id !== 'string' && typeof id !== 'number') {
			return NextResponse.json({ 
				error: "Batch ID must be a string or number" 
			}, { status: 400 })
		}
		// Helper function to handle date fields - convert empty strings to null
		const handleDateField = (value: any) => {
			if (value === undefined || value === '' || value === null) return null
			return value
		}

		const { data, error } = await supabase
			.from("batches")
			.update({
				name,
				bird_count,
				start_date: handleDateField(start_date),
				notes,
				status,
				health_status,
				temperature,
				humidity,
				current_weight,
				feed_conversion_ratio,
				vaccinations,
				last_health_check: handleDateField(last_health_check),
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
	} catch (error) {
		console.error("Error in batch PUT:", error)
		
		// Handle JSON parsing errors
		if (error instanceof SyntaxError) {
			return NextResponse.json({ 
				error: "Invalid JSON format in request body" 
			}, { status: 400 })
		}
		
		return NextResponse.json({ 
			error: "Internal server error. Please try again later." 
		}, { status: 500 })
	}
} 