import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()

	type TableSpec = { name: string; requiredColumns: string[] }
	const expected: TableSpec[] = [
		{
			name: "candidates",
			requiredColumns: [
				"contact_name",
				"email",
				"batch_name",
				"username",
				"password",
				"status",
			],
		},
		{
			name: "batches",
			requiredColumns: [
				"name",
				"farmer_name",
				"start_date",
				"bird_count",
				"status",
				"mortality",
				"feed_used",
				"health_status",
				"temperature",
				"humidity",
				"username",
				"password",
				"color",
				"expected_harvest_date",
				"current_weight",
				"feed_conversion_ratio",
				"vaccinations",
				"last_health_check",
			],
		},
		{
			name: "farm_profile",
			requiredColumns: [
				"name",
				"email",
				"phone",
				"address",
				"logo_url",
				"description",
				"owner_name",
				"established_date",
				"status",
				"rating",
			],
		},
		{
			name: "reports",
			requiredColumns: [
				"batch_id",
				"type",
				"title",
				"content",
				"status",
				"date",
				"priority",
				"fields",
			],
		},
		{
			name: "messages",
			requiredColumns: [
				"batch_id",
				"subject",
				"content",
				"status",
			],
		},
		{
			name: "profiles",
			requiredColumns: [
				"username",
				"email",
				"role",
			],
		},
	]

	async function tableExists(table: string): Promise<{ exists: boolean; error?: string }> {
		const { error } = await supabase.from(table as any).select("id", { count: "exact", head: true }).limit(1)
		if (error) {
			// PostgREST returns error for missing table or missing column; treat "does not exist" as table missing
			if (String(error.message || "").toLowerCase().includes("does not exist")) {
				return { exists: false }
			}
			// Could be other error (e.g., permission). Assume table exists but blocked
			return { exists: true, error: error.message }
		}
		return { exists: true }
	}

	async function columnExists(table: string, column: string): Promise<boolean> {
		const { error } = await supabase.from(table as any).select(column, { head: true }).limit(1)
		return !error
	}

	const results: Record<string, { ok: boolean; tableMissing: boolean; missingColumns: string[]; notes?: string }> = {}

	for (const spec of expected) {
		const t = spec.name
		const { exists, error } = await tableExists(t)
		if (!exists) {
			results[t] = { ok: false, tableMissing: true, missingColumns: spec.requiredColumns }
			continue
		}
		const missing: string[] = []
		for (const col of spec.requiredColumns) {
			const ok = await columnExists(t, col)
			if (!ok) missing.push(col)
		}
		results[t] = {
			ok: missing.length === 0,
			tableMissing: false,
			missingColumns: missing,
			notes: error ? `access error: ${error}` : undefined,
		}
	}

	return NextResponse.json({
		ok: Object.values(results).every((r) => r.ok && !r.tableMissing),
		url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		service_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
		results,
	})
} 