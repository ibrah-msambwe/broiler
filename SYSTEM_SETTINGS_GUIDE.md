# 🎛️ System Settings - Complete Guide

## ✅ **What's Been Implemented**

Your TARIQ system now has a **comprehensive settings system** with language persistence, theme switching, and intelligent features!

---

## 🌟 **Key Features**

### **1. Language Persistence** 🌍
- ✅ Language selection on landing page **saves automatically**
- ✅ Selected language **persists across all pages**
- ✅ Language stays the same even after logout/refresh
- ✅ Works on **all dashboards**: Admin, Batch, User

### **2. Theme Switching** 🌓
- ✅ Light/Dark mode toggle
- ✅ Saves preference automatically
- ✅ Applies across entire app
- ✅ Available in all dashboards

### **3. Admin Settings** (System Settings Tab) ⚙️
- ✅ **Language Change** - Switch between English/Swahili
- ✅ **Theme Toggle** - Light/Dark mode
- ✅ **App Refresh** - Clear cache and reload
- ✅ **System Reset** - Delete all database data (with confirmation)

### **4. User/Batch Settings** 👤
- ✅ **Profile Updates** - Edit name and email
- ✅ **Language Change** - Personal language preference
- ✅ **Theme Toggle** - Personal theme preference

---

## 📱 **How to Access Settings**

### **On Desktop:**
1. Navigate to any dashboard
2. Click **"Settings"** or **"System Settings"** in sidebar
3. Adjust preferences

### **On Mobile (Flutter-style):**
1. Open any dashboard
2. Look at **bottom navigation bar**
3. Tap the **Settings icon** (gear icon)
4. All settings available instantly!

---

## 🎨 **Settings Available by User Type**

### **Admin Dashboard:**
Location: Bottom nav → Settings (or sidebar → System Settings)

**Available Settings:**
1. **Language** 
   - Switch: English ⇄ Swahili
   - Saves automatically
   - Affects entire app

2. **Theme**
   - Toggle: Light ⇄ Dark
   - Auto-saves preference
   - Applies system-wide

3. **System Refresh**
   - Button: "Refresh System"
   - Clears cache
   - Reloads app
   - Useful for troubleshooting

4. **System Reset** (⚠️ DANGER ZONE)
   - Button: "System Reset"
   - **Deletes ALL data**:
     - All batches
     - All reports
     - All messages
     - All user activities
   - Requires confirmation
   - Cannot be undone!

---

### **Batch Dashboard:**
Location: Bottom nav → Settings

**Available Settings:**
1. **Profile Information**
   - Update name
   - Update email
   - Save changes

2. **Language**
   - English/Swahili toggle
   - Saves automatically

3. **Theme**
   - Light/Dark mode
   - Personal preference

---

### **User Dashboard:**
Location: Top tabs → Settings

**Available Settings:**
1. **Profile Information**
   - Edit personal details
   - Update contact info

2. **Language Preference**
   - English/Swahili
   - Persists across sessions

3. **Theme Preference**
   - Light/Dark mode
   - Saves automatically

---

## 🔄 **How Language Persistence Works**

### **Flow:**
1. **User visits landing page** → Sees language buttons (EN/SW)
2. **User selects language** → Saved to `localStorage`
3. **User logs in** → App reads saved language
4. **All pages load** → Using saved language preference
5. **User changes language** → Updates everywhere instantly

### **Technical Details:**
- Uses `localStorage.getItem("app_language")`
- Dispatches custom event when changed
- All components listen for changes
- Auto-syncs across tabs

---

## 🎨 **How Theme Switching Works**

### **Flow:**
1. **User toggles theme** → Switch Light ⇄ Dark
2. **System saves preference** → `localStorage`
3. **CSS classes update** → `document.documentElement.classList`
4. **Theme applies instantly** → No page reload needed

### **Features:**
- Detects system preference on first load
- Saves user choice
- Persists across sessions
- Works with Tailwind dark mode

---

## 🔄 **System Refresh (Admin Only)**

**What it does:**
1. Clears browser cache
2. Clears service worker cache
3. Reloads the page
4. Fresh data from server

**When to use:**
- After database changes
- When data looks stale
- Troubleshooting issues
- After updates

---

## 🗑️ **System Reset (Admin Only)**

### **⚠️ EXTREME CAUTION ⚠️**

**What it deletes:**
- ✅ All batches from `batches` table
- ✅ All reports from `reports` table  
- ✅ All messages from `chart_messages` table
- ✅ All activities from `user_activities` table
- ✅ All profiles from `profile` table

**What survives:**
- ❌ Table structures (not deleted)
- ❌ Admin account (usually)
- ❌ System configuration

**Process:**
1. Click "System Reset" button
2. See warning dialog
3. Confirm: "Yes, Reset Everything"
4. System deletes all data
5. Auto-logout
6. Redirect to landing page

**Recovery:**
- ⚠️ **NO RECOVERY POSSIBLE**
- All data is permanently deleted
- Must re-enter everything manually

---

## 📍 **Where Settings Appear**

### **Desktop View:**
- Sidebar menu item
- Always visible
- Click to access

### **Mobile View (Flutter-style):**
- Bottom navigation bar
- 5th icon (gear icon)
- Tap to open settings
- Full-screen settings page

---

## 🧪 **Testing Your Settings**

### **Test Language Persistence:**
1. Go to landing page (`/`)
2. Click "SW" (Swahili)
3. Login as admin
4. **Verify**: All text in Swahili ✅
5. Refresh page (F5)
6. **Verify**: Still in Swahili ✅
7. Go to landing page again
8. **Verify**: SW button is active ✅

### **Test Theme:**
1. Login to any dashboard
2. Go to Settings
3. Toggle theme switch
4. **Verify**: Colors change instantly ✅
5. Refresh page
6. **Verify**: Theme persists ✅

### **Test System Refresh:**
1. Admin dashboard → Settings
2. Click "Refresh System"
3. **Verify**: Page reloads ✅
4. **Verify**: Fresh data loaded ✅

---

## 🎯 **Key Files Created:**

1. **`lib/language-context.tsx`** - Language persistence system
2. **`lib/theme-context.tsx`** - Theme switching system
3. **`components/admin/system-settings-panel.tsx`** - Admin settings UI
4. **`components/user/user-settings-panel.tsx`** - User settings UI
5. **`app/api/admin/system-reset/route.ts`** - Reset API endpoint

---

## 💡 **Pro Tips:**

1. **Language Changes** apply instantly - no need to refresh!
2. **Theme Preference** saved per device/browser
3. **System Reset** should only be used for:
   - Complete fresh start
   - Testing/development
   - Removing all data permanently
4. **Settings icon** always visible on mobile bottom nav
5. **All changes** save automatically - no "Save" button needed!

---

## 🎊 **Summary:**

✅ Language persists from landing page to all dashboards
✅ Theme switches instantly and saves preference
✅ Admin has full system control (refresh/reset)
✅ Users have personal preferences (profile/theme/language)
✅ Mobile-friendly with bottom nav access
✅ All settings auto-save
✅ Works across all devices

**Your settings system is now production-ready!** 🚀

