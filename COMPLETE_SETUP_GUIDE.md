# Complete Fix Guide - Admin Services Issues

## Current Errors:
1. ❌ `StorageApiError: Bucket not found`
2. ❌ `500 Internal Server Error` on `/api/admin/services`

---

## Fix 1: Create Storage Bucket (CRITICAL)

### Supabase Dashboard में:

1. **Storage** section खोलें
2. **"New Bucket"** क्लिक करें
3. Settings:
   ```
   Name: service-images
   Public: ✅ YES (checked)
   File size limit: 50 MB
   Allowed MIME types: image/*
   ```
4. **Create** दबाएं

### या SQL से (Faster):

```sql
-- Bucket बनाएं
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images', 
  'service-images', 
  true,
  52428800,  -- 50MB
  ARRAY['image/*']
);

-- Verify
SELECT * FROM storage.buckets WHERE id = 'service-images';
```

---

## Fix 2: RLS Policies (अगर अभी तक नहीं किया)

```sql
-- Categories को visible बनाएं
CREATE POLICY "Categories are viewable by everyone" ON service_categories
    FOR SELECT USING (true);

-- Admins को manage करने दें
CREATE POLICY "Only admins can manage categories" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.role = 'superadmin')
        )
    );
```

---

## Fix 3: Admin Role Set करें

```sql
-- अपने user को admin बनाएं
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- या current user को:
UPDATE users 
SET role = 'admin' 
WHERE id = auth.uid();
```

---

## Fix 4: Storage Policies (Optional but Recommended)

```sql
-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'service-images' );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'service-images' 
    AND auth.role() = 'authenticated'
);
```

---

## Complete Setup Checklist

- [ ] Storage bucket `service-images` बनाया (Public = Yes)
- [ ] RLS policies apply किए (categories के लिए)
- [ ] User को admin role दिया
- [ ] Storage policies set किए (optional)
- [ ] Page refresh किया

---

## Testing Steps

1. **Admin Access Test:**
   - Navigate to: `http://localhost:3000/admin/services`
   - Should NOT redirect to dashboard
   - Should see "Manage Services" page

2. **Category Fetch Test:**
   - Click "+ Add Service"
   - "Select Existing Category" dropdown में categories दिखनी चाहिए

3. **Image Upload Test:**
   - Select a service image
   - Should show "Uploading image..." toast
   - Should show "Image uploaded!" success
   - Preview image should appear

4. **Sub-services Test:**
   - Scroll down in modal
   - Click "+ Add Variant"
   - Should add a new sub-service row

5. **Service Creation Test:**
   - Fill all fields
   - Add 1-2 sub-services
   - Click "Create Service"
   - Should show success message
   - Service should appear in list

---

## Troubleshooting

### If bucket still not found:
```sql
-- Check bucket exists
SELECT id, name, public FROM storage.buckets;

-- If exists but not public:
UPDATE storage.buckets 
SET public = true 
WHERE id = 'service-images';
```

### If 500 error persists:
```sql
-- Check service_categories table exists
SELECT * FROM service_categories LIMIT 1;

-- Check service_subservices table exists
SELECT * FROM service_subservices LIMIT 1;
```

### If categories not showing:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'service_categories';

-- Add some test categories
INSERT INTO service_categories (name, is_active) 
VALUES 
  ('Cleaning', true),
  ('Plumbing', true),
  ('Electrical', true);
```

---

## Quick All-in-One SQL

यह सब एक साथ चलाएं:

```sql
-- 1. Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. RLS for categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON service_categories;
CREATE POLICY "Categories are viewable by everyone" ON service_categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage categories" ON service_categories;
CREATE POLICY "Only admins can manage categories" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.role = 'superadmin')
        )
    );

-- 3. Make current user admin
UPDATE users SET role = 'admin' WHERE id = auth.uid();

-- 4. Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'service-images' );

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'service-images' 
    AND auth.role() = 'authenticated'
);

-- 5. Add test categories if none exist
INSERT INTO service_categories (name, is_active) 
VALUES 
  ('Cleaning', true),
  ('Plumbing', true),
  ('Electrical', true)
ON CONFLICT DO NOTHING;

-- 6. Verify everything
SELECT 'Bucket exists:' as check, EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'service-images') as result
UNION ALL
SELECT 'User is admin:', (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
UNION ALL
SELECT 'Categories exist:', EXISTS(SELECT 1 FROM service_categories);
```
