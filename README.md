# Home Solution - Multi-Service Platform

A comprehensive home & lifestyle service platform built with Next.js, Supabase, and Vercel.

## Features

- 🏠 Multi-service platform (Cleaning, Repair, Vehicle, Personal Care, etc.)
- 🏙️ Multi-city support with admin controls
- 👥 Provider management with location tracking
- 💰 Wallet, Cashback & Rewards system
- 💬 Real-time chat support
- ⭐ Ratings & Reviews
- 🎁 Referral system
- 👨‍💼 Admin & Superadmin dashboards
- 📱 Responsive web application

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel (Serverless)
- **Payments**: Razorpay
- **Notifications**: Firebase, Twilio, SendGrid
- **Real-time**: Supabase Realtime, Socket.io

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Copy your Supabase URL and keys

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in all the required environment variables

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel
   ```
   Configure all environment variables in Vercel dashboard

## Project Structure

```
├── api/                 # Vercel serverless API routes
├── components/          # React components
├── lib/                 # Utilities and Supabase client
├── pages/               # Next.js pages
├── public/              # Static assets
├── supabase/            # Database migrations
└── styles/              # CSS files
```

## Database Schema

See `supabase/migrations/` for complete database schema including:
- Users, Providers, Admins
- Services, Categories, Cities
- Bookings, Payments, Wallet
- Ratings, Reviews, Chat
- Referrals, Rewards, Cashback

## API Routes

All API routes are in `/api` directory:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/providers/*` - Provider management
- `/api/bookings/*` - Booking system
- `/api/admin/*` - Admin controls
- `/api/payments/*` - Payment processing
- `/api/chat/*` - Chat system

## License

MIT

