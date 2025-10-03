# 🐔 Unified Broiler Management System

## 📋 Overview

The Unified Broiler Management System is a complete, self-contained solution that automatically manages users, batches, and reports with real-time calculations and updates. The system eliminates manual data entry and ensures data consistency across all operations.

## 🎯 Key Features

### ✅ **Complete User Management**
- **Unified Users Table**: Stores all user types (admin, farmers, batch users) in one place
- **Automatic Batch Assignment**: Batch users are automatically linked to their batches
- **Role-Based Access**: Different permissions for admin, farmers, and batch users
- **Real-Time Status**: Online/offline status tracking for communication

### ✅ **Automatic Batch Calculations**
- **Real-Time Updates**: When users submit reports, batch statistics update automatically
- **Mortality Tracking**: Automatically subtracts deaths from bird count and adds to mortality
- **Health Scoring**: Automatic health status calculation based on mortality rates
- **Feed Efficiency**: Automatic feed conversion ratio calculations
- **Performance Metrics**: Weight gain rates, vaccination tracking, etc.

### ✅ **Self-Managing System**
- **Database Triggers**: Automatic updates when reports are submitted
- **Smart Calculations**: Intelligent health scoring and performance metrics
- **Data Validation**: Ensures data consistency and prevents errors
- **Audit Trail**: Complete tracking of all changes and updates

## 🗄️ Database Structure

### **unified_users Table**
```sql
- id (UUID, Primary Key)
- user_type (admin, farmer, batch_user)
- name, email, phone
- username, password_hash (for batch users)
- batch_id, batch_name (for batch users)
- farmer_id, farmer_name (for batch users)
- is_active, is_online, status
- avatar_url, address, notes
- created_at, updated_at
```

### **Enhanced batches Table**
```sql
- id, name, farmer_name, farmer_id
- bird_count, total_mortality, remaining_birds
- mortality_rate, health_score, health_status
- feed_efficiency, current_weight, feed_used
- vaccinations, temperature, humidity
- status, start_date, expected_harvest_date
- last_mortality_update, created_at, updated_at
```

### **Enhanced reports Table**
```sql
- id, batch_id, batch_name, farmer_name
- report_type, fields, processed_data
- auto_calculated, batch_updated
- urgency_level, created_at, updated_at
```

## 🔧 API Endpoints

### **User Management**
- `GET /api/unified/users` - Get all users
- `POST /api/unified/users` - Create new user
- `PUT /api/unified/users` - Update user
- `DELETE /api/unified/users` - Deactivate user

### **Batch Management**
- `GET /api/unified/batches` - Get all batches with statistics
- `POST /api/unified/batches` - Create new batch
- `PUT /api/unified/batches` - Update batch
- `DELETE /api/unified/batches` - Delete batch

### **Report Processing**
- `GET /api/unified/reports` - Get all reports
- `POST /api/unified/reports` - Submit report (auto-updates batch)

### **System Setup**
- `POST /api/unified/setup` - Initialize complete system
- `GET /api/unified/setup` - Check system status

## 🚀 Quick Start

### 1. **Initialize the System**
```bash
POST /api/unified/setup
```
This creates all tables, functions, triggers, and sample data.

### 2. **Create Users**
```javascript
// Create admin
POST /api/unified/users
{
  "userType": "admin",
  "name": "System Admin",
  "email": "admin@broiler.com"
}

// Create farmer
POST /api/unified/users
{
  "userType": "farmer", 
  "name": "John Farmer",
  "email": "john@farmer.com",
  "phone": "+1234567890"
}
```

### 3. **Create Batch**
```javascript
POST /api/unified/batches
{
  "name": "Batch #001",
  "farmerName": "John Farmer",
  "farmerId": "farmer-uuid",
  "startDate": "2024-01-01",
  "birdCount": 1000,
  "expectedHarvestDate": "2024-02-15"
}
```

### 4. **Submit Reports (Auto-Updates Batch)**
```javascript
// Mortality report - automatically updates batch
POST /api/unified/reports
{
  "batchId": "batch-uuid",
  "reportType": "mortality",
  "fields": {
    "mortalityCount": 5,
    "cause": "Disease",
    "location": "Pen A"
  }
}
// This automatically:
// - Subtracts 5 from remaining_birds
// - Adds 5 to total_mortality
// - Calculates new mortality_rate
// - Updates health_score and health_status
```

## 🔄 Automatic Calculations

### **When Mortality Report is Submitted:**
1. **Subtracts deaths** from `remaining_birds`
2. **Adds deaths** to `total_mortality`
3. **Calculates mortality_rate** = (total_mortality / bird_count) * 100
4. **Updates health_score** based on mortality rate:
   - 0-1% mortality = 100 health score (Excellent)
   - 1-3% mortality = 80 health score (Good)
   - 3-5% mortality = 60 health score (Fair)
   - 5-10% mortality = 40 health score (Poor)
   - >10% mortality = 20 health score (Critical)
5. **Updates health_status** based on health score
6. **Records timestamp** of last mortality update

### **When Daily Report is Submitted:**
- Processes mortality, feed, health, environment data
- Updates all relevant batch fields automatically
- Maintains data consistency across all metrics

### **When Feed Report is Submitted:**
- Updates `feed_used` with new amount
- Calculates `feed_efficiency` = feed_used / (current_weight * remaining_birds)
- Updates `current_weight` if provided

## 📊 Database Functions

### **update_batch_statistics(batch_uuid)**
- Automatically recalculates all batch statistics
- Updates mortality rates, health scores, feed efficiency
- Called by triggers when reports are submitted

### **create_unified_user(...)**
- Creates users with proper validation
- Automatically assigns batch information
- Ensures data consistency

### **get_communication_users()**
- Returns all active users for communication system
- Includes batch and farmer information
- Sorted by user type and name

## 🔗 Database Triggers

### **trigger_mortality_update**
- Automatically fires when mortality or daily reports are submitted
- Calls `update_batch_statistics()` function
- Ensures real-time updates without manual intervention

## 📈 Views for Easy Querying

### **batch_statistics**
- Complete batch information with calculated fields
- Includes mortality rates, health scores, performance metrics
- Ready for dashboard display

### **communication_users_view**
- All users formatted for communication system
- Includes display names and status information
- Sorted and organized for easy use

## 🎯 Benefits

### **For Administrators:**
- Complete oversight of all users and batches
- Real-time monitoring of system health
- Automatic data validation and consistency
- Comprehensive reporting and analytics

### **For Farmers:**
- Easy batch management
- Automatic calculation of performance metrics
- Real-time health status updates
- Simplified reporting process

### **For Batch Users:**
- Direct access to their specific batch
- Automatic updates when they submit reports
- Clear visibility into batch performance
- Streamlined communication with farmers and admin

## 🔧 Maintenance

### **System Health Check:**
```bash
GET /api/unified/setup
```
Returns system status and component health.

### **Data Integrity:**
- All calculations are automatic and consistent
- Triggers ensure data is always up-to-date
- Validation prevents invalid data entry
- Audit trail tracks all changes

### **Performance:**
- Indexes on all frequently queried fields
- Optimized functions for calculations
- Efficient triggers for updates
- Views for complex queries

## 🚨 Error Handling

The system includes comprehensive error handling:
- **Validation errors** for invalid data
- **Constraint violations** for data integrity
- **Graceful degradation** for missing data
- **Detailed logging** for debugging
- **Rollback support** for failed operations

## 📝 Example Workflow

1. **Admin creates farmer** → Farmer appears in unified_users
2. **Farmer creates batch** → Batch appears with farmer assignment
3. **System creates batch_user** → Batch user automatically linked to batch
4. **Batch user submits mortality report** → Batch automatically updated:
   - remaining_birds: 1000 → 995
   - total_mortality: 0 → 5
   - mortality_rate: 0% → 0.5%
   - health_score: 100 → 100
   - health_status: Excellent → Excellent
5. **Admin views dashboard** → Sees updated statistics in real-time
6. **Communication system** → Shows all users with current status

## 🎉 Conclusion

The Unified Broiler Management System provides:
- **Complete automation** of data management
- **Real-time calculations** and updates
- **Self-contained operation** with minimal maintenance
- **Comprehensive user management** for all user types
- **Automatic batch tracking** with intelligent calculations
- **Seamless integration** with existing communication system

The system is designed to be **plug-and-play** - once initialized, it manages itself with automatic calculations, updates, and data consistency.
