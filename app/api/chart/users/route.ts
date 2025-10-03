import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Get all users for messaging (farmers, admins, etc.)
export async function GET(request: NextRequest) {
	try {
		const supabase = createServerSupabaseClient()
		const { searchParams } = new URL(request.url)
		const currentUserId = searchParams.get("currentUserId")
		const userType = searchParams.get("userType") // "all", "farmers", "admins"

		let query = supabase
			.from("profiles")
			.select(`
				id,
				username,
				email,
				role,
				created_at
			`)
			.order("username", { ascending: true })

		// Filter out current user
		if (currentUserId) {
			query = query.neq("id", currentUserId)
		}

		// Filter by user type
		if (userType === "farmers") {
			query = query.eq("role", "farmer")
		} else if (userType === "admins") {
			query = query.eq("role", "admin")
		}

		const { data: profiles, error: profilesError } = await query

		if (profilesError) {
			return NextResponse.json({ error: profilesError.message }, { status: 500 })
		}

		// Get farmers from batches table as well
		const { data: farmers, error: farmersError } = await supabase
			.from("batches")
			.select("farmer_name, username")
			.not("farmer_name", "is", null)
			.not("username", "is", null)

		if (farmersError) {
			console.warn("Could not fetch farmers from batches:", farmersError)
		}

		// Combine and deduplicate users
		const allUsers = new Map()

		// Add profiles
		profiles?.forEach(profile => {
			allUsers.set(profile.id, {
				id: profile.id,
				name: profile.username,
				email: profile.email,
				role: profile.role,
				type: "profile"
			})
		})

		// Add farmers from batches
		farmers?.forEach(farmer => {
			if (farmer.farmer_name && farmer.username) {
				allUsers.set(farmer.username, {
					id: farmer.username,
					name: farmer.farmer_name,
					email: null,
					role: "farmer",
					type: "batch_farmer"
				})
			}
		})

		return NextResponse.json({ 
			users: Array.from(allUsers.values()),
			total: allUsers.size
		})
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
	}
}
