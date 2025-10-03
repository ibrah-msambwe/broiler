import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const batchId = searchParams.get("batchId")
	
	if (!batchId) {
		return NextResponse.json({ error: "batchId required" }, { status: 400 })
	}

	try {
		// Get mortality records for the batch
		const { data: mortalityRecords, error } = await supabase
			.from("mortality_records")
			.select("*")
			.eq("batch_id", batchId)
			.order("created_at", { ascending: false })

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		// Get batch information
		const { data: batch, error: batchError } = await supabase
			.from("batches")
			.select("id, bird_count, mortality, start_date")
			.eq("id", batchId)
			.single()

		if (batchError) {
			return NextResponse.json({ error: batchError.message }, { status: 500 })
		}

		// Calculate mortality statistics
		const totalMortality = mortalityRecords?.reduce((sum, record) => sum + (record.death_count || 0), 0) || 0
		const currentBirdCount = (batch.bird_count || 0) - totalMortality
		const mortalityRate = batch.bird_count ? ((totalMortality / batch.bird_count) * 100).toFixed(2) : 0

		// Calculate daily mortality trends
		const dailyMortality = mortalityRecords?.reduce((acc, record) => {
			const date = record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
			acc[date] = (acc[date] || 0) + (record.death_count || 0)
			return acc
		}, {} as Record<string, number>)

		return NextResponse.json({
			mortalityRecords: mortalityRecords || [],
			statistics: {
				totalMortality,
				currentBirdCount,
				mortalityRate: parseFloat(mortalityRate.toString()),
				originalBirdCount: batch.bird_count || 0
			},
			dailyMortality,
			batch: {
				id: batch.id,
				startDate: batch.start_date
			}
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		
		// Validate request body exists
		if (!body || typeof body !== 'object') {
			return NextResponse.json({ 
				error: "Invalid request format. Please provide valid JSON data." 
			}, { status: 400 })
		}

		const { batchId, deathCount, birdAge, cause, location, description, reportDate } = body

		// Validate required fields
		if (!batchId) {
			return NextResponse.json({ 
				error: "batchId is required",
				help: "Please provide a valid batch ID"
			}, { status: 400 })
		}

		if (!deathCount || deathCount <= 0) {
			return NextResponse.json({ 
				error: "deathCount is required and must be greater than 0",
				help: "Please provide a valid death count (positive number)"
			}, { status: 400 })
		}

		// Validate field types
		if (typeof deathCount !== 'number') {
			return NextResponse.json({ 
				error: "deathCount must be a number" 
			}, { status: 400 })
		}

		if (birdAge !== undefined && typeof birdAge !== 'number') {
			return NextResponse.json({ 
				error: "birdAge must be a number" 
			}, { status: 400 })
		}
		// Get current batch information
		const { data: batch, error: batchError } = await supabase
			.from("batches")
			.select("id, bird_count, mortality, farmer_name, name")
			.eq("id", batchId)
			.single()

		if (batchError || !batch) {
			return NextResponse.json({ error: "Batch not found" }, { status: 404 })
		}

		// Create mortality record
		const mortalityData = {
			batch_id: batchId,
			death_count: deathCount,
			bird_age: birdAge || 0,
			cause: cause || "Unknown",
			location: location || "Not specified",
			description: description || "",
			report_date: reportDate || new Date().toISOString().split('T')[0],
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}

		const { data: mortalityRecord, error: mortalityError } = await supabase
			.from("mortality_records")
			.insert(mortalityData)
			.select("*")
			.single()

		if (mortalityError) {
			return NextResponse.json({ error: mortalityError.message }, { status: 500 })
		}

		// Update batch mortality count
		const newTotalMortality = (batch.mortality || 0) + deathCount
		const { error: updateError } = await supabase
			.from("batches")
			.update({ 
				mortality: newTotalMortality,
				updated_at: new Date().toISOString()
			})
			.eq("id", batchId)

		if (updateError) {
			console.warn("Failed to update batch mortality:", updateError)
		}

		// Create admin notification for mortality
		try {
			await supabase.from("admin_notifications").insert({
				type: "mortality_alert",
				title: `Mortality Alert - ${deathCount} Deaths`,
				message: `${batch.farmer_name || "Farmer"} reported ${deathCount} deaths in batch ${batch.name}. Cause: ${cause || "Unknown"}`,
				batch_id: batchId,
				priority: deathCount > 5 ? "High" : "Normal",
				status: "unread",
				created_at: new Date().toISOString(),
				urgency: deathCount > 5 ? "high" : "normal"
			})
		} catch (notifError) {
			console.warn("Failed to create mortality notification:", notifError)
		}

		// Log the mortality for monitoring
		console.log(`💀 MORTALITY RECORDED: ${deathCount} deaths in batch ${batch.name} (${batchId}) - Cause: ${cause}`)

		return NextResponse.json({
			mortalityRecord,
			updatedBatch: {
				id: batchId,
				totalMortality: newTotalMortality,
				currentBirdCount: (batch.bird_count || 0) - newTotalMortality
			},
			message: `Mortality recorded successfully. ${deathCount} deaths added to batch.`,
			adminNotified: true
		})
	} catch (e: any) {
		console.error("Error in mortality POST:", e)
		
		// Handle JSON parsing errors
		if (e instanceof SyntaxError) {
			return NextResponse.json({ 
				error: "Invalid JSON format in request body" 
			}, { status: 400 })
		}
		
		return NextResponse.json({ 
			error: "Internal server error. Please try again later.",
			details: String(e?.message || e)
		}, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { id, batchId, deathCount, birdAge, cause, location, description } = body || {}

	if (!id || !batchId) {
		return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	}

	try {
		// Get the original mortality record to calculate the difference
		const { data: originalRecord, error: fetchError } = await supabase
			.from("mortality_records")
			.select("death_count")
			.eq("id", id)
			.single()

		if (fetchError || !originalRecord) {
			return NextResponse.json({ error: "Mortality record not found" }, { status: 404 })
		}

		const deathCountDifference = (deathCount || 0) - (originalRecord.death_count || 0)

		// Update the mortality record
		const { data: updatedRecord, error: updateError } = await supabase
			.from("mortality_records")
			.update({
				death_count: deathCount,
				bird_age: birdAge,
				cause: cause,
				location: location,
				description: description,
				updated_at: new Date().toISOString()
			})
			.eq("id", id)
			.select("*")
			.single()

		if (updateError) {
			return NextResponse.json({ error: updateError.message }, { status: 500 })
		}

		// Update batch mortality count if death count changed
		if (deathCountDifference !== 0) {
			const { data: batch, error: batchError } = await supabase
				.from("batches")
				.select("mortality")
				.eq("id", batchId)
				.single()

			if (!batchError && batch) {
				const newTotalMortality = (batch.mortality || 0) + deathCountDifference
				await supabase
					.from("batches")
					.update({ 
						mortality: newTotalMortality,
						updated_at: new Date().toISOString()
					})
					.eq("id", batchId)
			}
		}

		return NextResponse.json({
			mortalityRecord: updatedRecord,
			message: "Mortality record updated successfully"
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")
	const batchId = searchParams.get("batchId")

	if (!id || !batchId) {
		return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	}

	try {
		// Get the mortality record to calculate the difference
		const { data: record, error: fetchError } = await supabase
			.from("mortality_records")
			.select("death_count")
			.eq("id", id)
			.single()

		if (fetchError || !record) {
			return NextResponse.json({ error: "Mortality record not found" }, { status: 404 })
		}

		// Delete the mortality record
		const { error: deleteError } = await supabase
			.from("mortality_records")
			.delete()
			.eq("id", id)

		if (deleteError) {
			return NextResponse.json({ error: deleteError.message }, { status: 500 })
		}

		// Update batch mortality count
		const { data: batch, error: batchError } = await supabase
			.from("batches")
			.select("mortality")
			.eq("id", batchId)
			.single()

		if (!batchError && batch) {
			const newTotalMortality = Math.max(0, (batch.mortality || 0) - (record.death_count || 0))
			await supabase
				.from("batches")
				.update({ 
					mortality: newTotalMortality,
					updated_at: new Date().toISOString()
				})
				.eq("id", batchId)
		}

		return NextResponse.json({ 
			ok: true,
			message: "Mortality record deleted successfully"
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 