import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase.from("farm_profile").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ farmProfile: data || null })
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
		}).select("*").maybeSingle()
	}
	if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
	return NextResponse.json({ farmProfile: result.data })
}
