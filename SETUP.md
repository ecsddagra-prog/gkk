# Home Solution - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)
- Razorpay account (for payments)
- Twilio account (for SMS/OTP)
- SendGrid account (for emails)
- Firebase account (for push notifications)

## Step 1: Clone and Install

```bash
cd gkk
npm install
```

## Step 2: Set up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in Supabase dashboard
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_initial_data.sql`
4. Copy your Supabase URL and anon key from Settings > API

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in all the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# SendGrid
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@homesolution.com

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Firebase
FIREBASE_SERVER_KEY=your_firebase_server_key
FIREBASE_PROJECT_ID=your_firebase_project_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Create First Admin User

After running migrations, you need to create an admin user:

1. Sign up normally through the app
2. Go to Supabase dashboard > Table Editor > users
3. Find your user and change `role` to `admin` or `superadmin`

Or use Supabase SQL Editor:

```sql
-- Replace 'your-user-id' with actual user ID from auth.users
UPDATE users SET role = 'superadmin' WHERE id = 'your-user-id';
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
├── api/                    # API routes (Next.js pages/api)
│   ├── auth/              # Authentication endpoints
│   ├── bookings/          # Booking management
│   ├── payments/          # Payment processing
│   ├── admin/             # Admin endpoints
│   ├── chat/              # Chat system
│   └── ratings/           # Ratings & reviews
├── lib/                    # Utilities
│   ├── supabase.js       # Supabase client
│   └── utils.js           # Helper functions
├── pages/                  # Next.js pages
│   ├── admin/            # Admin pages
│   └── api/              # API routes
├── supabase/              # Database migrations
│   └── migrations/       # SQL migration files
└── styles/                # CSS files
```

## Key Features Implemented

✅ Multi-service platform with 7 categories
✅ Multi-city support with admin controls
✅ User & Provider management
✅ Dynamic pricing/quote system
✅ Wallet, Cashback & Rewards
✅ Real-time chat
✅ Ratings & Reviews
✅ Referral system
✅ Admin & Superadmin dashboards
✅ Payment integration (Razorpay)
✅ Location-based provider matching

## Next Steps

1. Set up Supabase Storage for file uploads (provider portfolio, review photos)
2. Configure Firebase for push notifications
3. Set up Twilio for SMS/OTP
4. Configure SendGrid for emails
5. Test payment flow with Razorpay test keys
6. Add more admin features as needed

## Support

For issues or questions, check the README.md file.

