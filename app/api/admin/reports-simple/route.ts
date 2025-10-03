import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		console.log("🔍 Testing reports API...")
		const supabase = createServerSupabaseClient()
		
		// Simple test query
		const { data, error } = await supabase
			.from("reports")
			.select("id, type, title, status")
			.limit(5)

		if (error) {
			console.error("❌ Error fetching reports:", error)
			return NextResponse.json({ 
				error: error.message,
				details: error,
				success: false 
			}, { status: 500 })
		}

		console.log("✅ Reports fetched successfully:", data?.length || 0)
		return NextResponse.json({ 
			reports: data || [],
			success: true,
			count: data?.length || 0
		})

	} catch (error: any) {
		console.error("💥 Unexpected error in reports API:", error)
		return NextResponse.json({ 
			error: error.message,
			success: false 
		}, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	try {
		console.log("🔄 Testing report approval...")
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const { id, status, admin_comment } = body || {}

		if (!id || !status) {
			return NextResponse.json({ 
				error: "Missing required fields: id and status",
				success: false 
			}, { status: 400 })
		}

		console.log("📝 Updating report:", { id, status, admin_comment })

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

		if (error) {
			console.error("❌ Error updating report:", error)
			return NextResponse.json({ 
				error: error.message,
				details: error,
				success: false 
			}, { status: 500 })
		}

		console.log("✅ Report updated successfully:", data)
		return NextResponse.json({ 
			success: true, 
			report: data?.[0] || null,
			message: `Report ${status.toLowerCase()} successfully`
		})

	} catch (error: any) {
		console.error("💥 Unexpected error updating report:", error)
		return NextResponse.json({ 
			error: error.message,
			success: false 
		}, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		console.log("🗑️ Testing report deletion...")
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const id = searchParams.get("id")

		if (!id) {
			return NextResponse.json({ 
				error: "Report ID required",
				success: false 
			}, { status: 400 })
		}

		console.log("🗑️ Deleting report:", id)

		// Delete the report
		const { error } = await supabase
			.from("reports")
			.delete()
			.eq("id", id)

		if (error) {
			console.error("❌ Error deleting report:", error)
			return NextResponse.json({ 
				error: error.message,
				details: error,
				success: false 
			}, { status: 500 })
		}

		console.log("✅ Report deleted successfully")
		return NextResponse.json({ 
			success: true,
			message: "Report deleted successfully"
		})

	} catch (error: any) {
		console.error("💥 Unexpected error deleting report:", error)
		return NextResponse.json({ 
			error: error.message,
			success: false 
		}, { status: 500 })
	}
}
