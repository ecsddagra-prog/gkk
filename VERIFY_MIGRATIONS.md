# Migration Verification Guide

## ✅ Quick Verification Steps

### Step 1: Check Tables in Supabase Dashboard

1. Go to Supabase Dashboard
2. Click on "Table Editor" in left sidebar
3. Verify these tables exist:

**Core Tables:**
- ✅ cities
- ✅ service_categories
- ✅ services
- ✅ city_services
- ✅ users
- ✅ user_addresses
- ✅ providers
- ✅ provider_services
- ✅ provider_portfolio

**Booking Tables:**
- ✅ bookings
- ✅ booking_quotes
- ✅ payments
- ✅ wallet_transactions
- ✅ cashback_transactions
- ✅ reward_transactions

**Communication:**
- ✅ chat_messages
- ✅ notifications
- ✅ ratings

**Admin:**
- ✅ admin_settings
- ✅ referrals

### Step 2: Run Verification Queries

1. Go to SQL Editor
2. Open `supabase/migrations/005_verify.sql`
3. Copy and run each query one by one
4. Check results:

**Expected Results:**
- **Categories**: Should show 7
- **Services**: Should show 40+
- **Cities**: Should show 8
- **RLS**: Should show `true` for all key tables
- **Functions**: Should show 3+ functions
- **Settings**: Should show 8 settings

### Step 3: Check Initial Data

Run this query to see inserted data:

```sql
-- Check service categories
SELECT * FROM service_categories ORDER BY name;

-- Check services (first 10)
SELECT s.name, c.name as category 
FROM services s 
JOIN service_categories c ON s.category_id = c.id 
LIMIT 10;

-- Check cities
SELECT * FROM cities ORDER BY name;
```

### Step 4: Verify RLS Policies

1. Go to "Authentication" → "Policies"
2. Check that policies exist for:
   - users
   - bookings
   - providers
   - payments
   - etc.

### Step 5: Test Database Connection

Create a test file or run in your app:

```javascript
// Test connection
const { data, error } = await supabase
  .from('cities')
  .select('*')
  .limit(1)

if (error) {
  console.error('Connection error:', error)
} else {
  console.log('✅ Database connected!', data)
}
```

## 🐛 Common Issues & Fixes

### Issue 1: Tables Not Created
**Solution:** Run migration 001 again, check for errors

### Issue 2: RLS Policies Missing
**Solution:** Run migration 002 again

### Issue 3: No Initial Data
**Solution:** Run migration 003 again

### Issue 4: Functions Not Created
**Solution:** Run migration 004 again

### Issue 5: Foreign Key Errors
**Solution:** Make sure migrations ran in order

## ✅ Success Checklist

After verification, you should have:

- [ ] All 20+ tables created
- [ ] 7 service categories inserted
- [ ] 40+ services inserted
- [ ] 8 cities inserted
- [ ] RLS policies enabled
- [ ] Functions created
- [ ] Admin settings configured
- [ ] Indexes created
- [ ] Foreign keys working

## 🚀 Next Steps After Verification

1. **Create Admin User:**
   ```sql
   -- After signing up, run:
   UPDATE users SET role = 'superadmin' WHERE email = 'your-email@example.com';
   ```

2. **Test Application:**
   ```bash
   npm run dev
   ```

3. **Verify Environment Variables:**
   - Check `.env.local` file
   - Verify Supabase URL and keys

4. **Test API Endpoints:**
   - Try signup/login
   - Test booking creation
   - Check admin dashboard

## 📊 Expected Database Structure

```
Tables: ~25 tables
Categories: 7
Services: 40+
Cities: 8
Functions: 3
Policies: 20+
Indexes: 15+
```

---

**If all checks pass, your database is ready! 🎉**

