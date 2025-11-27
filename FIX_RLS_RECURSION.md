# Fix RLS Infinite Recursion Error

## ❌ Problem
Error: `infinite recursion detected in policy for relation "users"`

## 🔍 Cause
RLS policies on `users` table were querying the `users` table itself, causing infinite recursion.

## ✅ Solution

I've fixed the RLS policies. Now you need to:

### Step 1: Drop Old Policies (In Supabase SQL Editor)

Run this query first to remove problematic policies:

```sql
-- Drop recursive policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Only admins can manage cities" ON cities;
DROP POLICY IF EXISTS "Only admins can manage services" ON services;
DROP POLICY IF EXISTS "Only admins can manage settings" ON admin_settings;
```

### Step 2: Run Fixed Migration

1. Open `supabase/migrations/002_rls_policies.sql` (already fixed)
2. Copy the updated policies section
3. Run in SQL Editor

OR

Run the new fix migration:
1. Open `supabase/migrations/006_fix_rls_recursion.sql`
2. Copy all content
3. Run in SQL Editor

### Step 3: Verify Fix

Run test again:
```bash
npm run test-db
```

## 📝 What Changed

**Before (Causing Recursion):**
```sql
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u  -- ❌ Queries users table while on users table!
            WHERE u.id = auth.uid() 
            AND u.role IN ('admin', 'superadmin')
        )
    );
```

**After (Fixed):**
```sql
-- Users can only see their own data
-- Admin operations use service role in API (no RLS recursion)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
```

## 🎯 Key Changes

1. **Users table**: Removed admin policy that queried users table
2. **Admin operations**: Now handled via API using service role (bypasses RLS)
3. **Client-side**: Users can only access their own data
4. **Admin access**: All admin operations go through API routes with service role

## ✅ Why This Works

- **No recursion**: Policies don't query the same table they're protecting
- **Security maintained**: Admin operations use service role in API (already implemented)
- **Client-side safe**: Users can only access their own data
- **API handles admin**: All admin endpoints already use `supabaseAdmin` (service role)

## 🚀 After Fix

1. Run the fix migration
2. Test connection: `npm run test-db`
3. Should see: ✅ All checks passed!

---

**The fix is ready! Just run the SQL queries above in Supabase SQL Editor.**

