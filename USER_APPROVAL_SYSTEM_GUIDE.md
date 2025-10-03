# 🔐 User Approval System

## Overview

The User Approval System allows admins to control which batch users can log in to the system. When new users register, they must wait for admin approval before they can access their dashboard.

---

## 🎯 Features

### ✅ **For New Users**
- Register with username and password
- Receive a "Pending Approval" message
- Cannot login until approved by admin
- Clear error message: "Batch not approved yet. Please contact admin."

### ✅ **For Admin**
- View all users with their approval status
- See "Pending Approval" badge for unapproved users
- See "Approved" badge for approved users
- One-click approve/revoke buttons
- Real-time updates after approval actions

---

## 📋 Setup Instructions

### **Step 1: Run Database Migration**

Open your **Supabase SQL Editor** and run the `add-user-approval-system.sql` file:

```sql
-- Add is_approved column to batches table
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add approval timestamp
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add approved_by column
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Update existing batches to be approved (migration)
UPDATE batches 
SET is_approved = true, 
    approved_at = NOW(),
    approved_by = 'system_migration'
WHERE is_approved IS NULL OR is_approved = false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_batches_is_approved ON batches(is_approved);
```

**Important:** The migration automatically approves all existing users so they can continue logging in!

---

## 🎨 How It Works

### **1. User Registration**

When a new user registers:
- `is_approved` is set to `false` by default
- User receives message: "Registration successful! Please wait for admin approval before you can login."
- User data is saved in the `batches` table

### **2. User Login Attempt**

When an unapproved user tries to login:
- System checks `is_approved` field
- If `false`, shows error: "Batch not approved yet. Please contact admin."
- Login is blocked with HTTP 403 status

### **3. Admin Approval**

Admin can approve users from **Admin Dashboard → User Activity**:

1. **View Status:**
   - Red "Pending Approval" badge = Not approved
   - Green "Approved" badge = Approved

2. **Approve User:**
   - Click green "Approve" button
   - Sets `is_approved = true`
   - Records approval timestamp and admin name
   - User can now login

3. **Revoke Access:**
   - Click red "Revoke" button
   - Sets `is_approved = false`
   - User can no longer login

---

## 🔧 API Endpoints

### **POST `/api/admin/approve-user`**

Approve or unapprove a user.

**Request:**
```json
{
  "batchId": "uuid-here",
  "approve": true,  // true to approve, false to revoke
  "adminName": "Admin Name"
}
```

**Response:**
```json
{
  "success": true,
  "batch": { /* batch data */ },
  "message": "User approved successfully"
}
```

### **GET `/api/admin/approve-user`**

Get all users pending approval.

**Response:**
```json
{
  "pendingUsers": [ /* array of unapproved batches */ ],
  "count": 5
}
```

---

## 📊 Database Schema

### **New Columns in `batches` Table:**

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `is_approved` | `BOOLEAN` | `false` | Whether user is approved to login |
| `approved_at` | `TIMESTAMP` | `null` | When user was approved |
| `approved_by` | `TEXT` | `null` | Admin who approved the user |

---

## 🎯 User Flow Diagram

```
┌─────────────────┐
│  User Registers │
│  is_approved=false │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Login Attempt  │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Check   │
    │approved?│
    └────┬────┘
         │
    ┌────▼─────────────┐
    │                  │
┌───▼───┐          ┌───▼───┐
│ FALSE │          │ TRUE  │
└───┬───┘          └───┬───┘
    │                  │
    ▼                  ▼
┌───────────────┐  ┌───────────────┐
│ Show Error:   │  │ Login Success │
│ "Not approved"│  │ → Dashboard   │
└───────────────┘  └───────────────┘
    │
    ▼
┌───────────────┐
│ Admin goes to │
│ User Activity │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Click Approve │
│ is_approved=true │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ User can now  │
│ login ✅      │
└───────────────┘
```

---

## 💡 Usage Tips

### **For Admins:**

1. **Check Pending Users:**
   - Go to **Admin Dashboard** → **User Activity**
   - Look for users with red "Pending Approval" badges

2. **Batch Approval:**
   - You can quickly approve multiple users
   - Click "Approve" on each user
   - System updates in real-time

3. **Revoke Access:**
   - If you need to block a user, click "Revoke"
   - They won't be able to login anymore
   - You can re-approve them anytime

### **For Users:**

1. **After Registration:**
   - Wait for admin approval
   - Contact your admin if it takes too long
   - You'll see: "Batch not approved yet. Please contact admin."

2. **After Approval:**
   - Try logging in again
   - You should now have access
   - Contact admin if you still can't login

---

## 🚀 Benefits

✅ **Security:** Control who can access your system  
✅ **Quality Control:** Review user registrations before granting access  
✅ **Flexibility:** Easily revoke and re-grant access  
✅ **Audit Trail:** Track who approved which users and when  
✅ **User Experience:** Clear feedback for pending users  

---

## 📝 File Changes Summary

### **New Files:**
- `app/api/admin/approve-user/route.ts` - API for approval actions
- `add-user-approval-system.sql` - Database migration script
- `USER_APPROVAL_SYSTEM_GUIDE.md` - This documentation

### **Modified Files:**
- `app/api/auth/batch-register/route.ts` - Set `is_approved=false` on registration
- `app/api/auth/batch-login/route.ts` - Check approval status before login
- `components/admin/user-activity-panel.tsx` - Show approval status and buttons
- `app/api/admin/user-activities-batches/route.ts` - Include approval data

---

## 🎉 That's It!

Your user approval system is now fully functional! 

Admins can now control who gets access, and new users will need approval before they can login.

