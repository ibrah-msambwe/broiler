import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
    const supabase = createServerSupabaseClient()

    try {
        // Check if conversations table exists
        const { data: conversationsData, error: conversationsError } = await supabase
            .from("conversations")
            .select("id")
            .limit(1)

        // Check if chart_messages table exists
        const { data: messagesData, error: messagesError } = await supabase
            .from("chart_messages")
            .select("id")
            .limit(1)

        const tablesExist = {
            conversations: !conversationsError,
            chart_messages: !messagesError
        }

        return NextResponse.json({ 
            success: true, 
            tablesExist,
            errors: {
                conversations: conversationsError?.message,
                chart_messages: messagesError?.message
            }
        })
    } catch (error: any) {
        console.error("Error checking chat tables:", error)
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}
