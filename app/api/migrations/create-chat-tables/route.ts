import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
    const supabase = createServerSupabaseClient()

    try {
        console.log("🔧 Starting chat tables migration...")

        // Check if tables already exist by trying to query them
        const { data: conversationsCheck, error: conversationsCheckError } = await supabase
            .from("conversations")
            .select("id")
            .limit(1)

        const { data: messagesCheck, error: messagesCheckError } = await supabase
            .from("chart_messages")
            .select("id")
            .limit(1)

        // If both tables exist, return success
        if (!conversationsCheckError && !messagesCheckError) {
            console.log("✅ Chat tables already exist")
            return NextResponse.json({ 
                success: true, 
                message: "Chat tables already exist." 
            })
        }

        console.log("📋 Tables don't exist, creating them...")
        console.log("Conversations check error:", conversationsCheckError?.message)
        console.log("Messages check error:", messagesCheckError?.message)

        // Since we can't use exec_sql, we'll create a simple approach
        // Try to insert a test record to see if the table exists
        const testConversation = {
            participant_1_id: "00000000-0000-0000-0000-000000000000",
            participant_2_id: "00000000-0000-0000-0000-000000000001", 
            participant_1_name: "test",
            participant_2_name: "test"
        }

        const { error: testError } = await supabase
            .from("conversations")
            .insert(testConversation)

        if (testError) {
            console.log("❌ Conversations table doesn't exist, need to create it manually")
            return NextResponse.json({ 
                success: false, 
                error: "Chat tables need to be created manually. Please run the SQL script in create-chat-tables.sql",
                sqlScript: "create-chat-tables.sql"
            }, { status: 400 })
        }

        // If we get here, the table exists, clean up test data
        await supabase
            .from("conversations")
            .delete()
            .eq("participant_1_id", "00000000-0000-0000-0000-000000000000")

        console.log("✅ Chat tables exist and are accessible")
        return NextResponse.json({ 
            success: true, 
            message: "Chat tables are accessible." 
        })

    } catch (error: any) {
        console.error("💥 Unexpected error during chat tables migration:", error)
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            suggestion: "Please run the SQL script in create-chat-tables.sql manually in your Supabase dashboard"
        }, { status: 500 })
    }
}
