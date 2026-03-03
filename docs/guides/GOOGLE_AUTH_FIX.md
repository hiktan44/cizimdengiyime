# Google OAuth Giriş Sorunu - Çözüm Rehberi

## ✅ Yapılan Değişiklikler

### 1. useAuth Hook İyileştirmesi
- Profile bulunamazsa otomatik olarak yeni profile oluşturuluyor
- Google OAuth başarılı olduğunda konsola log yazılıyor
- Hata durumlarında kullanıcı bilgilendiriliyor

### 2. App.tsx İyileştirmesi  
- User var ama profile yok durumunda özel mesaj gösteriliyor
- Debug logları eklendi (konsol çıktılarından takip edilebilir)
- "Başla" butonunda profile kontrolü eklendi

## 🔧 Supabase Console'da Yapılması Gerekenler

### 1. OAuth Redirect URLs Kontrol
Supabase Dashboard > Authentication > URL Configuration kısmına gidin ve aşağıdaki URL'leri ekleyin:

```
http://localhost:5173
http://localhost:5173/
https://yourdomain.com
https://yourdomain.com/
```

**Önemli:** Hem `/` ile biten hem de bitmeyen versiyonları ekleyin!

### 2. Google OAuth Provider Ayarları
Supabase Dashboard > Authentication > Providers > Google kısmında:

- ✅ Google provider'ın aktif olduğundan emin olun
- ✅ Client ID ve Client Secret'in doğru girildiğinden emin olun
- ✅ "Skip nonce check" seçeneği aktif olabilir (bazı durumlarda gerekli)

### 3. RLS Policies Kontrol
Supabase Dashboard > SQL Editor'de aşağıdaki SQL'i çalıştırarak policy'leri kontrol edin:

```sql
-- Mevcut policy'leri listele
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';
```

Eğer INSERT policy yoksa:

```sql
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
```

### 4. Trigger Kontrol
Trigger'ın düzgün çalıştığından emin olmak için:

```sql
-- Trigger'ı listele
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

Eğer trigger yoksa `supabase-setup.sql` dosyasını tekrar çalıştırın.

### 5. Manuel Profile Oluşturma (Acil Durum)
Eğer trigger çalışmıyorsa, Google ile giriş yapan kullanıcı için manuel profile oluşturmak:

```sql
-- Kullanıcının ID'sini bulun (auth.users tablosunda)
SELECT id, email FROM auth.users WHERE email = 'kullanici@email.com';

-- Profile oluşturun
INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
VALUES (
    'USER_ID_BURAYA', 
    'kullanici@email.com', 
    'Kullanıcı Adı', 
    10, 
    'free'
);
```

## 🧪 Test Adımları

1. **Tarayıcı Console'u Açın** (F12)
2. **Google ile giriş yapın**
3. **Console'da şu mesajları görmelisiniz:**
   ```
   Starting Google sign in...
   Google OAuth initiated: {...}
   Auth State: { user: true, profile: true, ... }
   ```

4. **Eğer şunu görüyorsanız:**
   ```
   Profile not found, creating new profile...
   Profile created successfully
   ```
   Bu normaldir ve düzeltiyor demektir!

5. **Network sekmesinde** Supabase isteklerini kontrol edin:
   - `auth/v1/token` - Başarılı olmalı (200)
   - `rest/v1/profiles` - Başarılı olmalı (200 veya 201)

## 🐛 Hala Çalışmıyorsa

### Senaryo 1: "Profile oluşturuluyor..." mesajı sürekli görünüyor
**Çözüm:**
- Supabase RLS policy'lerini kontrol edin
- INSERT policy'sinin olduğundan emin olun
- Konsol hatalarını kontrol edin

### Senaryo 2: Google OAuth sayfası açılmıyor
**Çözüm:**
- Supabase'de Google Client ID/Secret'in doğru girildiğini kontrol edin
- Pop-up engelleyicilerin kapalı olduğundan emin olun

### Senaryo 3: OAuth callback çalışıyor ama session oluşmuyor
**Çözüm:**
- Tarayıcı localStorage'ı temizleyin
- Supabase'de "Site URL" ayarını kontrol edin (Settings > API)

## 📞 Debug İçin Konsol Komutları

Tarayıcı konsolunda şunları çalıştırabilirsiniz:

```javascript
// Mevcut session'ı kontrol et
supabase.auth.getSession().then(console.log)

// Mevcut user'ı kontrol et
supabase.auth.getUser().then(console.log)

// Profile'ı manuel çek
supabase.from('profiles').select('*').then(console.log)
```

## 📝 Notlar

- İlk Google girişinde profile oluşturma 2-3 saniye sürebilir
- Bu normal bir davranıştır ve sadece ilk girişte olur
- Sonraki girişlerde anında giriş yapacaktır
- Kullanıcılar başlangıçta 10 ücretsiz kredi alırlar

## ✨ Sonraki Adımlar

Eğer sorun devam ediyorsa:

1. Terminal çıktısını kontrol edin
2. Tarayıcı console çıktısını paylaşın  
3. Supabase Dashboard > Logs kısmını kontrol edin
4. Network isteklerini (F12 > Network) inceleyin

