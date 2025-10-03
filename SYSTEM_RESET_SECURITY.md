# 🔒 System Reset Security Guide

## Overview
The system reset feature now includes **password verification** to prevent unauthorized data deletion. Only administrators with correct credentials can perform system resets.

---

## 🛡️ Security Features

### 1. **Password Verification**
- Admin must enter their login password before reset
- Password is verified against stored admin credentials
- Invalid passwords are immediately rejected

### 2. **Comprehensive Warning**
Before reset, the admin sees a detailed list of what will be deleted:
- ✅ All batches and farmer information
- ✅ All reports and historical data
- ✅ All messages and communications
- ✅ All user activities and logs
- ✅ All profiles and accounts

### 3. **Multi-Language Support**
Warnings and prompts are displayed in both:
- 🇬🇧 **English**
- 🇹🇿 **Kiswahili**

---

## 🔐 Admin Password Configuration

### Default Passwords
The system accepts these passwords by default:
1. `tariq123` (primary)
2. `admin123` (fallback)
3. `tariq` (fallback)

### Custom Password Setup
To set a custom admin password, add it to your `.env.local` file:

```env
ADMIN_PASSWORD=your_secure_password_here
```

**Example:**
```env
ADMIN_PASSWORD=TariqSecure2025!
```

---

## 📋 System Reset Process

### Step 1: Navigate to System Settings
Admin Dashboard → **System Settings** tab → Scroll to **Danger Zone**

### Step 2: Click "System Reset"
A critical warning dialog will appear showing all data that will be deleted.

### Step 3: Enter Admin Password
- Type your admin login password in the password field
- The password is hidden for security

### Step 4: Confirm Reset
- Click **"Yes, Delete Everything"**
- System verifies your password
- If correct, reset begins immediately

### Step 5: Automatic Cleanup
The system will:
1. ✅ Verify admin password
2. ✅ Delete all data from database tables
3. ✅ Clear local storage and session storage
4. ✅ Redirect to landing page
5. ✅ Require fresh registration

---

## ⚠️ What Gets Deleted

### Database Tables Cleared:
- `chart_messages` - All messages and communications
- `reports` - All batch reports and data
- `batches` - All batch information
- `profile` - All user profiles and accounts

### Local Data Cleared:
- Browser localStorage (language preferences, cached data)
- Browser sessionStorage (temporary session data)
- All authentication tokens

---

## 🚨 Important Warnings

### ⚠️ IRREVERSIBLE ACTION
- System reset **CANNOT BE UNDONE**
- All data is **PERMANENTLY DELETED**
- No backups are created automatically

### ⚠️ REQUIRES RE-REGISTRATION
After reset, you must:
1. Create new admin account
2. Register all batches again
3. Re-enter all farmer information
4. Rebuild all reports from scratch

### ⚠️ AFFECTS ALL USERS
- All users will lose access
- All batches will be deleted
- All historical data will be lost

---

## 🔒 Security Implementation

### API Endpoints

#### 1. **Password Verification**
**Endpoint:** `/api/admin/verify-password`
**Method:** `POST`

```json
{
  "password": "admin_password"
}
```

**Response (Success):**
```json
{
  "valid": true,
  "message": "Password verified"
}
```

**Response (Failure):**
```json
{
  "valid": false,
  "error": "Invalid password"
}
```

#### 2. **System Reset**
**Endpoint:** `/api/admin/system-reset`
**Method:** `POST`

```json
{
  "password": "admin_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "System reset completed",
  "deleted": ["chart_messages", "reports", "batches", "profile"]
}
```

**Response (Failure - Invalid Password):**
```json
{
  "success": false,
  "error": "Invalid admin password. System reset denied."
}
```

---

## 🛠️ Technical Details

### Password Validation Flow
```
1. Admin clicks "System Reset"
2. Warning dialog appears with password input
3. Admin enters password
4. Frontend calls /api/admin/verify-password
5. Backend checks password against valid credentials
6. If valid:
   - Frontend calls /api/admin/system-reset with password
   - Backend verifies password again (double check)
   - Database tables are cleared
   - Local storage is cleared
   - Redirect to landing page
7. If invalid:
   - Error message displayed
   - Reset is blocked
   - Admin can retry
```

### Security Measures
1. **Double Verification**: Password is checked twice (once before UI, once in reset API)
2. **No Token Storage**: Password is not stored, only verified
3. **Secure Transport**: Password is sent via POST (not URL parameters)
4. **Immediate Feedback**: Invalid passwords are rejected instantly
5. **Audit Logging**: All reset attempts are logged to console

---

## 📱 User Interface

### Desktop View
- Full warning dialog with detailed list
- Password input field with placeholder
- Clear error messages for invalid passwords
- Disabled confirm button until password is entered

### Mobile View
- Responsive dialog adapts to screen size
- Touch-friendly password input
- Same security measures as desktop
- Optimized for smaller screens

---

## 🎯 Best Practices

### For Admins:
1. ✅ **Use a strong password** for admin account
2. ✅ **Set custom password** in `.env.local`
3. ✅ **Double-check** before confirming reset
4. ✅ **Backup important data** before reset (manual export)
5. ✅ **Document** current system state before reset

### For Developers:
1. ✅ **Never hardcode** admin passwords in source code
2. ✅ **Use environment variables** for sensitive data
3. ✅ **Test reset** in development environment first
4. ✅ **Log all attempts** for security auditing
5. ✅ **Add rate limiting** to prevent brute force attacks (future enhancement)

---

## 🔄 Recovery After Reset

### What to Do After System Reset:
1. **Register New Admin**
   - Go to landing page
   - Create new admin account
   - Use strong password

2. **Recreate Batches**
   - Add batch information
   - Register farmers
   - Set batch details

3. **Restore Data (if backed up)**
   - Import batch data from backup
   - Re-enter historical reports
   - Restore user accounts

4. **Reconfigure Settings**
   - Set language preferences
   - Choose theme (light/dark)
   - Configure communication settings

---

## 🆘 Troubleshooting

### Issue: "Invalid password" error
**Solution:** 
- Ensure you're using the correct admin login password
- Check if custom password is set in `.env.local`
- Try default passwords: `tariq123`, `admin123`, or `tariq`

### Issue: Reset button is disabled
**Solution:**
- Make sure password field is not empty
- Password must have at least one character

### Issue: Reset not completing
**Solution:**
- Check browser console for errors
- Verify Supabase connection
- Ensure service role key has delete permissions
- Check network connectivity

---

## 📞 Support

For issues or questions about system reset:
- **Admin:** Tariq
- **Developer:** Ibrahim
- **Email:** tariq.admin@example.com
- **Phone:** +255 7XX XXX XXX

---

## ✅ Security Checklist

Before using system reset in production:
- [ ] Custom admin password set in `.env.local`
- [ ] Admin credentials are secure and private
- [ ] Manual backup of important data created
- [ ] All users notified of planned reset
- [ ] Recovery plan documented
- [ ] Test reset performed in development
- [ ] Audit logging enabled
- [ ] Rate limiting configured (recommended)

---

**Last Updated:** October 2, 2025
**Version:** 1.0.0

