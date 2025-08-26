import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()
	const { data, error } = await supabase
		.from("farm")
		.select("id,name,email,phone,address,logo_url,description,owner_name,established_date,status,rating")
		.limit(1)
		.maybeSingle()

	if (error) return NextResponse.json({ error: error.message }, { status: 500 })

	const farmProfile = data
		? {
			id: data.id,
			name: data.name,
			email: data.email,
			phone: data.phone,
			address: data.address,
			logoUrl: data.logo_url ?? null,
			description: data.description ?? null,
			ownerName: data.owner_name ?? null,
			establishedDate: data.established_date ?? null,
			status: data.status ?? null,
			rating: typeof data.rating === "number" ? data.rating : data.rating ?? null,
		}
		: null

	return NextResponse.json({ farmProfile })
} 