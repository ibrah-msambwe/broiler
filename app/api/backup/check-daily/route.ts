import { NextResponse } from "next/server"

export async function GET() {
  // Check if daily backup is needed
  const lastBackup = new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
  const now = new Date()
  const hoursSinceBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60)

  return NextResponse.json({
    shouldBackup: hoursSinceBackup >= 24,
    lastBackup: lastBackup.toISOString(),
    hoursSinceBackup: Math.floor(hoursSinceBackup),
  })
}
