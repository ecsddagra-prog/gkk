# Supabase Migration Guide

## 📋 Migration Files

You have 4 migration files that need to be run in order:

1. `001_initial_schema.sql` - Creates all database tables
2. `002_rls_policies.sql` - Sets up Row Level Security policies
3. `003_initial_data.sql` - Inserts initial data (categories, services, cities)
4. `004_functions.sql` - Creates database functions

## 🚀 Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Login to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New query"

### Step 3: Run Migrations in Order

#### Migration 1: Initial Schema
1. Open `supabase/migrations/001_initial_schema.sql`
2. Copy ALL content
3. Paste in SQL Editor
4. Click "Run" or press `Ctrl+Enter`
5. Wait for success message

#### Migration 2: RLS Policies
1. Open `supabase/migrations/002_rls_policies.sql`
2. Copy ALL content
3. Paste in SQL Editor (new query)
4. Click "Run"
5. Wait for success message

#### Migration 3: Initial Data
1. Open `supabase/migrations/003_initial_data.sql`
2. Copy ALL content
3. Paste in SQL Editor (new query)
4. Click "Run"
5. Wait for success message

#### Migration 4: Functions
1. Open `supabase/migrations/004_functions.sql`
2. Copy ALL content
3. Paste in SQL Editor (new query)
4. Click "Run"
5. Wait for success message

### Step 4: Verify Tables
1. Go to "Table Editor" in left sidebar
2. You should see all tables:
   - cities
   - service_categories
   - services
   - users
   - providers
   - bookings
   - etc.

## 🔧 Method 2: Using Supabase CLI (Advanced)

### Install Supabase CLI
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link Your Project
```bash
supabase link --project-ref your-project-ref
```

### Run Migrations
```bash
supabase db push
```

## ⚠️ Important Notes

1. **Run migrations in order** - They depend on each other
2. **Don't skip any migration** - Each builds on the previous
3. **Check for errors** - If any migration fails, fix it before proceeding
4. **Backup first** - If you have existing data, backup first

## ✅ Verification Checklist

After running all migrations, verify:

- [ ] All tables created (check Table Editor)
- [ ] Service categories inserted (7 categories)
- [ ] Services inserted (40+ services)
- [ ] Cities inserted (8 default cities)
- [ ] RLS policies enabled (check Authentication > Policies)
- [ ] Functions created (check Database > Functions)

## 🐛 Troubleshooting

### Error: "relation already exists"
- Tables already exist, skip that migration or drop tables first

### Error: "permission denied"
- Check if you're using the correct database user
- Use Service Role key for admin operations

### Error: "syntax error"
- Check SQL syntax
- Make sure you copied the entire file

## 📝 Next Steps After Migrations

1. Create your first admin user:
   ```sql
   -- After signing up normally, run this in SQL Editor:
   UPDATE users SET role = 'superadmin' WHERE email = 'your-email@example.com';
   ```

2. Verify environment variables in `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

3. Test the application:
   ```bash
   npm run dev
   ```

## 🎯 Quick Start Commands

```bash
# 1. Copy migration content
# 2. Paste in Supabase SQL Editor
# 3. Run each migration
# 4. Verify tables
# 5. Create admin user
# 6. Start dev server
npm run dev
```

