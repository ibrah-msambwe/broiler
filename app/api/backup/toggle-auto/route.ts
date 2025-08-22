import { type NextRequest, NextResponse } from "next/server"

// Simulated backup settings
const backupSettings = {
  autoBackupEnabled: true,
}

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json()

    backupSettings.autoBackupEnabled = enabled

    return NextResponse.json({
      message: `Auto backup ${enabled ? "enabled" : "disabled"}`,
      autoBackupEnabled: enabled,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle auto backup" }, { status: 500 })
  }
}
