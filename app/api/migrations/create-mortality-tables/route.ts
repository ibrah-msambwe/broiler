import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	
	try {
		// Create mortality_records table
		const { error: mortalityTableError } = await supabase.rpc('exec_sql', {
			sql: `
				CREATE TABLE IF NOT EXISTS mortality_records (
					id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
					batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
					death_count INTEGER NOT NULL CHECK (death_count > 0),
					bird_age INTEGER DEFAULT 0,
					cause VARCHAR(100) DEFAULT 'Unknown',
					location VARCHAR(200),
					description TEXT,
					report_date DATE DEFAULT CURRENT_DATE,
					created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
					updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
				);
				
				-- Create index for better performance
				CREATE INDEX IF NOT EXISTS idx_mortality_records_batch_id ON mortality_records(batch_id);
				CREATE INDEX IF NOT EXISTS idx_mortality_records_created_at ON mortality_records(created_at);
				
				-- Add mortality column to batches table if it doesn't exist
				DO $$ 
				BEGIN
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'batches' AND column_name = 'mortality'
					) THEN
						ALTER TABLE batches ADD COLUMN mortality INTEGER DEFAULT 0;
					END IF;
				END $$;
				
				-- Add bird_count column to batches table if it doesn't exist
				DO $$ 
				BEGIN
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'batches' AND column_name = 'bird_count'
					) THEN
						ALTER TABLE batches ADD COLUMN bird_count INTEGER DEFAULT 0;
					END IF;
				END $$;
				
				-- Create admin_notifications table if it doesn't exist
				CREATE TABLE IF NOT EXISTS admin_notifications (
					id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
					type VARCHAR(50) NOT NULL,
					title VARCHAR(200) NOT NULL,
					message TEXT NOT NULL,
					batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
					report_id UUID,
					priority VARCHAR(20) DEFAULT 'Normal',
					status VARCHAR(20) DEFAULT 'unread',
					urgency VARCHAR(20) DEFAULT 'normal',
					created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
					updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
				);
				
				-- Create indexes for admin_notifications
				CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
				CREATE INDEX IF NOT EXISTS idx_admin_notifications_urgency ON admin_notifications(urgency);
				CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);
				
				-- Add notification fields to reports table if they don't exist
				DO $$ 
				BEGIN
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'reports' AND column_name = 'notification_sent'
					) THEN
						ALTER TABLE reports ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;
					END IF;
					
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'reports' AND column_name = 'admin_notified'
					) THEN
						ALTER TABLE reports ADD COLUMN admin_notified BOOLEAN DEFAULT FALSE;
					END IF;
					
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'reports' AND column_name = 'batch_name'
					) THEN
						ALTER TABLE reports ADD COLUMN batch_name VARCHAR(200);
					END IF;
					
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'reports' AND column_name = 'farmer_name'
					) THEN
						ALTER TABLE reports ADD COLUMN farmer_name VARCHAR(200);
					END IF;
					
					IF NOT EXISTS (
						SELECT 1 FROM information_schema.columns 
						WHERE table_name = 'reports' AND column_name = 'urgency_level'
					) THEN
						ALTER TABLE reports ADD COLUMN urgency_level VARCHAR(20) DEFAULT 'normal';
					END IF;
				END $$;
			`
		})

		if (mortalityTableError) {
			console.error("Error creating mortality tables:", mortalityTableError)
			return NextResponse.json({ 
				error: "Failed to create mortality tables",
				details: mortalityTableError.message 
			}, { status: 500 })
		}

		// Update existing batches to have default values
		const { error: updateError } = await supabase
			.from("batches")
			.update({ 
				mortality: 0,
				bird_count: 500 // Default value, can be updated later
			})
			.is("mortality", null)

		if (updateError) {
			console.warn("Warning: Could not update existing batches:", updateError)
		}

		return NextResponse.json({
			success: true,
			message: "Mortality tracking system created successfully",
			tables_created: [
				"mortality_records",
				"admin_notifications"
			],
			columns_added: [
				"batches.mortality",
				"batches.bird_count",
				"reports.notification_sent",
				"reports.admin_notified",
				"reports.batch_name",
				"reports.farmer_name",
				"reports.urgency_level"
			]
		})

	} catch (error: any) {
		console.error("Migration error:", error)
		return NextResponse.json({ 
			error: "Migration failed",
			details: error.message 
		}, { status: 500 })
	}
} 