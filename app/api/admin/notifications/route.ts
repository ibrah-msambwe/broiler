import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	
	try {
		// Get all unread notifications, ordered by priority and creation time
		const { data: notifications, error } = await supabase
			.from("admin_notifications")
			.select("*")
			.order("urgency", { ascending: false }) // High urgency first
			.order("created_at", { ascending: false }) // Newest first
			.limit(50) // Limit to prevent overwhelming

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		// Get unread count
		const { count: unreadCount } = await supabase
			.from("admin_notifications")
			.select("*", { count: "exact", head: true })
			.eq("status", "unread")

		return NextResponse.json({
			notifications: notifications || [],
			unread_count: unreadCount || 0,
			total_count: notifications?.length || 0
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { id, status } = body || {}

	if (!id || !status) {
		return NextResponse.json({ error: "id and status required" }, { status: 400 })
	}

	try {
		const { data, error } = await supabase
			.from("admin_notifications")
			.update({ 
				status: status,
				updated_at: new Date().toISOString()
			})
			.eq("id", id)
			.select("*")
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ notification: data })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")

	if (!id) {
		return NextResponse.json({ error: "id required" }, { status: 400 })
	}

	try {
		const { error } = await supabase
			.from("admin_notifications")
			.delete()
			.eq("id", id)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ ok: true })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 