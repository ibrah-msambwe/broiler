import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const batchId = searchParams.get("batchId")
	if (!batchId) return NextResponse.json({ error: "batchId required" }, { status: 400 })
	const { data, error } = await supabase.from("reports").select("*").eq("batch_id", batchId).order("created_at", { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ reports: data || [] })
}

export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		console.log("📝 Report submission request:", { body })
		
		const { batchId, type, title, content, priority, fields } = body || {}
		if (!batchId || !type || !title) {
			console.error("❌ Missing required fields:", { batchId, type, title })
			return NextResponse.json({ error: "Missing fields" }, { status: 400 })
		}

		// Get batch information for notification
		console.log("🔍 Fetching batch data for batchId:", batchId)
		const { data: batchData, error: batchError } = await supabase
			.from("batches")
			.select("name, farmer_name, username")
			.eq("id", batchId)
			.single()
		
		if (batchError) {
			console.error("❌ Error fetching batch data:", batchError)
		} else {
			console.log("✅ Batch data found:", batchData)
		}

		// Create the report with enhanced metadata
		const reportData = {
			batch_id: batchId,
			type,
			title,
			content: content || "",
			status: "Pending", // Changed from "Sent" to "Pending" for admin review
			date: new Date().toISOString().split("T")[0],
			priority: priority || "Normal",
			fields: fields || {},
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			notification_sent: false,
			admin_notified: false,
			batch_name: batchData?.name || "Unknown Batch",
			farmer_name: batchData?.farmer_name || "Unknown Farmer",
			urgency_level: priority === "High" || priority === "Critical" ? "urgent" : "normal"
		}

		console.log("💾 Inserting report data:", reportData)
		const { data, error } = await supabase
			.from("reports")
			.insert(reportData)
			.select("*")
			.maybeSingle()

		if (error) {
			console.error("❌ Error inserting report:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		
		console.log("✅ Report inserted successfully:", data)

		// Process report intelligently to update batch statistics
		try {
			console.log("🤖 Processing report intelligently...")
			const processResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/reports/process-intelligent`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					reportId: data.id,
					batchId: batchId,
					reportType: type,
					reportData: fields || {}
				})
			})
			
			if (processResponse.ok) {
				const processResult = await processResponse.json()
				console.log("✅ Intelligent processing completed:", processResult)
			} else {
				console.warn("⚠️ Intelligent processing failed, but report was saved")
			}
		} catch (processError) {
			console.warn("⚠️ Error in intelligent processing:", processError)
		}

		// Create admin notification
		try {
			console.log("🔔 Creating admin notification...")
			await supabase.from("admin_notifications").insert({
				type: "new_report",
				title: `New ${priority} Priority Report`,
				message: `${batchData?.farmer_name || "Farmer"} submitted: ${title}`,
				batch_id: batchId,
				report_id: data?.id,
				priority: priority,
				status: "unread",
				created_at: new Date().toISOString(),
				urgency: priority === "High" || priority === "Critical" ? "high" : "normal"
			})
			console.log("✅ Admin notification created")
		} catch (notifError) {
			console.warn("⚠️ Failed to create admin notification:", notifError)
		}

		// Log the report submission for monitoring
		console.log(`🚨 NEW REPORT SUBMITTED: ${priority} priority - ${title} from ${batchData?.farmer_name} (Batch: ${batchData?.name})`)

		return NextResponse.json({ 
			report: data,
			message: "Report submitted successfully. Admin has been notified.",
			admin_notified: true
		})
	} catch (error) {
		console.error("💥 Unexpected error in report submission:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { id, batchId, title, content, status, priority, type, fields } = body || {}
	if (!id || !batchId) return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	const { data, error } = await supabase
		.from("reports")
		.update({ title, content, status, priority, type, fields })
		.eq("id", id)
		.eq("batch_id", batchId)
		.select("*")
		.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!data) return NextResponse.json({ error: "Report not found" }, { status: 404 })
	return NextResponse.json({ report: data })
}

export async function DELETE(request: NextRequest) {
	// Report deletion is restricted - users must contact admin
	return NextResponse.json({ 
		error: "Report deletion is not allowed. Please contact Tariq (System Admin) for assistance.",
		contact: "tariq@admin.com or call +255-XXX-XXXX",
		restricted: true
	}, { status: 403 })
} 