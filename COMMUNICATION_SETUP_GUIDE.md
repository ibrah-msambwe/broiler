# Communication System Setup Guide

## ✅ Quick Setup (3 Steps)

### Error Message
If you're seeing this error:
```
❌ Failed to send message: "Chat tables not initialized. Please run setup-communication-tables.sql"
```

Don't worry! Follow these simple steps to fix it:

---

## 🚀 Option 1: Automatic Setup (Easiest)

### Step 1: Visit the Setup Page
Open your browser and navigate to:
```
http://localhost:3000/setup-communication-table
```

### Step 2: Click "Create Table Automatically"
Click the blue button that says **"Create Table Automatically"**

### Step 3: Verify
Click **"Check Status"** to confirm the table was created successfully.

✅ **Done!** Your communication system is ready to use.

---

## 📝 Option 2: Manual Setup (If Automatic Fails)

### Step 1: Copy the SQL Script
Copy this SQL script:

```sql
CREATE TABLE IF NOT EXISTS chart_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    conversation_id UUID,
    batch_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chart_messages_sender ON chart_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_receiver ON chart_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_created_at ON chart_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chart_messages_batch ON chart_messages(batch_id);
CREATE INDEX IF NOT EXISTS idx_chart_messages_is_read ON chart_messages(is_read);
```

### Step 2: Run in Supabase
1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **"New Query"**
5. Paste the SQL script above
6. Click **"Run"** or press `Ctrl+Enter`

### Step 3: Verify Success
You should see a success message like:
```
Success. No rows returned
```

This is normal and means the table was created successfully!

---

## 🎯 Using the Communication System

Once the table is created:

### For Admin:
1. Go to **Admin Dashboard**
2. Click **"Communication"** tab
3. See all batch users in the left panel
4. Click any user to start chatting
5. Type your message and click Send

### For Batch Users (Farmers):
1. Go to **Batch Dashboard**
2. Click **"Communication"** tab
3. Chat directly with admin
4. Messages appear in real-time

---

## 🔍 Troubleshooting

### Issue: "Table not found" error persists

**Solution 1**: Check if table exists
Run this SQL in Supabase SQL Editor:
```sql
SELECT * FROM chart_messages LIMIT 5;
```

If you get an error, the table doesn't exist. Run the CREATE TABLE script again.

**Solution 2**: Check table permissions
Run this SQL to add permissions:
```sql
ALTER TABLE chart_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON chart_messages FOR ALL USING (true);
```

**Solution 3**: Clear browser cache
1. Press `Ctrl+Shift+Delete`
2. Clear cache and cookies
3. Refresh the page

### Issue: Messages not appearing in real-time

**Solution**: Refresh the page or wait 10 seconds
- Messages auto-refresh every 10 seconds
- Real-time subscriptions might take a moment to connect
- If issue persists, check your internet connection

---

## 📊 Verify Everything Works

### Test the System:
1. **Visit**: http://localhost:3000/setup-communication-table
2. **Click**: "Check Status"
3. **Expected**: "Table exists with X messages"

If you see this, everything is working! 🎉

---

## 📁 Alternative SQL Files

If you prefer, you can also run one of these SQL files:

1. **`create-chart-messages-table-simple.sql`** - Simplest version (recommended)
2. **`setup-communication-tables.sql`** - Full version with additional features

Both are located in your project root directory.

---

## 🆘 Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages (Press F12)
2. Check the server logs in your terminal
3. Verify your Supabase connection is working
4. Make sure your `.env.local` file has correct Supabase credentials

---

## ✅ Success Checklist

- [ ] Table created in Supabase
- [ ] "Check Status" shows table exists
- [ ] Can open Admin Dashboard → Communication tab
- [ ] Can see batch users listed
- [ ] Can send a test message
- [ ] Message appears in the chat

Once all checkboxes are complete, your communication system is fully operational! 🚀
