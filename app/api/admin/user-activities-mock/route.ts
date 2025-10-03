import { NextRequest, NextResponse } from "next/server"

// Simple mock endpoint for user activity tracking
// This prevents errors but doesn't store data in database

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      userName, 
      userType, 
      batchId, 
      batchName, 
      action, 
      ipAddress, 
      userAgent,
      isOnline 
    } = body || {}

    // Log activity (optional)
    console.log("📊 User activity:", {
      userId,
      userName,
      userType,
      action,
      isOnline
    })

    // Return success without database storage
    return NextResponse.json({ 
      success: true, 
      message: "Activity tracked successfully",
      data: {
        userId,
        userName,
        action,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error("❌ Error in user activity mock:", error)
    // Return success even on error to prevent UI disruption
    return NextResponse.json({ 
      success: true, 
      message: "Activity tracking skipped"
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, isOnline, lastAction } = body || {}

    console.log("📊 User status update:", {
      userId,
      isOnline,
      lastAction
    })

    return NextResponse.json({ 
      success: true, 
      message: "Status updated successfully"
    })

  } catch (error: any) {
    console.error("❌ Error updating status:", error)
    // Return success even on error
    return NextResponse.json({ 
      success: true, 
      message: "Status update skipped"
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return empty activities list
    return NextResponse.json({
      success: true,
      activities: [],
      message: "Mock endpoint - no activities stored"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: true, 
      activities: []
    })
  }
}
