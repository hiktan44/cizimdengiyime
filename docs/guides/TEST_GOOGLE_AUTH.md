# Google OAuth Test Rehberi

## 🎯 Yapılan İyileştirmeler

### 1. Detaylı Console Logları
Artık tüm auth işlemleri konsolda detaylı şekilde loglanıyor:
- 🔐 Auth initialization
- 👤 Profile fetching
- 🆕 Profile creation
- ✅ Success messages
- ❌ Error messages

### 2. OAuth Callback İyileştirmesi
- Session doğru şekilde handle ediliyor
- URL hash temizleme sonraya alındı
- Profile yoksa otomatik oluşturuluyor

### 3. Otomatik Yönlendirme
- Giriş başarılı olduğunda modal otomatik kapanıyor
- Kullanıcı tool sayfasına yönlendiriliyor
- State senkronizasyonu sağlanıyor

## 🧪 Test Adımları

### 1. Tarayıcı Hazırlığı
```bash
# Önce mevcut session'ı temizleyin
1. F12 ile Developer Tools'u açın
2. Console sekmesine gidin
3. Application > Local Storage > http://localhost:3005 > Clear All
```

### 2. Sayfayı Yenileyin
```
Ctrl + Shift + R (Hard Refresh)
```

### 3. Google ile Giriş
```
1. "Giriş Yap" butonuna tıklayın
2. "Google ile Devam Et" butonuna tıklayın
3. Google hesabınızı seçin
4. İzinleri onaylayın
```

### 4. Console Çıktılarını İzleyin

Başarılı giriş için görmek istediğiniz loglar:

```
🔐 Initializing auth...
Session: ✅ Active
User found: kullanici@email.com
👤 Fetching profile for user: xxx-xxx-xxx

// Eğer ilk girişse:
❌ Profile fetch error: PGRST116 (Profile not found)
🆕 Profile not found, creating new profile...
🔨 Creating profile for user: xxx-xxx-xxx
📝 User metadata: {...}
📤 Inserting profile: {...}
✅ Profile created successfully: {...}
🔄 Reloading page to sync state...

// Sayfa yenilendikten sonra:
🔐 Initializing auth...
Session: ✅ Active
User found: kullanici@email.com
👤 Fetching profile for user: xxx-xxx-xxx
✅ Profile loaded: kullanici@email.com Credits: 10
✅ User logged in, closing auth modal
```

### 5. Auth State Kontrolü

Console'da şunu çalıştırın:
```javascript
// Session kontrolü
await supabase.auth.getSession().then(d => console.log('Session:', d))

// Profile kontrolü
await supabase.from('profiles').select('*').then(d => console.log('Profile:', d))
```

## ❌ Olası Hatalar ve Çözümleri

### Hata 1: "Session: ❌ None"
**Problem:** OAuth callback sonrası session oluşmadı
**Çözüm:**
- Supabase'de Redirect URL'leri kontrol edin
- Google OAuth credentials'ı kontrol edin

### Hata 2: "Profile fetch error: 42501"
**Problem:** RLS policy hatası
**Çözüm:**
```sql
-- Supabase SQL Editor'de çalıştırın
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
```

### Hata 3: Profile oluşturuluyor ama modal kapanmıyor
**Problem:** State güncellemesi gecikmeli
**Çözüm:**
- Sayfa otomatik yenilenecek
- Manuel yenilemek için: `window.location.reload()`

### Hata 4: "User not found when creating profile"
**Problem:** OAuth callback session'ı henüz tam oluşmadı
**Çözüm:**
- Sayfayı yenileyin
- Tekrar giriş yapın

## 🔍 Debug Komutları

Browser console'da çalıştırabilecekleriniz:

```javascript
// 1. Mevcut auth state
console.table({
  hasUser: !!user,
  hasProfile: !!profile,
  loading: loading,
  email: user?.email,
  credits: profile?.credits
})

// 2. Session detayları
supabase.auth.getSession().then(({data}) => {
  console.log('Session expires at:', new Date(data.session?.expires_at * 1000))
  console.log('Access token:', data.session?.access_token?.substring(0, 20) + '...')
})

// 3. Profile detayları
supabase.from('profiles')
  .select('*')
  .then(({data}) => console.table(data))

// 4. Force refresh profile
refreshProfile()

// 5. Sign out
signOut()
```

## 📊 Supabase Dashboard Kontrolleri

### 1. Authentication > Users
- Yeni kullanıcının listelendiğini kontrol edin
- Email doğru mu?
- Last sign in zamanı güncel mi?

### 2. Table Editor > profiles
- Profile kaydının oluşturulduğunu kontrol edin
- Credits: 10 olmalı
- Email doğru mu?

### 3. Logs > Postgres Logs
- INSERT INTO profiles sorgusu başarılı mı?
- Herhangi bir RLS policy hatası var mı?

### 4. Logs > Auth Logs
- OAuth callback başarılı mı?
- Token exchange yapıldı mı?

## ✅ Başarı Kriterleri

Giriş başarılı sayılır eğer:

1. ✅ Console'da "✅ User logged in" görünüyorsa
2. ✅ Header'da kullanıcı emaili görünüyorse  
3. ✅ Kredi sayısı (10) görünüyorse
4. ✅ Tool sayfasına erişim varsa
5. ✅ Supabase'de profile kaydı varsa

## 🚨 Acil Durum: Manuel Profile Oluşturma

Eğer profile otomatik oluşmuyorsa, Supabase SQL Editor'de:

```sql
-- 1. Kullanıcı ID'sini bulun
SELECT id, email FROM auth.users 
WHERE email = 'KULLANICI@EMAIL.COM';

-- 2. Profile oluşturun (ID'yi yukarıdan kopyalayın)
INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
VALUES (
    'USER_ID_BURAYA_YAPISTIRIN',
    'KULLANICI@EMAIL.COM',
    'Kullanıcı Adı',
    10,
    'free'
);

-- 3. Kontrol edin
SELECT * FROM profiles WHERE email = 'KULLANICI@EMAIL.COM';
```

Sonra sayfayı yenileyin: `Ctrl + Shift + R`

## 📞 Destek

Hala sorun yaşıyorsanız, lütfen şunları paylaşın:
1. Browser console çıktısı (tamamı)
2. Network tab'deki Supabase istekleri (auth ve profiles)
3. Supabase Dashboard > Logs çıktısı
4. Hangi adımda takıldınız?

---

**Not:** İlk Google girişinde sayfa otomatik yenilenecektir. Bu normaldir ve profile oluşturma sürecinin bir parçasıdır.

