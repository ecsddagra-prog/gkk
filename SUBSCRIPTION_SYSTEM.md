# Subscription-Based Services System

Complete implementation of subscription model workflow for recurring services like Tiffin, Tuition, Milk Delivery, Newspaper, etc.

## 🎯 Overview

This system enables providers to offer subscription-based services with daily broadcast updates, real-time user responses, QR-based delivery tracking, and automated ledger management.

## 📋 Features Implemented

### 1️⃣ Admin Panel - Subscription Configuration

**Location:** `/admin/subscription-services`

**Features:**
- ✅ Toggle to enable/disable subscription model per service
- ✅ Multi-select sub-services (e.g., Breakfast, Lunch, Dinner)
- ✅ Billing cycle configuration (Daily/Weekly/Monthly)
- ✅ Broadcast mandatory setting
- ✅ Ledger tracking toggle
- ✅ Pricing fields with unit support

**API Endpoints:**
- `PUT /api/admin/subscription-config` - Update service subscription settings
- `GET /api/admin/subscription-config` - Fetch subscription-enabled services
- `POST /api/admin/subscription-sub-services` - Add sub-services
- `GET /api/admin/subscription-sub-services` - Fetch sub-services

### 2️⃣ Provider Dashboard - Subscription Control Center

**Location:** `/provider/subscriptions`

**Component:** `components/provider/SubscriptionDashboard.js`

**Features:**

#### Broadcast Updates
- Create daily/weekly menu updates
- Add title, description, and images
- Real-time delivery to all subscribers
- Automatic expiration handling

#### Accepted User List
- View total subscribers
- See today's accepted/rejected/pending responses
- Real-time response tracking
- User details with quantity and location

#### Ledger & Credits
- Per-user subscription ledger
- Track delivered count
- Monitor total billed amount
- View advance paid vs pending balance

#### QR Code Delivery Tracking
- Unique QR code for each provider
- Auto-refresh every 24 hours (security)
- User scans at delivery counter
- Instant delivery confirmation
- Auto-update ledger calculations

#### Analytics
- Daily delivery count
- Monthly delivery statistics
- Accepted vs Delivered gap analysis
- Total outstanding revenue

**API Endpoints:**
- `GET /api/provider/subscription-dashboard` - Fetch dashboard data
- `POST /api/subscriptions/broadcast` - Create broadcast
- `POST /api/subscriptions/qr-generate` - Generate QR token

### 3️⃣ User Dashboard - My Subscriptions

**Location:** `/my-subscriptions`

**Component:** `components/user/SubscriptionPanel.js`

**Features:**

#### Real-Time Subscription Panel
- View all active subscriptions
- Latest broadcast updates
- Accept/Reject/Not Today buttons
- Instant response recording

#### Delivery via QR
- Scan provider QR code
- Enter quantity if needed
- Confirm pickup/delivery
- Auto-ledger update

#### Full Ledger View
- Daily usage records
- Total credits/debits
- Current balance display
- Complete transaction history

**API Endpoints:**
- `GET /api/user/subscriptions` - Fetch user subscriptions
- `GET /api/user/subscription-broadcasts` - Fetch broadcasts
- `POST /api/subscriptions/respond` - Respond to broadcast
- `POST /api/subscriptions/delivery-confirm` - Confirm delivery
- `GET /api/subscriptions/ledger` - View ledger

### 4️⃣ Notifications & Communication

**Features:**
- Real-time alerts for broadcasts
- Notification center integration
- Delivery confirmation updates
- Badge counters for unread updates

### 5️⃣ Database Schema

**Tables Created:**

1. **subscription_sub_services** - Sub-service options (Breakfast, Lunch, etc.)
2. **user_subscriptions** - User subscription records
3. **subscription_broadcasts** - Provider broadcast messages
4. **subscription_responses** - User responses (Accept/Reject/Not Today)
5. **subscription_deliveries** - Delivery tracking records
6. **subscription_ledger** - Credit/Debit transaction ledger
7. **provider_qr_tokens** - Secure QR tokens with rotation

**Key Functions:**
- `generate_provider_qr_token()` - Generate secure QR with 24hr expiry
- `record_subscription_delivery()` - Record delivery and update ledger

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
# Apply the subscription system migration
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20251208_subscription_system.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20251208_subscription_system.sql`
3. Execute

### 2. Configure Services

1. Login as Admin
2. Navigate to `/admin/subscription-services`
3. Select a service (e.g., "Tiffin Service")
4. Enable subscription model
5. Add sub-services (Breakfast, Lunch, Dinner)
6. Set pricing and units
7. Save configuration

### 3. Provider Setup

1. Provider logs in
2. Navigate to `/provider/subscriptions`
3. Generate QR code
4. Create daily broadcast
5. View subscriber responses
6. Track deliveries

### 4. User Flow

1. User subscribes to a service
2. Receives broadcast notifications
3. Responds: Accept/Reject/Not Today
4. Scans QR at delivery
5. Views ledger and balance

## 📊 Benefits

| Stakeholder | Benefit |
|------------|---------|
| **Provider** | Knows exactly who needs service today → No waste, efficient preparation |
| **User** | Transparent account & easy daily confirmation |
| **Admin** | Full platform control on which service uses subscription flow |
| **Business** | Higher retention + recurring transactions |

## ✨ Key Highlights

- ✅ Fully automated daily service workflow
- ✅ Cashless accurate tracking
- ✅ Real-time sync - NO manual updates needed
- ✅ Scales for thousands of users smoothly
- ✅ Secure QR token rotation (prevents screenshot misuse)
- ✅ Premium dashboard UI with modern cards and badges
- ✅ Mobile-first responsive design

## 🔮 Optional Enhancements (Future-Ready)

- Auto Invoice Generation Monthly
- Auto Payment Reminder System
- Wallet / Online Payment Integration
- Delivery Route Optimization using Maps
- Push notifications via Firebase
- SMS alerts via Twilio
- Email notifications via SendGrid

## 🎨 UI/UX Features

- Modern card-based layouts
- Status badges (Delivered, Accepted, Pending, Rejected)
- Smooth transitions for updates
- Mobile-first responsive design
- Premium dashboard styling
- Real-time data updates
- Interactive charts and analytics

## 🔐 Security Features

- QR token rotation every 24 hours
- Secure token validation
- RLS policies on all tables
- Provider-specific QR codes
- Expiry-based token invalidation

## 📱 Pages & Routes

### Admin
- `/admin/subscription-services` - Configure subscription services

### Provider
- `/provider/subscriptions` - Subscription control center
- `/provider/broadcasts` - Manage broadcasts
- `/provider/subscribers` - View subscribers

### User
- `/my-subscriptions` - View and manage subscriptions
- `/subscriptions` - Browse available subscriptions

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, CSS Modules
- **Backend:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime
- **QR Generation:** QR Server API
- **Authentication:** Supabase Auth

## 📞 Support

For issues or questions, refer to the main README.md or contact the development team.

---

**Status:** ✅ Fully Implemented and Production Ready
