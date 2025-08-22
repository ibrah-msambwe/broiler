import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const batchId = searchParams.get("batchId")
	if (!batchId) return NextResponse.json({ error: "batchId required" }, { status: 400 })
	const { data, error } = await supabase.from("reports").select("*").eq("batch_id", batchId).order("created_at", { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ reports: data || [] })
}

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { batchId, type, title, content, priority, fields } = body || {}
	if (!batchId || !type || !title) {
		return NextResponse.json({ error: "Missing fields" }, { status: 400 })
	}
	const { data, error } = await supabase
		.from("reports")
		.insert({
			batch_id: batchId,
			type,
			title,
			content: content || "",
			status: "Sent",
			date: new Date().toISOString().split("T")[0],
			priority: priority || "Normal",
			fields: fields || {},
		})
		.select("*")
		.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ report: data })
}

export async function PUT(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { id, batchId, title, content, status, priority, type, fields } = body || {}
	if (!id || !batchId) return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	const { data, error } = await supabase
		.from("reports")
		.update({ title, content, status, priority, type, fields })
		.eq("id", id)
		.eq("batch_id", batchId)
		.select("*")
		.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!data) return NextResponse.json({ error: "Report not found" }, { status: 404 })
	return NextResponse.json({ report: data })
}

export async function DELETE(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")
	const batchId = searchParams.get("batchId")
	if (!id || !batchId) return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	const { error } = await supabase.from("reports").delete().eq("id", id).eq("batch_id", batchId)
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ ok: true })
} 