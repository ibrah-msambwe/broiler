import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	try {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
		const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? true : false
		const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? true : false

		const supabase = createServerSupabaseClient()
		// Try a lightweight query (works even if table empty)
		const { count, error } = await supabase
			.from("farm_profile")
			.select("id", { count: "exact", head: true })

		return NextResponse.json({
			ok: !error,
			url,
			anon_present: anon,
			service_present: service,
			farm_profile_count: typeof count === "number" ? count : null,
			error: error ? error.message : null,
		})
	} catch (e: any) {
		return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
	}
} 