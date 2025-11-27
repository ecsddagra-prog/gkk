# Fix Category Fetching in Admin Panel

## Problem
Categories are not loading in the "Add Service" modal because of missing RLS (Row Level Security) policies.

## Solution
Apply the migration `011_fix_category_rls.sql` to your Supabase database.

## Steps to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/011_fix_category_rls.sql`
4. Paste into the SQL Editor
5. Click **Run**

### Option 2: Using Supabase CLI
If you have Supabase CLI installed:
```bash
supabase db push
```

### Option 3: Manual SQL Execution
Run this SQL directly in your Supabase SQL Editor:

```sql
-- Fix RLS policies for service_categories to allow fetching
-- This fixes the issue where categories were not loading in the Admin Panel

-- Allow everyone to view active categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON service_categories
    FOR SELECT USING (true);

-- Only admins can manage categories (insert/update/delete)
CREATE POLICY "Only admins can manage categories" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.role = 'superadmin')
        )
    );
```

## Verification
After applying the migration:
1. Refresh your Admin Panel page
2. Click "+ Add Service"
3. The "Select Existing Category" dropdown should now show categories

## Additional Note
Make sure you also have a public storage bucket named `service-images` for image uploads to work.
