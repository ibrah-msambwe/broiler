import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Get all conversations for a user
export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get("userId")

		if (!userId) {
			return NextResponse.json({ error: "userId required" }, { status: 400 })
		}

		console.log("Fetching conversations for userId:", userId)

		const { data, error } = await supabase
			.from("conversations")
			.select("*")
			.or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
			.order("last_message_at", { ascending: false })

		if (error) {
			console.error("Error fetching conversations:", error)
			
			// If table doesn't exist, return empty array instead of error
			if (error.message.includes("relation") && error.message.includes("does not exist") || 
				error.message.includes("Could not find the table") ||
				error.message.includes("schema cache")) {
				console.warn("Conversations table does not exist, returning empty array")
				return NextResponse.json({ 
					conversations: [],
					message: "Chat tables not initialized. Please contact admin to set up chat functionality."
				})
			}
			
			// If it's a permission error, also return empty array
			if (error.message.includes("permission") || error.message.includes("auth")) {
				console.warn("Permission error fetching conversations, returning empty array")
				return NextResponse.json({ 
					conversations: [],
					message: "No conversations available."
				})
			}
			
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log("Conversations fetched successfully:", data?.length || 0)
		return NextResponse.json({ conversations: data || [] })
	} catch (e: any) {
		console.error("Unexpected error in conversations API:", e)
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

// Create a new conversation
export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const {
			participant1Id,
			participant2Id,
			participant1Name,
			participant2Name
		} = body || {}

		if (!participant1Id || !participant2Id || !participant1Name || !participant2Name) {
			return NextResponse.json({ 
				error: "participant1Id, participant2Id, participant1Name, and participant2Name are required" 
			}, { status: 400 })
		}

		// Check if conversation already exists
		const { data: existingConversation } = await supabase
			.from("conversations")
			.select("id")
			.or(`and(participant_1_id.eq.${participant1Id},participant_2_id.eq.${participant2Id}),and(participant_1_id.eq.${participant2Id},participant_2_id.eq.${participant1Id})`)
			.single()

		if (existingConversation) {
			return NextResponse.json({ conversation: existingConversation })
		}

		// Create new conversation
		const { data: conversationData, error: conversationError } = await supabase
			.from("conversations")
			.insert({
				participant_1_id: participant1Id,
				participant_2_id: participant2Id,
				participant_1_name: participant1Name,
				participant_2_name: participant2Name
			})
			.select("*")
			.single()

		if (conversationError) {
			return NextResponse.json({ error: conversationError.message }, { status: 500 })
		}

		return NextResponse.json({ conversation: conversationData })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}
