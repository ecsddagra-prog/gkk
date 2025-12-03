# Vercel Deployment Guide

Is guide se aap apne Next.js project ko Vercel par successfully deploy kar sakte ho.

## Prerequisites

- Vercel account (signup at https://vercel.com)
- GitHub repository with your code
- Supabase project credentials
- Razorpay API keys (if using payments)
- Cloudflare R2 credentials (if using file uploads)

## Step 1: Vercel Project Setup

### 1.1 Connect Repository

1. Vercel dashboard pe jao: https://vercel.com/dashboard
2. **"Add New Project"** button pe click karo
3. Apna GitHub repository select karo
4. **"Import"** pe click karo

### 1.2 Project Configuration

Vercel automatically Next.js detect kar lega. **Configure Project** screen par:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm install --legacy-peer-deps && next build` (auto-configured via vercel.json)
- **Install Command**: `npm install --legacy-peer-deps` (auto-configured)

> **Note**: `vercel.json` file already configured hai, so ye settings automatically apply ho jayengi.

## Step 2: Environment Variables Setup

> **CRITICAL**: Ye sabse important step hai! Agar environment variables sahi se set nahi kiye toh project bilkul kaam nahi karega.

### 2.1 Required Environment Variables

Vercel dashboard me apne project par jao, phir **Settings → Environment Variables**

Ye variables add karo (Production environment ke liye):

#### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://xowsvzjvevzpqloniwtf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key_from_supabase>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_from_supabase>
```

**Kahan se milega?**
- Supabase dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (⚠️ This is secret!)

#### Razorpay Configuration (Optional - for payments)

```
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your_razorpay_key_id>
```

**Kahan se milega?**
- Razorpay Dashboard → Settings → API Keys

#### Cloudflare R2 Configuration (Optional - for image uploads)

```
R2_ACCOUNT_ID=<your_cloudflare_account_id>
R2_ACCESS_KEY_ID=<your_r2_access_key>
R2_SECRET_ACCESS_KEY=<your_r2_secret_key>
R2_BUCKET_NAME=<your_bucket_name>
R2_PUBLIC_URL=<your_r2_public_url>
```

**Kahan se milega?**
- Cloudflare Dashboard → R2 → Manage R2 API Tokens

#### Wallet Webhook (Optional)

```
WALLET_WEBHOOK_SECRET=<any_random_secure_string>
```

### 2.2 Environment Variables Screenshot

Vercel environment variables screen aisa dikhna chahiye:

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | https://xowsvz... | Production |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGci... | Production |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGci... | Production |
| ... | ... | Production |

> **Important**: Har variable ke liye "Production" environment select karo!

### 2.3 Verify Environment Variables

Environment variables add karne ke baad:

1. Scroll down
2. **"Save"** button pe click karo
3. Confirm karo ki saare variables properly saved hain

## Step 3: Deploy

### 3.1 Trigger Deployment

Environment variables set karne ke baad:

1. **Deployments** tab pe jao
2. **"Redeploy"** button pe click karo (ya automatically deploy ho jayega)
3. Wait karo jab tak build complete ho

### 3.2 Monitor Build Logs

Build process monitor karne ke liye:

1. Latest deployment pe click karo
2. **"Building"** section expand karo
3. Logs dekho for any errors

**Common build warnings** (ignore karo agar ye aaye):

```
⚠️ Warning: Missing required environment variables
```

Ye normal hai agar kuch optional variables missing hain like R2 credentials.

**Critical errors** (fix karne honge):

```
❌ Error: SUPABASE_SERVICE_ROLE_KEY not set
❌ Build failed
❌ Module not found
```

## Step 4: Verification

Deployment successful hone ke baad, verify karo:

### 4.1 Basic Checks

1. **Homepage**: Your Vercel URL kholo (e.g., `https://your-project.vercel.app`)
2. **Services Page**: Navigate to services/categories
3. **Login**: Try login functionality

### 4.2 API Routes Testing

Browser console open karo (F12) aur check karo:

**Test 1: Bootstrap API**
```javascript
fetch('https://your-project.vercel.app/api/catalog/bootstrap')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{ categories: [...] }`

**Test 2: Auth Check**
```javascript
fetch('https://your-project.vercel.app/api/provider/rate-quotes/list')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{ error: 'Missing authorization token' }` (this is expected without login)

### 4.3 Error Checking

Agar koi page error dikha raha hai:

1. Browser console check karo (F12 → Console)
2. Network tab dekho for failed requests
3. Vercel deployment logs check karo

## Troubleshooting

### Issue 1: "Supabase admin client not configured"

**Problem**: API routes returning 500 error with this message

**Solution**:
1. Check `SUPABASE_SERVICE_ROLE_KEY` environment variable
2. Verify it's set for "Production" environment
3. Redeploy the project

### Issue 2: "Build Failed"

**Problem**: Deployment failing at build step

**Solution**:
1. Check build logs for specific error
2. Verify `package.json` dependencies
3. Try local build: `npm run build`
4. If local build works but Vercel fails, check Node.js version compatibility

### Issue 3: API Routes Timeout

**Problem**: API requests taking too long and timing out

**Solution**:
- `vercel.json` already configured with 30s timeout
- Check Supabase database performance
- Optimize database queries if needed

### Issue 4: Images Not Loading

**Problem**: Images from Supabase or R2 not displaying

**Solution**:
1. Verify `next.config.js` has correct image domains
2. Check Supabase Storage bucket is public
3. Verify R2 public URL is correct

### Issue 5: CORS Errors

**Problem**: Browser showing CORS errors

**Solution**:
- Supabase automatically handles CORS
- For custom APIs, check API route headers
- Verify Supabase URL is correct

## Custom Domain Setup (Optional)

### Add Custom Domain

1. Vercel project → **Settings → Domains**
2. Enter your domain name
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-10 minutes)

### SSL Certificate

Vercel automatically provides free SSL certificate for:
- `.vercel.app` domains
- Custom domains

## Production Best Practices

### 1. Environment Variables Security

- ✅ Never commit `.env.local` to Git
- ✅ Use different keys for production vs development
- ✅ Regularly rotate `SUPABASE_SERVICE_ROLE_KEY`
- ❌ Don't share service role key publicly

### 2. Monitoring

Setup monitoring:
- Vercel Analytics (included free)
- Supabase Dashboard → Logs
- Check error rates regularly

### 3. Performance

Optimizations already applied:
- ✅ Standalone output (smaller functions)
- ✅ Image optimization configured
- ✅ 30s function timeout for database operations

### 4. Database

Supabase production checklist:
- ✅ Enable RLS policies (already done)
- ✅ Create database backups
- ✅ Monitor connection pool usage
- ✅ Index frequently queried columns

## Quick Reference

### Useful Commands

```bash
# Local development
npm run dev

# Local build test
npm run build
npm start

# Check for build errors
npm run build 2>&1 | tee build.log
```

### Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Your Project**: Will be at `https://your-project-name.vercel.app`

### Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

## Next Steps After Deployment

1. ✅ Test all major features
2. ✅ Configure custom domain (optional)
3. ✅ Setup monitoring
4. ✅ Enable Vercel Analytics
5. ✅ Create backup of environment variables
6. ✅ Document any custom configurations

---

## Need Help?

Agar koi issue aa raha hai deployment mein:

1. Check build logs carefully
2. Verify all environment variables
3. Test locally with `npm run build`
4. Check this troubleshooting guide
5. Review Vercel deployment logs

**Successful deployment ke baad**, aapka project fully functional hona chahiye with:
- ✅ Working authentication
- ✅ Database connectivity
- ✅ API routes functioning
- ✅ File uploads (if R2 configured)
- ✅ Payments (if Razorpay configured)
