env_content = """NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=gkk
R2_PUBLIC_URL=https://your-r2-url.r2.dev

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
"""

with open('.env.local.new', 'w', encoding='utf-8') as f:
    f.write(env_content)

print("✅ Clean .env.local.new file created!")
print("\nNow:")
print("1. Delete the old .env.local")
print("2. Rename .env.local.new to .env.local")
print("3. Fill in your actual Supabase keys")
