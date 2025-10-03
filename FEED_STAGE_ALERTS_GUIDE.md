# 🍗 Feed Stage Alerts System - Complete Guide

## 🎯 Overview
Automatic feed change reminder system for batch users/farmers that notifies them when to transition between different feed types based on bird age.

---

## 📊 **Feed Stages**

### **1. 🐣 Starter Feed (Days 1-14)**
**Protein Content**: 21-23%  
**Purpose**: Initial growth and development

**Recommendations**:
- Feed 4-6 times per day
- Ensure fresh water always available
- Maintain brooding temperature
- Small crumb size for easy eating

**Swahili**:  
Chakula cha Kuanza (Siku 1-14)

---

### **2. 🐔 Grower Feed (Days 14-22)**
**Protein Content**: 18-20%  
**Purpose**: Rapid growth phase

**Recommendations**:
- Feed 3-4 times per day
- Increase feed quantity gradually
- Monitor weight gain
- Ensure adequate ventilation

**Swahili**:  
Chakula cha Kukua (Siku 14-22)

---

### **3. 🍗 Finisher Feed (Days 22-Harvest)**
**Protein Content**: 16-18%  
**Purpose**: Maximum weight gain before harvest

**Recommendations**:
- Feed 2-3 times per day
- Maximum feed intake for weight
- Prepare for market timing
- Monitor market prices
- Plan harvest between 35-42 days

**Swahili**:  
Chakula cha Kumalizia (Siku 22+)

---

## 🔔 **Alert System**

### **When Alerts Trigger:**

#### **2 Days Before Change:**
- 🟡 **Orange Warning Alert**
- Message: "Upcoming Feed Change"
- Gives farmer time to prepare/order new feed

#### **On Change Day:**
- 🔴 **Red Critical Alert**
- Message: "Change Feed Now!"
- Audio notification plays
- Toast notification shows
- Action required immediately

#### **After Change:**
- ✅ **Confirmation Stage**
- Shows current feed stage
- Next stage preview
- Days remaining counter

---

## 📱 **User Interface**

### **Location:**
- **Batch Dashboard** → **Dashboard Tab**
- Shows below "Batch Timeline" card
- Visible only to batch users/farmers
- Not visible in admin panel

### **Card Components:**

```
┌─────────────────────────────────────────┐
│ 🍎 Feed Stage Management                │
│                              [Day 15]     │
├─────────────────────────────────────────┤
│ 🔔 ALERT: Change Feed Now!              │
│ Change to Grower Feed in 0 days         │
│                            [Got It]      │
├─────────────────────────────────────────┤
│ 🐔 Grower Feed [Current Feed Stage]    │
│ Moderate protein feed (18-20%)          │
│ Day 14-22                                │
│                                          │
│ 💡 Recommendations:                      │
│ • Feed 3-4 times per day                │
│ • Increase feed quantity gradually      │
│ • Monitor weight gain                   │
│ • Ensure adequate ventilation           │
├─────────────────────────────────────────┤
│ 📅 Upcoming Feed Change                 │
│ 🍗 Finisher Feed                        │
│ Day 22+                        7 days   │
├─────────────────────────────────────────┤
│ 📅 Feed Schedule Overview               │
│ ✅ 🐣 Starter Feed | Day 1-14          │
│ ▶ 🐔 Grower Feed | Day 14-22 [Day 15] │
│ ➡ 🍗 Finisher Feed | Day 22+          │
└─────────────────────────────────────────┘
```

---

## ⚡ **How It Works**

### **Automatic Calculation:**

```
1. System calculates current day:
   Today - Batch Start Date = Current Day

2. Determine current stage:
   Day 1-14   = Starter
   Day 14-22  = Grower
   Day 22+    = Finisher

3. Calculate days until next change:
   Next Stage Start Day - Current Day = Days Remaining

4. Trigger alerts:
   Days Remaining ≤ 2 = Show Alert
   Days Remaining = 0 = Critical Alert + Audio

5. Update every hour:
   Auto-refresh to catch new day
```

### **Real-Time Features:**
- ✅ Updates every 1 hour
- ✅ Automatic day calculation
- ✅ Audio notification on change day
- ✅ Toast notification
- ✅ Visual alerts (colored banners)
- ✅ Countdown timers

---

## 🌍 **Bilingual Support**

### **English:**
- Feed Stage Management
- Current Feed Stage
- Upcoming Feed Change
- Recommendations
- Change Feed Now!
- Got It

### **Swahili:**
- Usimamizi wa Hatua za Chakula
- Hatua ya Chakula ya Sasa
- Mabadiliko ya Chakula Yanayokuja
- Mapendekezo
- Badili Chakula Sasa!
- Nimeelewa

---

## 📊 **Example Scenarios**

### **Scenario 1: Day 1 (Just Started)**
```
Current Stage: 🐣 Starter Feed
Status: Active (Day 1)
Next Change: In 13 days
Alert: None
Display: Green "Current Stage" card
```

### **Scenario 2: Day 12 (2 Days Before Change)**
```
Current Stage: 🐣 Starter Feed
Status: Active (Day 12)
Next Change: In 2 days
Alert: 🟡 Orange warning banner
"Upcoming Feed Change: Change to Grower Feed in 2 days"
```

### **Scenario 3: Day 14 (Change Day!)**
```
Current Stage: 🐔 Grower Feed
Status: CHANGE NOW! (Day 14)
Next Change: 0 days
Alert: 🔴 Red critical banner
Audio: Notification sound plays
Toast: "Change Feed Now! Change to Grower Feed"
Action: User clicks "Got It" to acknowledge
```

### **Scenario 4: Day 16 (After Change)**
```
Current Stage: 🐔 Grower Feed
Status: Active (Day 16)
Next Change: In 6 days
Alert: None
Display: Shows Grower stage active, Finisher preview
```

### **Scenario 5: Day 35 (Finisher Stage)**
```
Current Stage: 🍗 Finisher Feed
Status: Active (Day 35)
Next Change: None (harvest window)
Alert: None
Display: Shows ready for harvest (35-42 days)
```

---

## 🎨 **Visual Design**

### **Colors:**
- **Starter**: Blue (`bg-blue-500`)
- **Grower**: Green (`bg-green-500`)
- **Finisher**: Orange (`bg-orange-500`)

### **Alert Colors:**
- **2 Days Before**: Orange banner (`bg-orange-50`)
- **Change Day**: Red banner (`bg-red-50`)
- **Normal**: Blue info (`bg-blue-50`)

### **Icons:**
- **Starter**: 🐣 (Baby chick)
- **Grower**: 🐔 (Young chicken)
- **Finisher**: 🍗 (Ready for harvest)
- **Feed**: 🍎 (Apple)
- **Alert**: ⚠️ (Warning)
- **Calendar**: 📅 (Schedule)
- **Checkmark**: ✅ (Completed)

---

## 🔧 **Technical Details**

### **Component**: `components/user/feed-stage-alerts.tsx`

### **Props:**
```typescript
interface FeedStageAlertsProps {
  batch: {
    id: string
    name: string
    startDate: string
    status: string
    birdCount: number
  }
}
```

### **State Management:**
- `currentDay`: Calculated from start date
- `currentStage`: Active feed stage
- `nextStage`: Upcoming feed stage
- `daysUntilChange`: Countdown
- `showAlert`: Alert visibility
- `hasNotified`: Prevent duplicate notifications

### **Update Frequency:**
- Initial calculation on component mount
- Re-calculates every 1 hour (3,600,000ms)
- Checks for new day and updates alerts

### **Audio Notifications:**
- Plays only on change day (day 0)
- Uses `playNotificationSound()` from audio library
- One-time notification per day (hasNotified flag)

---

## 📱 **Mobile Optimization**

- ✅ Fully responsive design
- ✅ Touch-friendly buttons
- ✅ Swipe-friendly cards
- ✅ Large text for readability
- ✅ Color-coded stages
- ✅ Icons for quick recognition

---

## 🎯 **Benefits for Farmers**

### **Before** (Manual Tracking):
- ❌ Forget feed change dates
- ❌ Wrong feed for bird age
- ❌ Poor growth/FCR
- ❌ Manual calculations
- ❌ No reminders

### **After** (Automatic Alerts):
- ✅ Never miss feed changes
- ✅ Optimal feed at right time
- ✅ Better growth/FCR
- ✅ Automatic calculations
- ✅ Timely reminders

---

## 💡 **Best Practices**

### **For Farmers:**
1. **Check Dashboard Daily** - Review current stage
2. **Act on Alerts** - Change feed when notified
3. **Order Feed Early** - 2-day warning helps planning
4. **Follow Recommendations** - Each stage has specific guidance
5. **Monitor Bird Response** - Ensure smooth transitions

### **For Admins:**
1. **Ensure Start Dates Correct** - Critical for calculations
2. **Educate Farmers** - Explain the alert system
3. **Monitor Compliance** - Check if farmers follow alerts
4. **Track Performance** - Better feed timing = better FCR

---

## 🚀 **Future Enhancements** (Potential)

1. **Custom Feed Schedules** - Allow admins to set custom day ranges
2. **Feed Inventory Tracking** - Track feed bags remaining
3. **Automatic Reordering** - Alert when feed stock low
4. **Performance Correlation** - Link feed changes to FCR/growth
5. **SMS Alerts** - Send SMS on change day
6. **Email Reminders** - Email 2 days before change

---

## ❓ **FAQs**

### **Q: What if I miss the change day?**
A: The alert will continue showing until acknowledged. Feed change is still recommended even if late.

### **Q: Can I change feed earlier than recommended?**
A: Yes, the system is a guide. Follow your veterinarian's advice if different.

### **Q: What if my batch status is not "Active"?**
A: Alerts only show for active batches. Inactive batches won't show feed alerts.

### **Q: Can I customize the day ranges?**
A: Currently fixed (1-14, 14-22, 22+). Custom ranges may be added in future.

### **Q: Does this work offline?**
A: Initial calculation requires date data, but once loaded, works offline until next update.

---

## ✅ **Status: LIVE & ACTIVE**

The Feed Stage Alerts system is:
- ✅ Fully implemented
- ✅ Integrated into batch dashboard
- ✅ Real-time calculations
- ✅ Bilingual support
- ✅ Mobile optimized
- ✅ Audio notifications
- ✅ Visual alerts

---

## 📍 **How to Access**

### **As a Batch User/Farmer:**
1. Login to your batch dashboard
2. Go to **"Dashboard"** tab (default view)
3. Scroll down past statistics cards
4. See **"Feed Stage Management"** card
5. View current stage and alerts
6. Click **"Got It"** to acknowledge alerts

---

## 🎉 **Key Features Summary**

| Feature | Status |
|---------|--------|
| Automatic Day Calculation | ✅ |
| 3 Feed Stages (Starter/Grower/Finisher) | ✅ |
| 2-Day Advance Warning | ✅ |
| Change Day Critical Alert | ✅ |
| Audio Notifications | ✅ |
| Toast Notifications | ✅ |
| Bilingual (English/Swahili) | ✅ |
| Recommendations per Stage | ✅ |
| Visual Timeline | ✅ |
| Mobile Responsive | ✅ |
| Hourly Updates | ✅ |

---

**Smart Feed Management = Better Growth = Higher Profits** 📈🐔

**Questions?** Check the dashboard or contact your admin for assistance!

