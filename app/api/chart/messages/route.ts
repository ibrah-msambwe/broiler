import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Helper function to check and create table if needed
async function ensureTableExists(supabase: any): Promise<boolean> {
	try {
		// Quick check if table exists
		const { error: checkError } = await supabase
			.from("chart_messages")
			.select("id")
			.limit(1)

		if (!checkError) {
			return true // Table exists
		}

		// Table doesn't exist, try to create via API
		console.log("🔧 Attempting to auto-create chat tables...")
		
		const createResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/setup/chat-system`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		})

		if (createResponse.ok) {
			console.log("✅ Tables created successfully!")
			return true
		}

		return false
	} catch (error) {
		console.error("❌ Error ensuring table exists:", error)
		return false
	}
}

// Get all messages for a user
export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get("userId")
		const otherUserId = searchParams.get("otherUserId")

		if (!userId) {
			return NextResponse.json({ error: "userId required" }, { status: 400 })
		}

		console.log(`🔍 Loading messages for userId: ${userId}${otherUserId ? `, with otherUserId: ${otherUserId}` : ''}`)

		let query = supabase
			.from("chart_messages")
			.select("*")
			.order("created_at", { ascending: true })

		// If otherUserId is provided, get messages between these two users only
		if (otherUserId) {
			query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
			console.log(`🔍 Query: Messages between ${userId} and ${otherUserId}`)
		} else {
			// Otherwise, get all messages involving this user
			query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
			console.log(`🔍 Query: All messages for ${userId}`)
		}

		const { data, error } = await query

		if (error) {
			console.error("❌ Error fetching messages:", error)
			
			// If table doesn't exist, return empty array (table will be created on first message send)
			if (error.message.includes("relation") && error.message.includes("does not exist") ||
				error.message.includes("Could not find the table") ||
				error.message.includes("schema cache") ||
				error.message.includes("relation \"chart_messages\" does not exist")) {
				console.warn("⚠️ Chart_messages table does not exist, returning empty array")
				return NextResponse.json({ 
					messages: [],
					needsSetup: true
				})
			}
			
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log(`✅ Messages fetched successfully: ${data?.length || 0} messages`)
		
		return NextResponse.json({ messages: data || [] })
	} catch (e: any) {
		console.error("💥 Unexpected error:", e)
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

// Send a new message
export async function POST(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const {
			senderId,
			receiverId,
			senderName,
			receiverName,
			message,
			messageType = "text",
			batchId,
			isAdminMessage = false
		} = body || {}

		console.log("📤 Sending message:", { 
			from: `${senderName} (${senderId})`, 
			to: `${receiverName} (${receiverId})`, 
			messagePreview: message?.substring(0, 50) + "..."
		})

		if (!senderId || !receiverId || !senderName || !receiverName || !message) {
			console.error("❌ Missing required fields")
			return NextResponse.json({ 
				error: "senderId, receiverId, senderName, receiverName, and message are required" 
			}, { status: 400 })
		}

		// Insert the message directly (no need for conversations table complexity)
		const { data: messageData, error: messageError } = await supabase
			.from("chart_messages")
			.insert({
				sender_id: senderId,
				receiver_id: receiverId,
				sender_name: senderName,
				receiver_name: receiverName,
				message,
				message_type: messageType,
				batch_id: batchId || null,
				is_admin_message: isAdminMessage,
				is_read: false
			})
			.select("*")
			.single()

		if (messageError) {
			console.error("❌ Error inserting message:", messageError)
			console.error("Error details:", JSON.stringify(messageError, null, 2))
			
			// If table doesn't exist, try to create it automatically
			if (messageError.message.includes("relation") && messageError.message.includes("does not exist") ||
				messageError.message.includes("Could not find the table") ||
				messageError.message.includes("schema cache") ||
				messageError.message.includes("relation \"chart_messages\" does not exist")) {
				
				console.warn("⚠️ Chart_messages table does not exist - attempting auto-setup...")
				
				// Try to ensure table exists
				const tableCreated = await ensureTableExists(supabase)
				
				if (tableCreated) {
					// Retry the insert
					console.log("🔄 Retrying message insert after table creation...")
					const { data: retryData, error: retryError } = await supabase
						.from("chart_messages")
						.insert({
							sender_id: senderId,
							receiver_id: receiverId,
							sender_name: senderName,
							receiver_name: receiverName,
							message,
							message_type: messageType,
							batch_id: batchId || null,
							is_admin_message: isAdminMessage,
							is_read: false
						})
						.select("*")
						.single()

					if (!retryError && retryData) {
						console.log(`✅ Message sent successfully after auto-setup! ID: ${retryData.id}`)
						return NextResponse.json({ 
							success: true,
							message: retryData,
							autoSetup: true
						})
					}
				}
				
				// If auto-setup failed, return helpful error
				return NextResponse.json({ 
					error: "Chat system not initialized",
					details: "Please visit /setup-chat to set up the chat system",
					setupUrl: "/setup-chat"
				}, { status: 500 })
			}
			
			// Check for RLS policy errors
			if (messageError.message.includes("policy") || 
			    messageError.message.includes("permission denied") ||
			    messageError.message.includes("RLS")) {
				console.warn("⚠️ Row Level Security (RLS) is blocking the insert")
				return NextResponse.json({ 
					error: "Permission denied",
					details: "Please visit /setup-chat to fix permissions",
					setupUrl: "/setup-chat"
				}, { status: 403 })
			}
			
			return NextResponse.json({ 
				error: "Failed to send message",
				details: messageError.message
			}, { status: 500 })
		}

		console.log(`✅ Message sent successfully! ID: ${messageData.id}`)
		return NextResponse.json({ 
			success: true,
			message: messageData 
		})
	} catch (e: any) {
		console.error("💥 Unexpected error:", e)
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

// Update/edit a message
export async function PUT(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const { messageId, message, isRead } = body || {}

		if (!messageId) {
			return NextResponse.json({ 
				error: "messageId is required" 
			}, { status: 400 })
		}

		// Build update object dynamically
		const updateData: any = {
			updated_at: new Date().toISOString()
		}

		if (message !== undefined) {
			updateData.message = message.trim()
		}

		if (isRead !== undefined) {
			updateData.is_read = isRead
		}

		console.log(`📝 Updating message ${messageId}:`, updateData)

		const { data, error } = await supabase
			.from("chart_messages")
			.update(updateData)
			.eq("id", messageId)
			.select("*")
			.single()

		if (error) {
			console.error("❌ Error updating message:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		console.log(`✅ Message updated successfully`)
		return NextResponse.json({ message: data })
	} catch (e: any) {
		console.error("💥 Unexpected error:", e)
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}

// Delete a message
export async function DELETE(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const body = await request.json()
		const { messageId } = body || {}

		if (!messageId) {
			return NextResponse.json({ 
				error: "messageId is required" 
			}, { status: 400 })
		}

		const { error } = await supabase
			.from("chart_messages")
			.delete()
			.eq("id", messageId)

		if (error) {
			console.error("Error deleting message:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ success: true })
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}
