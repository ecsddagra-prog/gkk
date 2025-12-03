# Quick Deployment Checklist

## ✅ Completed
- [x] Build successful (no errors)
- [x] Code pushed to GitHub
- [x] Deployment configuration updated
- [x] Production optimizations applied

## 🔄 Next: Vercel Deployment

### Step 1: Environment Variables (CRITICAL!)
Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these for Production:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xowsvzjvevzpqloniwtf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from .env.local]
SUPABASE_SERVICE_ROLE_KEY=[from .env.local]
```

**Optional (if using):**
```
RAZORPAY_KEY_ID=[your_key]
RAZORPAY_KEY_SECRET=[your_secret]
NEXT_PUBLIC_RAZORPAY_KEY_ID=[your_key]
R2_ACCOUNT_ID=[your_id]
R2_ACCESS_KEY_ID=[your_key]
R2_SECRET_ACCESS_KEY=[your_secret]
R2_BUCKET_NAME=[your_bucket]
R2_PUBLIC_URL=[your_url]
```

### Step 2: Deploy
- Vercel will auto-deploy from GitHub push
- OR manually: Vercel Dashboard → Deployments → Redeploy

### Step 3: Verify
Test these URLs (replace with your Vercel URL):
- `https://your-app.vercel.app/` - Homepage
- `https://your-app.vercel.app/api/catalog/bootstrap` - Should return categories

## 📚 Full Guide
See `DEPLOYMENT_GUIDE.md` for complete instructions and troubleshooting.

## ⚠️ Important
Without `SUPABASE_SERVICE_ROLE_KEY`, all API routes will fail!
