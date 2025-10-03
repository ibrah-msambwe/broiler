import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const farmerName = searchParams.get("farmerName")
		const batchId = searchParams.get("batchId")
		
		console.log("📋 Fetching farm profile for:", { farmerName, batchId })
		
		// Try to get farmer from farm table
		let farmData = null
		let farmError = null
		
		// Strategy 1: If farmerName is provided, try to find by name
		if (farmerName) {
			const { data, error } = await supabase
				.from("farm")
				.select("*")
				.ilike("name", `%${farmerName}%`)
				.limit(1)
				.maybeSingle()
			
			farmData = data
			farmError = error
			
			if (farmData) {
				console.log("✅ Found farm by farmer name:", farmData.name)
			}
		}
		
		// Strategy 2: If we still don't have data and batchId is provided, get farmer from batch
		if (!farmData && batchId) {
			const { data: batchData, error: batchError } = await supabase
				.from("batches")
				.select("farmer_name, farmer_id")
				.eq("id", batchId)
				.maybeSingle()
			
			if (batchData && batchData.farmer_name) {
				const { data, error } = await supabase
					.from("farm")
					.select("*")
					.ilike("name", `%${batchData.farmer_name}%`)
					.limit(1)
					.maybeSingle()
				
				farmData = data
				farmError = error
				
				if (farmData) {
					console.log("✅ Found farm by batch->farmer_name:", farmData.name)
				}
			}
		}
		
		// Strategy 3: If still no data, get the first farm (admin's farm)
		if (!farmData) {
			console.log("⚠️ No specific farmer found, fetching first available farm")
			const { data, error } = await supabase
				.from("farm")
				.select("*")
				.order("created_at", { ascending: true })
				.limit(1)
				.maybeSingle()
			
			farmData = data
			farmError = error
		}
		
		// If we found real farm data, return it
		if (farmData) {
			console.log("✅ Returning farm profile:", farmData.name)
			return NextResponse.json({ 
				farmProfile: {
					id: farmData.id,
					name: farmData.name,
					email: farmData.email || "contact@farm.com",
					phone: farmData.phone || "Not provided",
					address: farmData.address || "Not provided",
					logo_url: farmData.logo_url,
					description: farmData.description || "Professional Broiler Farm Management",
					owner_name: farmData.owner_name || "Farm Owner",
					established_date: farmData.established_date,
					status: farmData.status || "Active",
					rating: farmData.rating || 5.0,
					created_at: farmData.created_at,
					updated_at: farmData.updated_at
				}
			})
		}
		
		// If no farm exists in database, return a helpful message
		console.log("❌ No farm data found in database")
		return NextResponse.json({ 
			farmProfile: null,
			message: "No farm profile found. Please create a farmer profile in Admin Dashboard > Farmer Profiles."
		})
	} catch (error) {
		console.error("💥 Unexpected error in profile GET:", error)
		return NextResponse.json({ 
			error: "Internal server error",
			details: String(error)
		}, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	// If an id is provided, update; otherwise insert new (upsert by id if present)
	let result
	if (body?.id) {
		result = await supabase.from("farm_profile").update({
			name: body.name,
			email: body.email,
			phone: body.phone,
			address: body.address,
			logo_url: body.logoUrl,
			description: body.description,
			owner_name: body.ownerName,
			established_date: body.establishedDate,
			status: body.status,
			rating: body.rating,
			updated_at: new Date().toISOString(),
		}).eq("id", body.id).select("*").maybeSingle()
	} else {
		result = await supabase.from("farm_profile").insert({
			id: body.id || undefined,
			name: body.name,
			email: body.email,
			phone: body.phone,
			address: body.address,
			logo_url: body.logoUrl,
			description: body.description,
			owner_name: body.ownerName,
			established_date: body.establishedDate,
			status: body.status,
			rating: body.rating,
			created_at: new Date().toISOString(),
		}).select("*").maybeSingle()
	}
	if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
	return NextResponse.json({ farmProfile: result.data })
}
