# Quick Migration Check

## ✅ Supabase Dashboard Me Check Karo

### Step 1: Tables Check (2 minutes)

1. Supabase Dashboard → **Table Editor**
2. Ye tables dikhne chahiye:

**Must Have Tables:**
- ✅ `cities`
- ✅ `service_categories` 
- ✅ `services`
- ✅ `users`
- ✅ `providers`
- ✅ `bookings`
- ✅ `payments`
- ✅ `wallet_transactions`

### Step 2: Data Check (1 minute)

SQL Editor me ye query run karo:

```sql
-- Quick data check
SELECT 
    (SELECT COUNT(*) FROM service_categories) as categories,
    (SELECT COUNT(*) FROM services) as services,
    (SELECT COUNT(*) FROM cities) as cities,
    (SELECT COUNT(*) FROM admin_settings) as settings;
```

**Expected Results:**
- categories: **7**
- services: **40+**
- cities: **8**
- settings: **8**

### Step 3: Test Connection (1 minute)

Terminal me run karo:

```bash
npm run test-db
```

Ya manually test karo:

```sql
-- In SQL Editor
SELECT * FROM cities LIMIT 1;
SELECT * FROM service_categories LIMIT 1;
SELECT * FROM services LIMIT 1;
```

## 🎯 Quick Verification Checklist

- [ ] Supabase Dashboard me Table Editor me tables dikh rahe hain
- [ ] 7 service categories hain
- [ ] 40+ services hain  
- [ ] 8 cities hain (Mumbai, Delhi, etc.)
- [ ] Admin settings table me 8 settings hain
- [ ] No errors in SQL Editor

## ✅ If All Checks Pass

1. **Create Admin User:**
   ```sql
   -- After signup, run this:
   UPDATE users SET role = 'superadmin' WHERE email = 'your-email@example.com';
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

3. **Test Application:**
   - Open http://localhost:3000
   - Try signup/login
   - Check if data loads

## 🐛 If Something Missing

**Tables missing?** → Run migration 001 again
**No data?** → Run migration 003 again  
**RLS errors?** → Run migration 002 again
**Functions missing?** → Run migration 004 again

---

**5 minutes me sab check ho jayega! 🚀**

