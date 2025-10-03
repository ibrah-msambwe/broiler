import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
	try {
		// Log the request for debugging
		console.log("🔐 Batch login attempt received")
		
		const body = await request.json()
		
		// Validate request body exists
		if (!body || typeof body !== 'object') {
			console.log("❌ Invalid request format")
			return NextResponse.json({ 
				error: "Invalid request format. Please provide valid JSON data." 
			}, { status: 400 })
		}

		const { username, password } = body
		
		// Validate required fields
		if (!username || !password) {
			console.log("❌ Missing username or password")
			return NextResponse.json({ 
				error: "Both username and password are required",
				missing: {
					username: !username,
					password: !password
				}
			}, { status: 400 })
		}

		// Validate field types
		if (typeof username !== 'string' || typeof password !== 'string') {
			console.log("❌ Invalid field types")
			return NextResponse.json({ 
				error: "Username and password must be strings" 
			}, { status: 400 })
		}

		// Validate field lengths
		if (username.trim().length === 0 || password.trim().length === 0) {
			console.log("❌ Empty username or password")
			return NextResponse.json({ 
				error: "Username and password cannot be empty" 
			}, { status: 400 })
		}
		
		console.log(`🔍 Attempting login for username: ${username}`)
		
		// Check if Supabase environment variables are set
		if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
			console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY")
			return NextResponse.json({ 
				error: "Server configuration error - missing database credentials" 
			}, { status: 500 })
		}
		
		const supabase = createServerSupabaseClient()
		console.log("✅ Supabase client created successfully")
		
		// Test database connection
		const { data: testData, error: testError } = await supabase
			.from("batches")
			.select("count")
			.limit(1)
		
		if (testError) {
			console.error("❌ Database connection failed:", testError)
			return NextResponse.json({ 
				error: "Database connection failed. Please try again later." 
			}, { status: 500 })
		}
		
		console.log("✅ Database connection successful")
		
		// Query for the batch
		const { data: batch, error } = await supabase
			.from("batches")
			.select("*")
			.eq("username", username)
			.eq("password", password)
			.maybeSingle()
		
		if (error) {
			console.error("❌ Database query error:", error)
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		
		if (!batch) {
			console.log(`❌ No batch found for username: ${username}`)
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
		}
		
		// Check if user is approved
		if (batch.is_approved === false) {
			console.log(`⏳ Batch user not approved yet: ${batch.name || batch.id}`)
			return NextResponse.json({ 
				error: "Batch not approved yet. Please contact admin.",
				approved: false,
				batchName: batch.name
			}, { status: 403 })
		}
		
		console.log(`✅ Login successful for batch: ${batch.name || batch.id}`)
		
		return NextResponse.json({
			user: { 
				role: "batch", 
				username: batch.username, 
				email: null, 
				id: batch.id,
				batchId: batch.id 
			},
			batchId: batch.id,
			batch,
		})
	} catch (e: any) {
		console.error("❌ Unexpected error in batch login:", e)
		
		// Handle JSON parsing errors
		if (e instanceof SyntaxError) {
			return NextResponse.json({ 
				error: "Invalid JSON format in request body" 
			}, { status: 400 })
		}
		
		return NextResponse.json({ 
			error: "Server error. Please try again later.",
			details: String(e?.message || e)
		}, { status: 500 })
	}
} 