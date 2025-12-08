import { useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const profileSubscriptionRef = useRef<any>(null);

  // Timeout ile Supabase sorgusu
  const queryWithTimeout = async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    timeoutMs: number = 8000
  ): Promise<{ data: T | null; error: any }> => {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        console.log(`⏰ Sorgu ${timeoutMs}ms içinde tamamlanamadı`);
        resolve({ data: null, error: { code: 'TIMEOUT', message: 'Sorgu zaman aşımına uğradı' } });
      }, timeoutMs);

      queryFn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          resolve({ data: null, error: err });
        });
    });
  };

  // Profile'ı getir veya oluştur
  const fetchOrCreateProfile = useCallback(async (userId: string, userEmail?: string, userMetadata?: any): Promise<Profile | null> => {
    if (!mountedRef.current) return null;
    
    console.log('👤 Profile getiriliyor:', userId);
    
    try {
      // Önce mevcut profile'ı kontrol et (timeout ile)
      console.log('🔍 Veritabanı sorgusu başlatılıyor...');
      const { data: existingProfile, error: fetchError } = await queryWithTimeout(() =>
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      );

      console.log('📦 Sorgu sonucu:', { hasData: !!existingProfile, error: fetchError?.code });

      if (fetchError) {
        if (fetchError.code === 'TIMEOUT') {
          console.error('❌ Veritabanı bağlantısı zaman aşımına uğradı');
          return null;
        }
        if (fetchError.code !== 'PGRST116') {
          console.error('❌ Profile fetch hatası:', fetchError);
          throw fetchError;
        }
      }

      if (existingProfile) {
        console.log('✅ Mevcut profile bulundu:', existingProfile.email);
        return existingProfile;
      }

      // Profile yoksa oluştur
      console.log('🆕 Profile oluşturuluyor...');
      const newProfile = {
        id: userId,
        email: userEmail || '',
        full_name: userMetadata?.full_name || userMetadata?.name || '',
        avatar_url: userMetadata?.avatar_url || userMetadata?.picture || null,
        subscription_tier: 'free' as const,
        credits: 10,
      };

      const { data: createdProfile, error: createError } = await queryWithTimeout(() =>
        supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()
      );

      if (createError) {
        // Profile zaten varsa tekrar dene
        if (createError.code === '23505') {
          console.log('⚠️ Profile zaten var, tekrar getiriliyor...');
          const { data: retryProfile } = await queryWithTimeout(() =>
            supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()
          );
          return retryProfile;
        }
        console.error('❌ Profile oluşturma hatası:', createError);
        return null;
      }

      console.log('✅ Yeni profile oluşturuldu');
      return createdProfile;
    } catch (error) {
      console.error('❌ Profile işlemi hatası:', error);
      return null;
    }
  }, []);

  // Ana başlatma fonksiyonu
  const initialize = useCallback(async () => {
    if (initializingRef.current) {
      console.log('⏭️ Zaten başlatılıyor, atlanıyor...');
      return;
    }
    
    initializingRef.current = true;
    console.log('🔐 Auth başlatılıyor...');
    
    try {
      // URL'den OAuth hash'i temizle
      if (window.location.hash?.includes('access_token')) {
        console.log('🔗 OAuth hash temizleniyor...');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Session'ı al
      console.log('📡 Session alınıyor...');
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('📡 Session sonucu:', { hasSession: !!currentSession, error: sessionError?.message });
      
      if (sessionError) {
        console.error('❌ Session hatası:', sessionError);
        setAuthError('Oturum bilgisi alınamadı');
        setLoading(false);
        initializingRef.current = false;
        return;
      }

      if (!currentSession) {
        console.log('ℹ️ Aktif oturum yok');
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
        initializingRef.current = false;
        return;
      }

      console.log('✅ Session bulundu:', currentSession.user.email);
      setUser(currentSession.user);
      setSession(currentSession);

      // Küçük bir bekleme - session'ın Supabase tarafında kaydedilmesi için
      console.log('⏳ Session stabilizasyonu için 500ms bekleniyor...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Profile'ı getir
      console.log('🚀 Profile sorgusu başlatılıyor...');
      const userProfile = await fetchOrCreateProfile(
        currentSession.user.id,
        currentSession.user.email,
        currentSession.user.user_metadata
      );
      console.log('🏁 Profile sorgusu tamamlandı:', !!userProfile);

      if (mountedRef.current) {
        if (userProfile) {
          setProfile(userProfile);
          setAuthError(null);
          console.log('✅ Auth tamamlandı:', userProfile.email, 'Kredi:', userProfile.credits);
        } else {
          setAuthError('Profil yüklenemedi. Lütfen tekrar deneyin.');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Auth başlatma hatası:', error);
      if (mountedRef.current) {
        setAuthError('Bağlantı hatası oluştu');
        setLoading(false);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [fetchOrCreateProfile]);

  // Component mount
  useEffect(() => {
    mountedRef.current = true;
    
    // İlk başlatma
    initialize();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔔 Auth event:', event, newSession?.user?.email);
      
      if (!mountedRef.current) return;

      // INITIAL_SESSION ve SIGNED_IN - initialize() zaten hallediyor, atla
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        console.log('⏭️ Event atlanıyor, initialize() hallediyor:', event);
        return;
      }

      // Çıkış yapıldı
      if (event === 'SIGNED_OUT' || !newSession) {
        console.log('👋 Çıkış yapıldı');
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
        setAuthError(null);
        
        // Realtime subscription'ı kaldır
        if (profileSubscriptionRef.current) {
          profileSubscriptionRef.current.unsubscribe();
          profileSubscriptionRef.current = null;
        }
        return;
      }

      // Token yenileme - sadece bu durumda profile güncelle
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token yenilendi');
        setUser(newSession.user);
        setSession(newSession);
        // Profile zaten var, sadece refresh et
        if (profile) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          if (data && mountedRef.current) {
            setProfile(data);
          }
        }
      }
    });

    return () => {
      console.log('🧹 Auth cleanup...');
      mountedRef.current = false;
      initializingRef.current = false; // Reset for Strict Mode remount
      subscription.unsubscribe();
      if (profileSubscriptionRef.current) {
        profileSubscriptionRef.current.unsubscribe();
        profileSubscriptionRef.current = null;
      }
    };
  }, [initialize, fetchOrCreateProfile]);

  // Manuel yeniden deneme
  const retryAuth = useCallback(async () => {
    console.log('🔄 Manuel retry başlatıldı...');
    setLoading(true);
    setAuthError(null);
    initializingRef.current = false; // Reset flag
    await initialize();
  }, [initialize]);

  // Google ile giriş
  const signInWithGoogle = async () => {
    try {
      console.log('🔵 Google ile giriş başlatılıyor...');
      const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Google giriş hatası:', error);
      alert('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  // Email ile giriş
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Email ile kayıt
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    return data;
  };

  // Çıkış
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('❌ Çıkış hatası:', error);
  };

  // Profile'ı yenile
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data && mountedRef.current) {
      setProfile(data);
    }
  }, [user]);

  return {
    user,
    session,
    profile,
    loading,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
    retryAuth,
  };
}
