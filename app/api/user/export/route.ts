import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { user_email } = await request.json()
    const supabase = createServerSupabaseClient()

    // Get user's data
    const [userResult, devicesResult, credentialsResult] = await Promise.all([
      supabase.from("users").select("*").eq("email", user_email).single(),
      supabase.from("devices").select("*").eq("user_email", user_email),
      supabase.from("credentials").select("*").eq("user_email", user_email),
    ])

    const user = userResult.data
    const devices = devicesResult.data || []
    const credentials = credentialsResult.data || []

    // Create HTML export
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SecureVault Pro - Personal Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #2563eb; font-size: 24px; font-weight: bold; }
        .subtitle { color: #666; font-size: 14px; }
        .section { margin: 30px 0; }
        .section-title { color: #1f2937; font-size: 18px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .item { background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; }
        .item-title { font-weight: bold; color: #1f2937; }
        .item-detail { margin: 5px 0; color: #4b5563; }
        .security-notice { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .export-info { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🔒 SecureVault Pro - Personal Export</div>
        <div class="subtitle">Personal Password Manager by Msambwe Pro</div>
    </div>

    <div class="export-info">
        <strong>Export Details:</strong><br>
        User: ${user?.name} (${user_email})<br>
        Date: ${new Date().toLocaleDateString()}<br>
        Time: ${new Date().toLocaleTimeString()}<br>
        Total Devices: ${devices.length}<br>
        Total Credentials: ${credentials.length}
    </div>

    <div class="security-notice">
        <strong>🚨 PERSONAL DATA EXPORT</strong><br>
        This document contains your personal authentication information. Please:
        <ul>
            <li>Store in a secure location</li>
            <li>Do not share with unauthorized persons</li>
            <li>Delete after use if printed</li>
            <li>Passwords are redacted for security</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">📱 Your Devices & Systems</div>
        ${devices
          .map(
            (device, index) => `
            <div class="item">
                <div class="item-title">${index + 1}. ${device.name}</div>
                <div class="item-detail"><strong>Type:</strong> ${device.type}</div>
                <div class="item-detail"><strong>Category:</strong> ${device.category}</div>
                ${device.ip_address ? `<div class="item-detail"><strong>IP:</strong> ${device.ip_address}</div>` : ""}
                ${device.domain ? `<div class="item-detail"><strong>Domain:</strong> ${device.domain}</div>` : ""}
                <div class="item-detail"><strong>Location:</strong> ${device.location || "Not specified"}</div>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="section">
        <div class="section-title">🔐 Your Stored Credentials</div>
        ${credentials
          .map(
            (cred, index) => `
            <div class="item">
                <div class="item-title">${index + 1}. ${cred.service || "Credential"}</div>
                <div class="item-detail"><strong>Device:</strong> ${cred.device_name}</div>
                <div class="item-detail"><strong>Username:</strong> ${cred.username}</div>
                <div class="item-detail"><strong>Password:</strong> [REDACTED - Access via SecureVault Pro]</div>
                <div class="item-detail"><strong>Notes:</strong> ${cred.notes || "No notes"}</div>
                <div class="item-detail"><strong>Created:</strong> ${new Date(cred.created_at).toLocaleDateString()}</div>
            </div>
        `,
          )
          .join("")}
    </div>

    <div class="footer">
        <strong>Export ID:</strong> ${Date.now()}<br>
        <strong>Generated:</strong> ${new Date().toISOString()}<br>
        © 2025 SecureVault Pro Personal Edition by Msambwe Pro<br>
        ⚠️ PERSONAL CONFIDENTIAL DOCUMENT
    </div>
</body>
</html>
`

    const blob = new Blob([htmlContent], {
      type: "text/html",
    })

    console.log(`Personal export generated for ${user_email}`)

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="SecureVault-${user?.name?.replace(/\s+/g, "-") || "User"}-${new Date().toISOString().split("T")[0]}.html"`,
      },
    })
  } catch (error) {
    console.error("Personal export failed:", error)
    return NextResponse.json({ error: "Failed to export personal data" }, { status: 500 })
  }
}
