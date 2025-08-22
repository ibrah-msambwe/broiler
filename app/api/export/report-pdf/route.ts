import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	try {
		const { report } = await request.json()
		const pdfContent = `
# TARIQ - Report Export

Export Date: ${new Date().toLocaleString()}

Report
- Type: ${report.type}
- Title: ${report.title}
- Batch: ${report.batchId}
- Date: ${report.date || new Date().toISOString().split("T")[0]}
- Priority: ${report.priority}

Introduction / Summary
${report.content || ""}

Fields
${Object.entries(report.fields || {})
	.map(([k, v]: any) => `- ${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
	.join("\n")}
`
		const blob = new Blob([pdfContent], { type: "application/pdf" })
		return new NextResponse(blob, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="report-${report.type || "export"}-${new Date().toISOString().split("T")[0]}.pdf"`,
			},
		})
	} catch (error) {
		console.error("Report PDF export failed:", error)
		return NextResponse.json({ error: "Failed to export report PDF" }, { status: 500 })
	}
} 