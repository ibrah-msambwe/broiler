import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		
		// Get all batches for debugging
		const { data: batches, error } = await supabase
			.from("batches")
			.select("*")
			.limit(10)
		
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		
		return NextResponse.json({ 
			batches: batches || [],
			count: batches?.length || 0,
			message: "Debug: All batches retrieved"
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 