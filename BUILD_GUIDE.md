# Urban Company Clone - Build & Run Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Modern web browser

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Environment Setup
Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Database Setup
1. Go to Supabase Dashboard
2. Create a new project
3. Run the migration SQL from `supabase/migrations/` in SQL Editor:
   - Start with `001_initial_schema.sql`
   - Run all migration files in order
   - Finally run `012_sub_subservices.sql` (admin services fix)

### Step 4: Build & Run Development Server
```bash
npm run dev
# or
yarn dev
```

### Step 5: Access Application
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **User Interface**: `http://localhost:3000`
- **Provider Dashboard**: `http://localhost:3000/provider/dashboard`

## 📱 Key Features

### User Features
- **Homepage**: Browse services by category
- **Booking**: Complete service booking flow
- **Authentication**: Login/signup for users and providers
- **Profile**: User profile management

### Provider Features
- **Registration**: Provider signup process
- **Dashboard**: Manage bookings and services
- **Document Upload**: Upload required documents
- **Service Management**: Manage available services

### Admin Features
- **Dashboard**: Admin control panel
- **User Management**: Manage users and providers
- **Service Management**: Complete 3-level hierarchy (Category → Service → Sub-service → Sub-sub-service)
- **Booking Management**: Monitor all bookings
- **City Management**: Manage service availability by city

## 🛠️ Admin Services Management (FIXED)

### What Was Fixed:
1. **500 Error Resolution**: Fixed API syntax error in PUT method
2. **Complete Hierarchy**: Added Category → Service → Sub-service → Sub-sub-service support
3. **Enhanced UI**: Full admin interface for managing complex service hierarchies
4. **Image Upload**: Support for images at all levels

### Database Migration Required:
```sql
-- Run this in Supabase SQL Editor (from supabase/migrations/012_sub_subservices.sql)
CREATE TABLE IF NOT EXISTS service_sub_subservices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_service_id UUID REFERENCES service_subservices(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_charge DECIMAL(10,2) DEFAULT 0.00,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_subservices_sub_service 
    ON service_sub_subservices(sub_service_id);

ALTER TABLE service_sub_subservices ENABLE ROW LEVEL SECURITY;

-- Add RLS policies...
```

## 🏗️ Project Structure
```
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── pages/              # Next.js pages and API routes
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API endpoints
│   ├── provider/       # Provider dashboard
│   └── user/           # User-facing pages
├── styles/             # CSS and styling
├── supabase/           # Database migrations and schema
└── public/             # Static assets
```

## 📦 Build Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Production Deployment
```bash
npm run build
npm run start        # Test production build locally
```

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check `.env.local` file
   - Verify Supabase URL and keys
   - Ensure database migrations are applied

2. **Admin Access Error**
   - Set user role to 'admin' in users table
   - Verify RLS policies are enabled

3. **Upload Error**
   - Check Supabase storage bucket configuration
   - Verify service role permissions

4. **Build Error**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify environment variables
3. Ensure all database migrations are applied
4. Check Supabase dashboard for any service issues

## 🎯 Admin Services Testing

After building, test the admin services feature:

1. **Create Admin User**: Set role to 'admin' in database
2. **Access Admin**: Go to `/admin/services`
3. **Add Service**: Test adding service with sub-services and sub-sub-services
4. **Upload Images**: Test image uploads at all levels
5. **Edit Services**: Modify existing services

The admin services management is now fully functional with complete 3-level hierarchy support!
