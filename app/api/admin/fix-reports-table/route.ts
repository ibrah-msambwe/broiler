import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		
		console.log("🔧 Fixing reports table schema...")
		
		// Add missing columns to reports table
		const { error } = await supabase.rpc('exec_sql', {
			sql: `
				ALTER TABLE reports 
				ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
				ADD COLUMN IF NOT EXISTS admin_comment TEXT;
			`
		})

		if (error) {
			console.error("❌ Error fixing reports table:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log("✅ Reports table fixed successfully")
		return NextResponse.json({ 
			success: true,
			message: "Reports table schema fixed successfully"
		})

	} catch (error) {
		console.error("💥 Unexpected error fixing reports table:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}

export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		
		// Check the current schema of reports table
		const { data, error } = await supabase
			.from("reports")
			.select("*")
			.limit(1)

		if (error) {
			console.error("❌ Error checking reports table:", error)
			return NextResponse.json({ 
				error: error.message,
				missing_columns: ["updated_at", "admin_comment"]
			}, { status: 500 })
		}

		// Check if required columns exist
		const sampleReport = data?.[0]
		const hasUpdatedAt = sampleReport && 'updated_at' in sampleReport
		const hasAdminComment = sampleReport && 'admin_comment' in sampleReport

		return NextResponse.json({ 
			table_exists: true,
			has_updated_at: hasUpdatedAt,
			has_admin_comment: hasAdminComment,
			sample_columns: Object.keys(sampleReport || {}),
			missing_columns: [
				...(!hasUpdatedAt ? ['updated_at'] : []),
				...(!hasAdminComment ? ['admin_comment'] : [])
			]
		})

	} catch (error) {
		console.error("💥 Unexpected error checking reports table:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
