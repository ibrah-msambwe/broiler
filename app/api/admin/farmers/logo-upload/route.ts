import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
	try {
		const supabase = createServerSupabaseClient()
		const formData = await request.formData()
		const file = formData.get("file") as File | null
		if (!file) return NextResponse.json({ error: "file required" }, { status: 400 })

		const arrayBuffer = await file.arrayBuffer()
		const bytes = new Uint8Array(arrayBuffer)
		const ext = (file.name.split(".").pop() || "png").toLowerCase()
		const objectPath = `farm-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

		const { data, error } = await supabase.storage.from("logos").upload(objectPath, bytes, {
			contentType: file.type || "image/png",
			upsert: true,
		})
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })

		const { data: pub } = supabase.storage.from("logos").getPublicUrl(data.path)
		return NextResponse.json({ path: data.path, publicUrl: pub.publicUrl })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
} 