import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		
		// Get all reports
		const { data, error } = await supabase
			.from("reports")
			.select("*")
			.order("created_at", { ascending: false })

		if (error) {
			console.error("❌ Error fetching reports:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		// Transform the data to match the expected format
		const reports = (data || []).map((report: any) => ({
			id: report.id,
			batch_id: report.batch_id,
			batch_name: report.batch_name || "Unknown Batch",
			farmer_name: report.farmer_name || "Unknown Farmer",
			type: report.type,
			title: report.title,
			content: report.content,
			status: report.status,
			date: report.date,
			priority: report.priority,
			fields: report.fields || {},
			admin_comment: report.admin_comment,
			created_at: report.created_at,
			updated_at: report.updated_at,
			notification_sent: report.notification_sent,
			admin_notified: report.admin_notified,
			urgency_level: report.urgency_level
		}))

		console.log("✅ Admin reports fetched:", reports.length)
		return NextResponse.json({ reports })
	} catch (error) {
		console.error("💥 Unexpected error in admin reports:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const { id, status, admin_comment } = body || {}

		if (!id || !status) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
		}

		console.log("🔄 Updating report:", { id, status, admin_comment })

		// Update the report
		const { data, error } = await supabase
			.from("reports")
			.update({
				status: status,
				admin_comment: admin_comment || null,
				updated_at: new Date().toISOString()
			})
			.eq("id", id)
			.select("*")
			.single()

		if (error) {
			console.error("❌ Error updating report:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log("✅ Report updated successfully:", data)
		return NextResponse.json({ 
			success: true, 
			report: data,
			message: `Report ${status.toLowerCase()} successfully`
		})

	} catch (error) {
		console.error("💥 Unexpected error updating report:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const id = searchParams.get("id")

		if (!id) {
			return NextResponse.json({ error: "Report ID required" }, { status: 400 })
		}

		console.log("🗑️ Deleting report:", id)

		// Delete the report
		const { error } = await supabase
			.from("reports")
			.delete()
			.eq("id", id)

		if (error) {
			console.error("❌ Error deleting report:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log("✅ Report deleted successfully")
		return NextResponse.json({ 
			success: true,
			message: "Report deleted successfully"
		})

	} catch (error) {
		console.error("💥 Unexpected error deleting report:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}