import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const batchId = searchParams.get("batchId")
	if (!batchId) return NextResponse.json({ error: "batchId required" }, { status: 400 })
	const { data, error } = await supabase.from("messages").select("*").eq("batch_id", batchId).order("created_at", { ascending: false })
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ messages: data || [] })
}

export async function POST(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { batchId, subject, content } = body || {}
	if (!batchId || !subject || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
	const { data, error } = await supabase
		.from("messages")
		.insert({ batch_id: batchId, subject, content, status: "Sent" })
		.select("*")
		.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ message: data })
}

export async function PUT(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const body = await request.json()
	const { id, batchId, subject, content, status } = body || {}
	if (!id || !batchId) return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	const { data, error } = await supabase
		.from("messages")
		.update({ subject, content, status })
		.eq("id", id)
		.eq("batch_id", batchId)
		.select("*")
		.maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	if (!data) return NextResponse.json({ error: "Message not found" }, { status: 404 })
	return NextResponse.json({ message: data })
}

export async function DELETE(request: NextRequest) {
	const supabase = createServerSupabaseClient()
	const { searchParams } = new URL(request.url)
	const id = searchParams.get("id")
	const batchId = searchParams.get("batchId")
	if (!id || !batchId) return NextResponse.json({ error: "id and batchId required" }, { status: 400 })
	const { error } = await supabase.from("messages").delete().eq("id", id).eq("batch_id", batchId)
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json({ ok: true })
} 