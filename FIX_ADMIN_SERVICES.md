# Admin Services Management Fix Plan

## Issues Identified

1. **500 Error in API** - Syntax error in `pages/api/admin/services.js`
   - Variable `updates` declared twice on line 125-127
   - `allUpdates` variable is undefined
   
2. **Missing Database Table** - `service_sub_subservices` table doesn't exist
   - Migration `012_sub_subservices.sql` needs to be applied
   
3. **Sub-sub-service Management** - Missing functionality for adding/editing sub-sub-services

## Fix Steps

### Step 1: Fix API Syntax Error
- [ ] Fix the duplicate `updates` variable declaration in PUT method
- [ ] Fix the undefined `allUpdates` variable

### Step 2: Apply Database Migration
- [ ] Ensure `service_sub_subservices` table exists
- [ ] Verify RLS policies are in place

### Step 3: Update Frontend for Sub-Sub-Services
- [ ] Add sub-sub-services management UI in the admin page
- [ ] Update form handling for 3-level hierarchy (Category → Service → Sub-service → Sub-sub-service)

### Step 4: Test Functionality
- [ ] Test adding new services with sub-services
- [ ] Test editing existing services
- [ ] Test sub-sub-services functionality
