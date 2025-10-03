import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	
	try {
		// Create reports table
		const { error: reportsTableError } = await supabase.rpc('exec_sql', {
			sql: `
				CREATE TABLE IF NOT EXISTS reports (
					id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
					batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
					type VARCHAR(50) NOT NULL,
					title VARCHAR(200) NOT NULL,
					content TEXT,
					status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
					date DATE DEFAULT CURRENT_DATE,
					priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent', 'Critical')),
					fields JSONB DEFAULT '{}',
					created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
					updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
					notification_sent BOOLEAN DEFAULT FALSE,
					admin_notified BOOLEAN DEFAULT FALSE,
					batch_name VARCHAR(200),
					farmer_name VARCHAR(200),
					urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('normal', 'urgent'))
				);
				
				-- Create indexes for better performance
				CREATE INDEX IF NOT EXISTS idx_reports_batch_id ON reports(batch_id);
				CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
				CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
				CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
				CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
				CREATE INDEX IF NOT EXISTS idx_reports_urgency_level ON reports(urgency_level);
			`
		})

		if (reportsTableError) {
			console.error("Error creating reports table:", reportsTableError)
			return NextResponse.json({
				success: false,
				error: reportsTableError.message,
				message: "Failed to create reports table"
			}, { status: 500 })
		}

		console.log("✅ Reports table created successfully")
		return NextResponse.json({
			success: true,
			message: "Reports table created successfully"
		})

	} catch (error: any) {
		console.error("Migration error:", error)
		return NextResponse.json({
			success: false,
			error: error.message,
			message: "Migration failed"
		}, { status: 500 })
	}
}
