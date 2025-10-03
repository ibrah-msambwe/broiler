import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const { startDate, endDate, reportTypes } = body || {}

		console.log("📊 Exporting all reports...")

		// Build query with filters
		let query = supabase.from("reports").select("*").order("created_at", { ascending: false })

		// Apply date filters if provided
		if (startDate) {
			query = query.gte("created_at", startDate)
		}
		if (endDate) {
			query = query.lte("created_at", endDate)
		}

		// Apply report type filter if provided
		if (reportTypes && reportTypes.length > 0) {
			query = query.in("type", reportTypes)
		}

		const { data: reports, error } = await query

		if (error) {
			console.error("❌ Error fetching reports:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log(`✅ Found ${reports?.length || 0} reports to export`)

		// Generate comprehensive HTML report
		const html = generateAllReportsHTML(reports || [])

		return NextResponse.json({
			success: true,
			html,
			count: reports?.length || 0
		})

	} catch (error) {
		console.error("💥 Unexpected error exporting reports:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}

function generateAllReportsHTML(reports: any[]) {
	const currentDate = new Date().toLocaleDateString()
	const currentTime = new Date().toLocaleTimeString()

	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TARIQ Broiler - All Reports Export</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.2; 
            color: #000; 
            background: #fff;
            font-size: 10px;
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 10mm; 
            background: #fff;
            border: 2px solid #2563eb;
            border-radius: 8px;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #2563eb; 
            padding-bottom: 8px; 
            margin-bottom: 10px; 
        }
        .classification {
            text-align: left;
            font-size: 8px;
            color: #666;
            margin-bottom: 5px;
        }
        .logos {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 15px;
            margin-bottom: 8px;
        }
        .logo {
            font-size: 14px;
            font-weight: bold;
        }
        .tariq-logo { color: #dc2626; }
        .broiler-logo { color: #059669; }
        .main-title { 
            font-size: 14px; 
            font-weight: bold; 
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        .subtitle { 
            font-size: 9px; 
            font-style: italic;
            color: #333;
        }
        .section { 
            margin: 8px 0; 
            background: #dbeafe;
        }
        .section-title { 
            font-size: 10px; 
            font-weight: bold; 
            background: #3b82f6;
            color: white;
            padding: 6px 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .section-content {
            padding: 8px;
            background: #dbeafe;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 8px 0;
        }
        .summary-item {
            background: white;
            padding: 8px;
            border-radius: 4px;
            text-align: center;
            border: 1px solid #2563eb;
        }
        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
        }
        .summary-label {
            font-size: 8px;
            color: #6b7280;
            margin-top: 2px;
        }
        .report-item {
            background: white;
            margin: 6px 0;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }
        .report-title {
            font-weight: bold;
            font-size: 11px;
            color: #1f2937;
        }
        .report-meta {
            font-size: 8px;
            color: #6b7280;
        }
        .report-content {
            font-size: 9px;
            color: #374151;
            margin-top: 4px;
            line-height: 1.3;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-rejected { background: #fecaca; color: #991b1b; }
        .declaration {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            padding: 8px;
            margin: 8px 0;
            font-size: 9px;
            line-height: 1.3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="classification">C1: FOR INTERNAL USE ONLY</div>
        
        <div class="logos">
            <div class="logo tariq-logo">TARIQ</div>
            <div class="logo broiler-logo">BROILER</div>
        </div>
        
        <div class="header">
            <div class="main-title">TARIQ BROILER ALL REPORTS EXPORT</div>
            <div class="subtitle">Comprehensive Report Collection - ${currentDate}</div>
        </div>

        <div class="section">
            <div class="section-title">EXPORT SUMMARY</div>
            <div class="section-content">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">${reports.length}</div>
                        <div class="summary-label">Total Reports</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${reports.filter(r => r.status === 'Pending').length}</div>
                        <div class="summary-label">Pending</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${reports.filter(r => r.status === 'Approved').length}</div>
                        <div class="summary-label">Approved</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${reports.filter(r => r.status === 'Rejected').length}</div>
                        <div class="summary-label">Rejected</div>
                    </div>
                </div>
                <div style="margin-top: 8px; font-size: 9px; color: #666;">
                    Export Generated: ${currentDate} at ${currentTime} | Total Reports: ${reports.length}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">ALL REPORTS DETAILS</div>
            <div class="section-content">
                ${reports.map((report, index) => `
                <div class="report-item">
                    <div class="report-header">
                        <div class="report-title">#${index + 1} - ${report.title}</div>
                        <div class="report-meta">
                            <span class="status-badge status-${report.status.toLowerCase()}">${report.status}</span>
                            ${report.priority} | ${report.type}
                        </div>
                    </div>
                    <div style="font-size: 8px; color: #6b7280; margin-bottom: 4px;">
                        <strong>Farmer:</strong> ${report.farmer_name} | 
                        <strong>Batch:</strong> ${report.batch_name} | 
                        <strong>Date:</strong> ${report.date || 'N/A'} | 
                        <strong>ID:</strong> ${report.id}
                    </div>
                    <div class="report-content">
                        ${report.content || 'No content available'}
                    </div>
                    ${report.admin_comment ? `
                    <div style="margin-top: 4px; padding: 4px; background: #fef3c7; border-radius: 2px; font-size: 8px;">
                        <strong>Admin Comment:</strong> ${report.admin_comment}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>
        </div>

        <div class="declaration">
            This comprehensive report contains ${reports.length} reports exported from the TARIQ Broiler Management System. 
            All data is accurate as of ${currentDate} at ${currentTime}. This export includes all report types, 
            statuses, and administrative comments for complete documentation and record keeping.
        </div>
    </div>
</body>
</html>
	`
}