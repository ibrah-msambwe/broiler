import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase
		.from("farm")
		.select("*")
		.order("created_at", { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ farmers: data || [] })
}

export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const {
			id,
			name,
			email,
			phone,
			address,
			logoUrl,
			description,
			ownerName,
			establishedDate,
			status,
			rating,
		} = body || {}
		if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

		const row = {
			name,
			email: email || null,
			phone: phone || null,
			address: address || null,
			logo_url: logoUrl || null,
			description: description || null,
			owner_name: ownerName || null,
			established_date: establishedDate || null,
			status: status || null,
			rating: Number.isFinite(Number(rating)) ? Number(rating) : null,
			updated_at: new Date().toISOString(),
		}

		let result
		if (id) {
			result = await supabase
				.from("farm")
				.update(row)
				.eq("id", id)
				.select("*")
				.maybeSingle()
		} else {
			result = await supabase
				.from("farm")
				.insert(row)
				.select("*")
				.maybeSingle()
		}
		const { data, error } = result
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })
		return NextResponse.json({ farmer: data })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 