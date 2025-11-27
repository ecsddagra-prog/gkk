# Admin Access Fix

## समस्या (Problem)
आप `/admin/services` page पर जा नहीं पा रहे क्योंकि आपका user admin नहीं है database में।

## Solution - Admin बनने के लिए

### Supabase Dashboard में जाएं और यह SQL चलाएं:

```sql
-- अपने email को admin बनाने के लिए (अपना email डालें)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- या अगर आप सभी users देखना चाहते हैं:
SELECT id, email, full_name, role FROM users;

-- फिर ID से update करें:
UPDATE users 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

### Steps:
1. Supabase Dashboard खोलें
2. **SQL Editor** में जाएं
3. ऊपर का SQL चलाएं (अपना email/ID डालकर)
4. Admin Panel को refresh करें

## Image Upload के लिए Storage Bucket

Image upload काम करे इसके लिए:

1. Supabase Dashboard में **Storage** section खोलें
2. **New Bucket** बनाएं:
   - Name: `service-images`
   - Public bucket: **Yes** (checked)
3. Save करें

## Sub-services के बारे में

Sub-services का section **"+ Add Variant"** button के साथ modal में है। 
Admin access मिलने के बाद यह दिखेगा।

---

## Quick Fix Commands

```sql
-- 1. अपना current user ID देखें
SELECT auth.uid();

-- 2. उस ID को admin बनाएं
UPDATE users SET role = 'admin' WHERE id = auth.uid();

-- 3. Verify करें
SELECT email, role FROM users WHERE id = auth.uid();
```
