# Fix API Error & Add Category Management

## Issues to Fix

1. **500 Error** - `service_sub_subservices` table doesn't exist yet
   - Migration `012_sub_subservices.sql` needs to be applied
   
2. **Category Management** - User wants:
   - Categories expandable/collapsible
   - Edit categories functionality

## Quick Fixes

### 1. Apply Migration

Run this SQL in Supabase Dashboard:

```sql
-- Create sub_subservices table
CREATE TABLE IF NOT EXISTS service_sub_subservices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_service_id UUID REFERENCES service_subservices(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_charge DECIMAL(10,2) DEFAULT 0.00,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_subservices_sub_service 
    ON service_sub_subservices(sub_service_id);

ALTER TABLE service_sub_subservices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sub-sub-services are viewable by everyone"
    ON service_sub_subservices
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Only admins can manage sub-sub-services"
    ON service_sub_subservices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role = 'admin' OR users.role = 'superadmin')
        )
    );
```

### 2. Temporary Fix (Optional)

If you want to test without sub-sub-services first, comment out the nested query:

```javascript
// In pages/api/admin/services.js line 20-22
subservices:service_subservices(*)
// Instead of:
// subservices:service_subservices(
//   *,
//   sub_subservices:service_sub_subservices(*)
// )
```

## Category Features to Add

- Expandable category cards
- Edit category (name, image, icon)
- Add new category
- Delete category (with confirmation)
