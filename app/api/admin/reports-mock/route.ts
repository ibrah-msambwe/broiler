import { type NextRequest, NextResponse } from "next/server"

// Mock data for testing
const mockReports = [
  {
    id: "1",
    batch_id: "batch-1",
    batch_name: "Test Batch 1",
    farmer_name: "John Doe",
    type: "Mortality",
    title: "Daily Mortality Report",
    content: "5 birds died today due to heat stress",
    status: "Pending",
    date: new Date().toISOString(),
    priority: "High",
    fields: { mortalityCount: 5, cause: "Heat stress" },
    admin_comment: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notification_sent: false,
    admin_notified: false,
    urgency_level: "urgent"
  },
  {
    id: "2",
    batch_id: "batch-1",
    batch_name: "Test Batch 1",
    farmer_name: "John Doe",
    type: "Feed",
    title: "Feed Consumption Report",
    content: "Used 50kg of feed today",
    status: "Approved",
    date: new Date().toISOString(),
    priority: "Normal",
    fields: { feedAmount: 50, feedType: "Starter" },
    admin_comment: "Good feed efficiency",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notification_sent: true,
    admin_notified: true,
    urgency_level: "normal"
  }
]

export async function GET(request: NextRequest) {
	try {
		console.log("🔍 Mock reports API - GET")
		
		// Simulate some delay
		await new Promise(resolve => setTimeout(resolve, 100))
		
		console.log("✅ Mock reports fetched successfully:", mockReports.length)
		return NextResponse.json({ 
			reports: mockReports,
			success: true,
			count: mockReports.length
		})

	} catch (error: any) {
		console.error("💥 Unexpected error in mock reports API:", error)
		return NextResponse.json({ 
			error: error.message,
			success: false 
		}, { status: 500 })
	}
}

export async function PUT(request: NextRequest) {
	try {
		console.log("🔄 Mock report approval...")
		const body = await request.json()
		const { id, status, admin_comment } = body || {}

		if (!id || !status) {
			return NextResponse.json({ 
				error: "Missing required fields: id and status",
				success: false 
			}, { status: 400 })
		}

		console.log("📝 Updating mock report:", { id, status, admin_comment })

		// Find and update the report
		const reportIndex = mockReports.findIndex(r => r.id === id)
		if (reportIndex === -1) {
			return NextResponse.json({ 
				error: "Report not found",
				success: false 
			}, { status: 404 })
		}

		// Update the report
		mockReports[reportIndex] = {
			...mockReports[reportIndex],
			status: status as any,
			admin_comment: admin_comment || null,
			updated_at: new Date().toISOString()
		}

		console.log("✅ Mock report updated successfully:", mockReports[reportIndex])
		return NextResponse.json({ 
			success: true, 
			report: mockReports[reportIndex],
			message: `Report ${status.toLowerCase()} successfully`
		})

	} catch (error: any) {
		console.error("💥 Unexpected error updating mock report:", error)
		return NextResponse.json({ 
			error: error.message,
			success: false 
		}, { status: 500 })
	}
}

export async function DELETE(request: NextRequest) {
	try {
		console.log("🗑️ Mock report deletion...")
		const { searchParams } = new URL(request.url)
		const id = searchParams.get("id")

		if (!id) {
			return NextResponse.json({ 
				error: "Report ID required",
				success: false 
			}, { status: 400 })
		}

		console.log("🗑️ Deleting mock report:", id)

		// Find and remove the report
		const reportIndex = mockReports.findIndex(r => r.id === id)
		if (reportIndex === -1) {
			return NextResponse.json({ 
				error: "Report not found",
				success: false 
			}, { status: 404 })
		}

		// Remove the report
		const deletedReport = mockReports.splice(reportIndex, 1)[0]

		console.log("✅ Mock report deleted successfully:", deletedReport)
		return NextResponse.json({ 
			success: true,
			message: "Report deleted successfully",
			deletedReport
		})

	} catch (error: any) {
		console.error("💥 Unexpected error deleting mock report:", error)
		return NextResponse.json({ 
			error: error.message,
			success: false 
		}, { status: 500 })
	}
}
