# Quick Start Guide - User Home Redesign

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. View the Redesigned Dashboard
Open your browser and navigate to:
```
http://localhost:3000/dashboard
```

**Note:** You need to be logged in as a user (not admin/provider) to see the dashboard.

## 🎯 What's New?

### New Components

1. **MultiServiceSlider** - Dynamic service discovery
   - Location: `components/user/MultiServiceSlider.js`
   - Auto-playing horizontal slider
   - Smart badges (New, Trending, Booked Before)

2. **ProviderPreview** - Context-aware provider display
   - Location: `components/user/ProviderPreview.js`
   - Shows providers for selected service
   - Expandable list

3. **QuickAccess** - Compact navigation
   - Location: `components/user/QuickAccess.js`
   - Quick links to key features

### New API Endpoint

**Service Discovery API**
```
GET /api/services/discover?city_id={id}&limit={number}
```

Returns services with:
- `is_trending` flag (10+ bookings)
- `is_new` flag (< 7 days old)
- `total_bookings` count
- Sorted by priority

## 📁 File Structure

```
gkk/
├── components/
│   └── user/
│       ├── MultiServiceSlider.js    ← NEW
│       ├── ProviderPreview.js       ← NEW
│       └── QuickAccess.js           ← NEW
├── styles/
│   ├── MultiServiceSlider.module.css ← NEW
│   ├── ProviderPreview.module.css    ← NEW
│   └── QuickAccess.module.css        ← NEW
├── pages/
│   ├── dashboard.js                  ← MODIFIED
│   └── api/
│       └── services/
│           └── discover.js           ← NEW
└── docs/
    ├── USER_HOME_REDESIGN.md         ← NEW
    ├── COMPONENT_HIERARCHY.md        ← NEW
    └── IMPLEMENTATION_CHECKLIST.md   ← NEW
```

## 🔧 How It Works

### User Flow

```
1. User logs in → Redirected to /dashboard
2. Dashboard loads services via /api/services/discover
3. MultiServiceSlider displays services (auto-playing)
4. User clicks a service card
5. ProviderPreview loads providers for that service
6. User clicks a provider
7. ServiceBookingModal opens
8. User completes booking
```

### Data Flow

```
Dashboard Component
    ↓
    ├─→ Load user profile
    ├─→ Load bookings (for history)
    ├─→ Load services (via discover API)
    └─→ Extract user history
         ↓
MultiServiceSlider
    ├─→ Sort services by priority
    ├─→ Display with badges
    └─→ Auto-shuffle
         ↓
User selects service
         ↓
ProviderPreview
    ├─→ Load providers for service
    ├─→ Display provider cards
    └─→ Handle provider selection
         ↓
ServiceBookingModal
    └─→ Complete booking
```

## 🎨 Customization

### Change Auto-Play Speed

Edit `components/user/MultiServiceSlider.js`:
```javascript
// Line ~20
autoPlayRef.current = setInterval(() => {
  setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
}, 4000) // Change this value (milliseconds)
```

### Change Trending Threshold

Edit `pages/api/services/discover.js`:
```javascript
// Line ~40
is_trending: bookingsCount > 10, // Change this number
```

### Change New Service Duration

Edit `pages/api/services/discover.js`:
```javascript
// Line ~35
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
// Change 7 to desired number of days
```

### Modify Colors

Edit respective CSS module files:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your brand colors */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

## 🧪 Testing

### Test Multi-Service Slider

1. Open dashboard
2. Verify slider auto-plays
3. Click left/right arrows
4. Click dot indicators
5. Click a service card
6. Verify provider preview appears

### Test Provider Preview

1. Select a service from slider
2. Verify providers load
3. Click "View All" (if >4 providers)
4. Click a provider card
5. Verify booking modal opens

### Test Quick Access

1. Click each quick access link
2. Verify navigation works
3. Check wallet balance displays
4. Check booking count displays

### Test Responsive Design

1. Resize browser window
2. Verify layout adapts:
   - Desktop: 3 service cards
   - Tablet: 2 service cards
   - Mobile: 1 service card
3. Check mobile sticky button appears

## 🐛 Troubleshooting

### Services Not Loading

**Problem:** Slider is empty

**Solutions:**
1. Check Supabase connection
2. Verify services exist in database
3. Check browser console for errors
4. Verify RLS policies allow reading services

```bash
# Test Supabase connection
node test-connection.js
```

### Provider Preview Not Showing

**Problem:** No providers appear after selecting service

**Solutions:**
1. Verify service has providers in database
2. Check provider `service_ids` array includes selected service
3. Verify providers are active (`is_active = true`)

```sql
-- Check providers for a service
SELECT * FROM providers 
WHERE service_ids @> ARRAY[123]::integer[] 
AND is_active = true;
```

### Slider Not Auto-Playing

**Problem:** Slider doesn't move automatically

**Solutions:**
1. Check browser console for errors
2. Verify component is mounted
3. Check if user has interacted (auto-play pauses on interaction)
4. Refresh the page

### Styles Not Applying

**Problem:** Components look unstyled

**Solutions:**
1. Verify CSS module imports
2. Check class names match
3. Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## 📊 Database Requirements

### Services Table
Ensure services have:
- `id` (primary key)
- `name`
- `description`
- `base_price`
- `category_id`
- `is_active`
- `created_at`

### Providers Table
Ensure providers have:
- `id` (primary key)
- `user_id`
- `business_name`
- `service_ids` (array of service IDs)
- `is_active`
- `avg_rating`
- `total_reviews`

### Bookings Table
For user history:
- `user_id`
- `service_id`
- `provider_id`
- `created_at`

## 🚢 Deployment

### Vercel Deployment

```bash
# Build locally first
npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables

Ensure these are set in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📚 Additional Resources

- [Full Documentation](./USER_HOME_REDESIGN.md)
- [Component Hierarchy](./COMPONENT_HIERARCHY.md)
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 💡 Tips

1. **Performance:** Use React DevTools to check for unnecessary re-renders
2. **Debugging:** Enable verbose logging in development
3. **Testing:** Test on real devices, not just browser DevTools
4. **Accessibility:** Use keyboard navigation to test
5. **Mobile:** Test touch gestures on actual mobile devices

## 🎓 Learning Path

1. Understand the component structure
2. Review the data flow
3. Customize one component (e.g., change colors)
4. Add a new feature (e.g., service filters)
5. Optimize performance
6. Add analytics tracking

## ✅ Success Criteria

Your implementation is successful when:
- [ ] Dashboard loads without errors
- [ ] Services display in slider
- [ ] Slider auto-plays smoothly
- [ ] Provider preview works
- [ ] Booking flow completes
- [ ] Mobile view is responsive
- [ ] No console errors

## 🎉 You're Ready!

The redesigned user home page is now ready to use. Start the dev server and explore the new features!

```bash
npm run dev
```

Visit: http://localhost:3000/dashboard

---

**Need Help?** Check the troubleshooting section or review the full documentation.
