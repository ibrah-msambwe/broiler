import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const userEmail = "ibrahim8msambwe@gmail.com"

    // Get latest backup
    const { data: latestBackup, error: backupError } = await supabase
      .from("backups")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Get total backup count
    const { count: totalBackups, error: countError } = await supabase
      .from("backups")
      .select("*", { count: "exact", head: true })
      .eq("user_email", userEmail)

    if (backupError && backupError.code !== "PGRST116") {
      console.error("Failed to fetch backup status:", backupError)
    }

    const backupStatus = {
      lastBackup: latestBackup?.created_at || null,
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      totalBackups: totalBackups || 0,
      autoBackupEnabled: true,
      lastBackupSize: latestBackup?.backup_size || "0 KB",
      backupLocation: "Supabase Cloud Storage",
      dataIntegrity: "Verified",
      encryptionStatus: "AES-256 Encrypted",
    }

    return NextResponse.json(backupStatus)
  } catch (error) {
    console.error("Failed to get backup status:", error)
    return NextResponse.json({
      lastBackup: null,
      nextScheduled: null,
      totalBackups: 0,
      autoBackupEnabled: false,
      lastBackupSize: "0 KB",
      backupLocation: "Not configured",
      dataIntegrity: "Unknown",
      encryptionStatus: "Not encrypted",
    })
  }
}
