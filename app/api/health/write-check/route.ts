import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
	const supabase = createServerSupabaseClient()

	const results: Record<string, { ok: boolean; error?: string }> = {}

	async function testCandidates() {
		try {
			const marker = `diag-${Date.now()}`
			const { data, error } = await supabase
				.from("candidates")
				.insert({
					contact_name: marker,
					email: `${marker}@test.local`,
					batch_name: marker,
					username: marker,
					password: "test",
					status: "Pending",
				})
				.select("id")
				.maybeSingle()
			if (error) {
				results.candidates = { ok: false, error: error.message }
				return
			}
			if (data?.id) {
				await supabase.from("candidates").delete().eq("id", data.id)
			}
			results.candidates = { ok: true }
		} catch (e: any) {
			results.candidates = { ok: false, error: String(e?.message || e) }
		}
	}

	async function testBatches() {
		try {
			const marker = `diag-${Date.now()}`
			const { data, error } = await supabase
				.from("batches")
				.insert({
					name: marker,
					farmer_name: marker,
					start_date: new Date().toISOString().split("T")[0],
					bird_count: 0,
					status: "Planning",
				})
				.select("id")
				.maybeSingle()
			if (error) {
				results.batches = { ok: false, error: error.message }
				return
			}
			if (data?.id) {
				await supabase.from("batches").delete().eq("id", data.id)
			}
			results.batches = { ok: true }
		} catch (e: any) {
			results.batches = { ok: false, error: String(e?.message || e) }
		}
	}

	async function testFarmProfile() {
		try {
			const marker = `diag-${Date.now()}`
			const { data, error } = await supabase
				.from("farm_profile")
				.insert({
					name: marker,
					email: `${marker}@test.local`,
					phone: "+255000000000",
					address: "Test Address",
				})
				.select("id")
				.maybeSingle()
			if (error) {
				results.farm_profile = { ok: false, error: error.message }
				return
			}
			if (data?.id) {
				await supabase.from("farm_profile").delete().eq("id", data.id)
			}
			results.farm_profile = { ok: true }
		} catch (e: any) {
			results.farm_profile = { ok: false, error: String(e?.message || e) }
		}
	}

	await Promise.all([testCandidates(), testBatches(), testFarmProfile()])

	return NextResponse.json({
		ok: Object.values(results).every((r) => r.ok),
		service_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
		url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
		results,
	})
} 