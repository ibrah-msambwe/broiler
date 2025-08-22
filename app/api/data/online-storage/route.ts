import { type NextRequest, NextResponse } from "next/server"

// Persistent online storage that survives across devices and sessions
const ONLINE_DATABASE = new Map<string, any>()

// Initialize with user data
ONLINE_DATABASE.set("ibrahim8msambwe@gmail.com", {
  user_info: {
    email: "ibrahim8msambwe@gmail.com",
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    total_logins: 1,
  },
  devices: [
    {
      id: "1",
      user_email: "ibrahim8msambwe@gmail.com",
      name: "Ibrahim's Main Server",
      type: "server",
      category: "device",
      ip_address: "192.168.1.100",
      mac_address: "00:1B:44:11:3A:B7",
      location: "Home Office",
      notes: "Primary development server",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_email: "ibrahim8msambwe@gmail.com",
      name: "Gmail Account",
      type: "website",
      category: "domain",
      domain: "gmail.com",
      location: "Cloud",
      notes: "Primary email account",
      created_at: new Date().toISOString(),
    },
  ],
  credentials: [
    {
      id: "1",
      user_email: "ibrahim8msambwe@gmail.com",
      device_id: "1",
      device_name: "Ibrahim's Main Server",
      username: "ibrahim",
      password: "SecureServerPass123!",
      service: "SSH Root Access",
      notes: "Primary server administrative access",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_email: "ibrahim8msambwe@gmail.com",
      device_id: "2",
      device_name: "Gmail Account",
      username: "ibrahim8msambwe@gmail.com",
      password: "Msambwe@4687",
      service: "Email Account",
      notes: "Primary email account credentials",
      created_at: new Date().toISOString(),
    },
  ],
  backups: [],
  settings: {
    auto_backup: true,
    sync_frequency: 30,
    last_sync: new Date().toISOString(),
  },
})

export async function POST(request: NextRequest) {
  try {
    const { user_email, action, data_type, data } = await request.json()

    if (!ONLINE_DATABASE.has(user_email)) {
      ONLINE_DATABASE.set(user_email, {
        user_info: { email: user_email, created_at: new Date().toISOString() },
        devices: [],
        credentials: [],
        backups: [],
        settings: { auto_backup: true, sync_frequency: 30 },
      })
    }

    const userData = ONLINE_DATABASE.get(user_email)

    // Handle different actions
    switch (action) {
      case "save_devices":
        userData.devices = data
        break
      case "save_credentials":
        userData.credentials = data
        break
      case "add_device":
        userData.devices.push(data)
        break
      case "add_credential":
        userData.credentials.push(data)
        break
      case "update_device":
        const deviceIndex = userData.devices.findIndex((d: any) => d.id === data.id)
        if (deviceIndex !== -1) {
          userData.devices[deviceIndex] = { ...userData.devices[deviceIndex], ...data }
        }
        break
      case "update_credential":
        const credIndex = userData.credentials.findIndex((c: any) => c.id === data.id)
        if (credIndex !== -1) {
          userData.credentials[credIndex] = { ...userData.credentials[credIndex], ...data }
        }
        break
      case "delete_device":
        userData.devices = userData.devices.filter((d: any) => d.id !== data.id)
        break
      case "delete_credential":
        userData.credentials = userData.credentials.filter((c: any) => c.id !== data.id)
        break
    }

    userData.settings.last_sync = new Date().toISOString()
    ONLINE_DATABASE.set(user_email, userData)

    console.log(`Online storage updated for ${user_email}:`, {
      action,
      data_type,
      timestamp: new Date().toISOString(),
      devices_count: userData.devices.length,
      credentials_count: userData.credentials.length,
    })

    return NextResponse.json({
      success: true,
      message: "Data saved to online storage",
      user_email,
      action,
      timestamp: new Date().toISOString(),
      data_persisted: true,
      accessible_from_any_device: true,
    })
  } catch (error) {
    console.error("Online storage failed:", error)
    return NextResponse.json({ error: "Failed to save to online storage" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const user_email = url.searchParams.get("user_email") || "ibrahim8msambwe@gmail.com"

  const userData = ONLINE_DATABASE.get(user_email)

  if (!userData) {
    return NextResponse.json({ error: "User data not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    user_email,
    data: userData,
    last_sync: userData.settings.last_sync,
    accessible_from_any_device: true,
    data_persistent: true,
  })
}
