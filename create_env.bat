@echo off
(
echo NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
echo.
echo R2_ACCOUNT_ID=your-r2-account-id
echo R2_ACCESS_KEY_ID=your-r2-access-key-id
echo R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
echo R2_BUCKET_NAME=gkk
echo R2_PUBLIC_URL=https://your-r2-url.r2.dev
echo.
echo RAZORPAY_KEY_ID=your-razorpay-key-id
echo RAZORPAY_KEY_SECRET=your-razorpay-key-secret
echo.
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
) > .env.local.template
echo Template created successfully!
