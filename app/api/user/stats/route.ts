import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const batchId = searchParams.get("batchId")
	if (!batchId) return NextResponse.json({ error: "batchId required" }, { status: 400 })
	const { data: batch, error } = await supabase.from("batches").select("id,start_date,bird_count,mortality,feed_used").eq("id", batchId).maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 })
	const daysSinceStart = (() => {
		try {
			const start = new Date(batch.start_date as any)
			const diffMs = Date.now() - start.getTime()
			return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
		} catch {
			return 0
		}
	})()
	return NextResponse.json({
		stats: {
			totalChicks: batch.bird_count || 0,
			daysSinceStart,
			totalMortality: batch.mortality || 0,
			totalFeedBagsUsed: batch.feed_used || 0,
		},
	})
}
