# 📊 Communication System Database Structure

## Overview
This document outlines the comprehensive database structure for the chart-based communication system in the broiler management application.

## 🗄️ Database Tables

### 1. **User Management Tables**

#### `communication_users`
- **Purpose**: Central user registry for communication system
- **Key Fields**:
  - `user_id`: References existing user from profiles/batches
  - `name`, `email`, `role`: User identification
  - `is_online`, `last_seen`, `status`: Real-time status tracking
  - `avatar_url`: User profile image

#### `user_communication_preferences`
- **Purpose**: User-specific communication settings
- **Key Fields**:
  - `allow_direct_messages`, `allow_group_messages`: Permission controls
  - `notification_sound`, `notification_email`: Notification preferences
  - `auto_away_minutes`: Auto-away timer
  - `message_retention_days`: Message cleanup settings

### 2. **Conversation Management Tables**

#### `conversations`
- **Purpose**: Manages all conversation threads
- **Key Fields**:
  - `conversation_type`: 'direct', 'group', 'broadcast', 'system'
  - `participant_1_id`, `participant_2_id`: Conversation participants
  - `last_message`, `last_message_at`: Latest message info
  - `unread_count_1`, `unread_count_2`: Unread message counts
  - `is_archived`, `is_starred`: Organization flags
  - `priority`: 'low', 'normal', 'high', 'urgent'

#### `group_conversation_participants`
- **Purpose**: Manages group conversation members
- **Key Fields**:
  - `conversation_id`: References conversations table
  - `user_id`: Group member
  - `role`: 'admin', 'moderator', 'member'
  - `joined_at`, `left_at`: Membership timeline

### 3. **Message System Tables**

#### `messages`
- **Purpose**: Stores all messages in conversations
- **Key Fields**:
  - `conversation_id`: Parent conversation
  - `sender_id`, `receiver_id`: Message participants
  - `message`: Message content
  - `message_type`: 'text', 'image', 'file', 'voice', 'video', 'system', 'urgent', 'scheduled'
  - `content_data`: JSONB for rich content and metadata
  - `is_read`, `is_urgent`, `is_scheduled`: Message flags
  - `priority`: 'low', 'normal', 'high', 'urgent'
  - `reply_to_message_id`: For message threading

#### `message_reactions`
- **Purpose**: Emoji reactions to messages
- **Key Fields**:
  - `message_id`: Target message
  - `user_id`: User who reacted
  - `reaction_type`: Emoji or reaction type

#### `message_attachments`
- **Purpose**: File attachments for messages
- **Key Fields**:
  - `message_id`: Parent message
  - `file_name`, `file_type`, `file_size`: File metadata
  - `file_url`, `thumbnail_url`: File storage URLs

### 4. **Notification System Tables**

#### `user_notifications`
- **Purpose**: User-specific notifications
- **Key Fields**:
  - `user_id`: Notification recipient
  - `type`: 'message', 'mention', 'reaction', 'system', 'urgent'
  - `title`, `message`: Notification content
  - `data`: JSONB for additional data
  - `is_read`, `is_urgent`: Notification flags

#### `system_announcements`
- **Purpose**: System-wide announcements
- **Key Fields**:
  - `title`, `message`: Announcement content
  - `announcement_type`: 'info', 'warning', 'urgent', 'maintenance'
  - `target_roles`: Array of roles to target
  - `is_active`, `expires_at`: Visibility controls

### 5. **Analytics & Templates Tables**

#### `communication_stats`
- **Purpose**: Communication analytics and statistics
- **Key Fields**:
  - `user_id`: User being tracked
  - `total_messages_sent`, `total_messages_received`: Message counts
  - `total_conversations`: Conversation count
  - `avg_response_time_minutes`: Response time metrics
  - `daily_stats`, `weekly_stats`, `monthly_stats`: Time-based analytics

#### `message_templates`
- **Purpose**: Quick reply templates
- **Key Fields**:
  - `user_id`: Template owner (NULL for public templates)
  - `title`, `content`: Template details
  - `category`: 'general', 'greeting', 'response', 'urgent', 'info'
  - `is_public`: Can be used by other users
  - `usage_count`: Usage tracking

## 🔧 Database Features

### **Indexes for Performance**
- User lookups by role, online status, activity
- Conversation queries by participants, type, activity
- Message searches by conversation, sender, receiver, type, priority
- Notification filtering by user, type, read status

### **Automated Functions & Triggers**
- **`update_conversation_on_message()`**: Updates conversation metadata when new messages arrive
- **`update_user_online_status()`**: Tracks user online/offline status changes
- **Auto-notification creation**: Creates notifications for new messages
- **Message threading**: Supports reply-to functionality

### **Row Level Security (RLS)**
- Users can only view their own conversations and messages
- Users can only send messages as themselves
- Users can only view their own notifications
- Admin users have broader access for moderation

## 🚀 Setup Instructions

### **1. Run the SQL Script**
```sql
-- Execute the communication-system-tables.sql script in Supabase SQL Editor
```

### **2. Use the Migration API**
```bash
# POST to /api/migrations/setup-communication-system
curl -X POST http://localhost:3000/api/migrations/setup-communication-system
```

### **3. Use the Setup Page**
Visit `/setup-communication` in your app for a guided setup process.

## 📊 Chart-Based Interface Benefits

### **Visual Communication Network**
- **User Nodes**: Different colors/shapes for admins, farmers, users
- **Connection Lines**: Show active conversations between users
- **Status Indicators**: Online/offline, typing, unread messages
- **Priority Visualization**: Urgent messages highlighted

### **Interactive Features**
- **Click to Chat**: Click any user node to start/continue conversation
- **Drag & Drop**: Organize conversations visually
- **Real-time Updates**: Live status changes and message notifications
- **Message Previews**: Hover over connections to see last message

### **Advanced Communication**
- **Rich Messaging**: Text, images, files, voice, video
- **Message Reactions**: Emoji responses to messages
- **Message Threading**: Reply to specific messages
- **Group Conversations**: Multi-user chat rooms
- **Broadcast Messages**: Send to all users or specific groups
- **Message Templates**: Quick reply templates
- **Scheduled Messages**: Send messages at specific times

## 🔒 Security Features

### **Data Protection**
- Row Level Security (RLS) on all tables
- User-specific data access controls
- Message encryption support (ready for implementation)
- File upload security and validation

### **Moderation Tools**
- Message flagging and reporting
- User blocking and muting
- Admin message moderation
- Conversation archiving and deletion

## 📈 Analytics & Insights

### **Communication Metrics**
- Message volume and frequency
- Response time analytics
- User engagement tracking
- Conversation success rates

### **System Performance**
- Database query optimization
- Real-time update efficiency
- File storage management
- Notification delivery tracking

## 🎯 Next Steps

1. **Set up the database tables** using the provided SQL script
2. **Implement the chart-based UI** using the database structure
3. **Add real-time features** with Supabase subscriptions
4. **Integrate with existing user system** for seamless authentication
5. **Test and optimize** the communication system performance

This comprehensive database structure provides the foundation for a powerful, scalable, and feature-rich communication system that will enhance user interaction in your broiler management application.
