import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let profileSubscription: any = null;

    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        console.log('⏳ Waiting for auth state change events...');

        // Don't call getSession here - let onAuthStateChange handle it
        // This avoids lock conflicts

        // Clean up OAuth hash from URL
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('🔗 Cleaning OAuth hash from URL...');
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Set a timeout to handle cases where no auth event fires
        setTimeout(() => {
          if (mounted && loading && !user) {
            console.log('⏰ No auth event received, stopping loading...');
            setLoading(false);
          }
        }, 3000);
      } catch (error) {
        console.error('Init auth error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth event:', event, session?.user?.email);

      if (!mounted) return;

      // Ignore SIGNED_IN during initialization (handled by initAuth)
      // Only handle INITIAL_SESSION after page reload
      if (event === 'SIGNED_IN' && !session) {
        console.log('⏭️ Skipping SIGNED_IN without session');
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      // Only fetch profile on specific events
      if (session?.user && (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        console.log('✅ Valid event for profile fetch:', event);
        // Wait for session to fully propagate before fetching
        await new Promise(resolve => setTimeout(resolve, 800));
        await fetchProfile(session.user.id);

        // Setup realtime subscription for profile updates
        if (!profileSubscription && mounted) {
          console.log('🔴 Setting up realtime subscription for profile updates');
          profileSubscription = supabase
            .channel('profile-changes')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${session.user.id}`,
              },
              (payload) => {
                console.log('🔄 Profile updated via realtime:', payload.new);
                if (mounted) {
                  setProfile(payload.new as Profile);
                }
              }
            )
            .subscribe();
        }
      } else if (!session) {
        setProfile(null);
        setLoading(false);
        // Unsubscribe from realtime if user logs out
        if (profileSubscription) {
          profileSubscription.unsubscribe();
          profileSubscription = null;
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (profileSubscription) {
        profileSubscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1500;

    try {
      console.log(`👤 Fetching profile for user: ${userId} (attempt ${retryCount + 1}/${maxRetries + 1})`);

      // Wait before retry to let session settle
      if (retryCount > 0) {
        console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      console.log('🔑 Fetching profile from database...');

      // Add timeout to prevent infinite hanging
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<{ data: null, error: any }>((resolve) =>
        setTimeout(() => {
          console.log('⏰ Profile fetch timeout after 5s');
          resolve({ data: null, error: { code: 'TIMEOUT', message: 'Request timeout' } });
        }, 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      console.log('📦 Profile fetch result:', {
        hasData: !!data,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details
      });

      // If profile doesn't exist, create it
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🆕 Profile not found (PGRST116), creating...');
          await createProfile(userId);
          return;
        }

        // If it's a timeout, retry
        if (error.code === 'TIMEOUT') {
          if (retryCount < maxRetries) {
            console.log(`⏰ Timeout occurred, retrying (${retryCount + 1}/${maxRetries})...`);
            return fetchProfile(userId, retryCount + 1);
          } else {
            console.error('❌ Profile fetch timeout after all retries, creating profile...');
            await createProfile(userId);
            return;
          }
        }

        // If it's a network error, retry
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying profile fetch after error (${retryCount + 1}/${maxRetries})...`);
          return fetchProfile(userId, retryCount + 1);
        }

        console.error('❌ Profile fetch error after retries:', error);
        await createProfile(userId);
        return;
      }

      if (!data) {
        console.log('❌ No profile data returned, creating...');
        await createProfile(userId);
        return;
      }

      console.log('✅ Profile loaded:', data.email, 'Credits:', data.credits);
      setProfile(data);
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Unexpected error fetching profile:', error.message, error);

      // Retry on unexpected errors
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying after unexpected error (${retryCount + 1}/${maxRetries})...`);
        return fetchProfile(userId, retryCount + 1);
      }

      console.log('🆕 Creating profile after all retries failed...');
      await createProfile(userId);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      console.log('🔨 Creating profile for user:', userId);

      // Get user data from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ User not found when creating profile:', userError);
        setLoading(false);
        return;
      }

      console.log('📝 User email:', user.email);
      console.log('📝 User metadata:', user.user_metadata);

      const newProfile = {
        id: userId,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        subscription_tier: 'free' as const,
        credits: 10,
      };

      console.log('📤 Inserting profile:', newProfile);

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // Check if profile already exists
        if (error.code === '23505') {
          console.log('⚠️ Profile already exists, fetching it...');
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (existingProfile) {
            console.log('✅ Found existing profile:', existingProfile);
            setProfile(existingProfile);
            setLoading(false);
            return;
          }
        }

        setLoading(false);
        alert('Profil oluşturulamadı. Lütfen sayfayı yenileyin veya tekrar giriş yapın.');
        return;
      }

      console.log('✅ Profile created successfully:', data);
      setProfile(data);
      setLoading(false);

    } catch (error) {
      console.error('❌ Unexpected error in createProfile:', error);
      setLoading(false);
      alert('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');

      // Production domain'i veya localhost'u otomatik algıla
      const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }

      console.log('Google OAuth initiated:', data);
    } catch (error) {
      console.error('Google sign in failed:', error);
      alert('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  };
}
