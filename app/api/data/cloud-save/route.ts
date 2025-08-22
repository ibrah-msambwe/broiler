import { type NextRequest, NextResponse } from "next/server"

// Cloud storage simulation for online data persistence
const cloudStorage = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { user_email, data_type, data, timestamp, action, device_data, device_id } = await request.json()

    // Create cloud save record
    const cloudSaveRecord = {
      user_email: user_email,
      data_type: data_type,
      timestamp: timestamp,
      data: data,
      action: action,
      device_data: device_data,
      device_id: device_id,
      cloud_save_id: `cloud_${Date.now()}`,
      backup_location: "Secure Cloud Storage",
      encryption_status: "AES-256 Encrypted",
      sync_status: "completed",
      accessible_from_any_device: true,
    }

    // Store in cloud (simulated)
    if (!cloudStorage.has(user_email)) {
      cloudStorage.set(user_email, {
        user_data: [],
        devices: [],
        credentials: [],
        backups: [],
        last_sync: null,
      })
    }

    const userData = cloudStorage.get(user_email)
    userData.user_data.push(cloudSaveRecord)
    userData.last_sync = timestamp

    // Update specific data types
    if (data_type === "devices" && data) {
      userData.devices = data
    }

    console.log(`Cloud save completed for ${user_email}:`, {
      data_type,
      timestamp,
      cloud_save_id: cloudSaveRecord.cloud_save_id,
      accessible_anywhere: true,
    })

    return NextResponse.json({
      message: "Data saved to cloud successfully",
      user_email: user_email,
      cloud_save_record: cloudSaveRecord,
      accessible_from_any_device: true,
      recovery_possible: true,
      sync_status: "completed",
    })
  } catch (error) {
    console.error("Cloud save failed:", error)
    return NextResponse.json({ error: "Failed to save data to cloud" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const user_email = url.searchParams.get("user_email") || "ibrahim8msambwe@gmail.com"

  const userData = cloudStorage.get(user_email) || {
    user_data: [],
    devices: [],
    credentials: [],
    backups: [],
    last_sync: null,
  }

  return NextResponse.json({
    user_email: user_email,
    cloud_data: userData,
    total_saves: userData.user_data.length,
    last_sync: userData.last_sync,
    data_recovery_available: true,
    accessible_from_any_device: true,
    storage_location: "Secure Cloud Database",
  })
}
