# Storage Bucket बनाएं - Image Upload के लिए

## Error जो आ रहा है:
```
StorageApiError: Bucket not found
```

## Solution - Storage Bucket Create करें

### Method 1: Supabase Dashboard (Recommended)

1. **Supabase Dashboard** खोलें
2. Left sidebar में **Storage** पर क्लिक करें
3. **New Bucket** button दबाएं
4. Details भरें:
   - **Name:** `service-images`
   - **Public bucket:** ✅ **YES** (यह जरूरी है!)
   - **File size limit:** 50MB (optional)
   - **Allowed MIME types:** `image/*` (optional)
5. **Create bucket** दबाएं

### Method 2: SQL से Create करें

Supabase SQL Editor में यह चलाएं:

```sql
-- Storage bucket create करें
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Verify करें
SELECT * FROM storage.buckets WHERE id = 'service-images';
```

### Method 3: Supabase CLI (अगर installed है)

```bash
# Create bucket
supabase storage create service-images --public

# या manual SQL file से
supabase db execute --file create_bucket.sql
```

## Bucket Policies (Optional - Better Security)

अगर आप specific policies चाहते हैं:

```sql
-- Anyone can read (GET)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'service-images' );

-- Only authenticated users can upload (INSERT)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'service-images' 
    AND auth.role() = 'authenticated'
);

-- Only authenticated users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'service-images' AND auth.uid() = owner );

-- Only authenticated users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'service-images' AND auth.uid() = owner );
```

## Verification

Bucket बनने के बाद test करें:

1. Admin Panel में जाएं
2. "+ Add Service" क्लिक करें
3. Service Image में file select करें
4. Upload होना चाहिए (loading toast दिखेगा)
5. Success message आएगा

## Troubleshooting

अगर फिर भी काम न करे:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets;

-- Check bucket is public
SELECT id, name, public FROM storage.buckets WHERE id = 'service-images';

-- If not public, make it public
UPDATE storage.buckets SET public = true WHERE id = 'service-images';
```
