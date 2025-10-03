import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { batchId, approve, adminName } = body || {}

		if (!batchId) {
			return NextResponse.json({ error: "batchId is required" }, { status: 400 })
		}

		const supabase = createServerSupabaseClient()
		
		// Update batch approval status
		const { data, error } = await supabase
			.from("batches")
			.update({
				is_approved: approve !== false, // Default to true
				approved_at: approve !== false ? new Date().toISOString() : null,
				approved_by: approve !== false ? (adminName || "Admin") : null,
				updated_at: new Date().toISOString()
			})
			.eq("id", batchId)
			.select("*")
			.maybeSingle()

		if (error) {
			console.error("Error updating batch approval:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log(`✅ Batch ${approve !== false ? 'approved' : 'unapproved'}:`, data?.name)

		return NextResponse.json({ 
			success: true,
			batch: data,
			message: `User ${approve !== false ? 'approved' : 'unapproved'} successfully`
		})
	} catch (e: any) {
		console.error("Error in approve-user route:", e)
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

// GET - Get all pending approval users
export async function GET() {
	try {
		const supabase = createServerSupabaseClient()
		
		const { data, error } = await supabase
			.from("batches")
			.select("*")
			.eq("is_approved", false)
			.order("created_at", { ascending: false })

		if (error) {
			console.error("Error fetching pending users:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ 
			pendingUsers: data || [],
			count: data?.length || 0
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

