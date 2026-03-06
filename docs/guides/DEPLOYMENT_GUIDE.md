# 🚀 Deployment & Setup Guide

## 📋 Prerequisites

- Supabase account (free tier works)
- Netlify account (optional, for hosting)
- PayTR account for production (test mode works without)

## 1️⃣ Database Setup

### Step 1: Run Migration SQL

1. Go to your Supabase Dashboard → SQL Editor
2. Open and run `MIGRATION_ADMIN_SYSTEM.sql`
3. Wait for all tables and policies to be created

### Step 2: Create Storage Buckets

In Supabase Dashboard → Storage:

1. Create bucket: `hero-videos` (public)
2. Create bucket: `showcase-images` (public)  
3. Create bucket: `generations` (public) - if not exists

### Step 3: Set Admin User

Run this SQL to make yourself admin:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your@email.com';
```

## 2️⃣ Environment Variables

Create `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# PayTR (Test - Optional)
VITE_PAYTR_MERCHANT_ID=9999999
VITE_PAYTR_MERCHANT_KEY=test_key
VITE_PAYTR_MERCHANT_SALT=test_salt
```

## 3️⃣ Install Dependencies

```bash
npm install
```

## 4️⃣ Local Development

```bash
npm run dev
```

Open http://localhost:5173

## 5️⃣ Test the System

### Create Test User

1. Click "Giriş Yap" → "Kayıt Ol"
2. Register with email/password
3. You should get 10 free credits automatically

### Make User Admin (Optional)

```sql
UPDATE profiles SET is_admin = true WHERE email = 'test@example.com';
```

### Test Admin Panel

1. Login as admin
2. You should see "⚙️ Admin Panel" button in header
3. Click it to access all admin features

### Test Credit Purchase

1. Login as regular user
2. Click "Kredi Satın Al"
3. Use test card: `4355 0843 5508 4358`
4. Expiry: `12/26`, CVV: `000`
5. Credits should be added automatically

## 6️⃣ Production Deployment

### Netlify Deployment

1. Connect your GitHub repo to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Vercel Deployment

1. Import project from GitHub
2. Framework Preset: Vite
3. Add environment variables
4. Deploy!

## 7️⃣ PayTR Production Setup

### For Real Payments:

1. Sign up at https://www.paytr.com
2. Get your merchant credentials
3. Update environment variables:
   ```env
   VITE_PAYTR_MERCHANT_ID=your_real_merchant_id
   VITE_PAYTR_MERCHANT_KEY=your_real_key
   VITE_PAYTR_MERCHANT_SALT=your_real_salt
   ```
4. Update `lib/paytrService.ts` - set `test_mode: '0'`
5. Setup callback URL in PayTR dashboard

## 8️⃣ Initial Content Upload

### As Admin:

1. Go to Admin Panel → İçerik Yönetimi
2. Upload 4 hero videos for homepage background
3. Upload showcase images (sketch, product, model, video)
4. Content will automatically appear on landing page

### Configure Settings:

1. Go to Admin Panel → Ayarlar
2. Adjust:
   - Initial user credits (default: 10)
   - Credit package prices
   - Credit package amounts
3. Click "Ayarları Kaydet"

## 9️⃣ Monitoring

### Check User Activity:

1. Admin Panel → Kullanıcı Aktivitesi
2. See all users, their credits, and operations

### Check Payments:

1. Admin Panel → Ödemeler
2. Filter by status (completed, pending, failed)
3. View all transaction details

## 🔟 Features Checklist

- ✅ User registration with 10 free credits
- ✅ Admin role detection (is_admin field)
- ✅ Header shows user name + credits
- ✅ Admin panel button (only for admins)
- ✅ Hero videos from database
- ✅ Showcase images from database
- ✅ Credit purchase with PayTR (test mode)
- ✅ Transaction history for users
- ✅ User activity panel for admins
- ✅ Payments panel for admins
- ✅ Settings panel for admins
- ✅ Realtime credit updates
- ✅ Credit deduction on operations

## 🐛 Troubleshooting

### Issue: User not getting 10 credits on signup

**Solution:** Check if migration ran correctly:
```sql
SELECT credits FROM profiles ORDER BY created_at DESC LIMIT 5;
```

### Issue: Admin panel button not showing

**Solution:** Check is_admin field:
```sql
SELECT email, is_admin FROM profiles WHERE email = 'your@email.com';
```

### Issue: PayTR payment not working

**Solution:** Check browser console for errors. Test mode should work without real credentials.

### Issue: Content not appearing on landing page

**Solution:** Upload content via Admin Panel → İçerik Yönetimi. Check console for fetch errors.

### Issue: Realtime updates not working

**Solution:** Check Supabase Realtime is enabled in your project settings.

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [PayTR Docs](https://www.paytr.com/api-dokumantasyon)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

## 💡 Tips

- Always test with test users before production
- Monitor Supabase logs for errors
- Check Supabase Auth settings (email confirmation, etc.)
- Enable Supabase Realtime for instant updates
- Use Supabase Storage for all media files
- Regular database backups recommended

## 🎉 You're Done!

Your admin system is now fully functional with:
- Database-driven content management
- PayTR payment integration
- Admin dashboard with analytics
- Realtime credit updates
- User activity tracking
- Payment history

Enjoy! 🚀

