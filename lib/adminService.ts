import { supabase } from './supabase';

// ==========================================
// CONTENT MANAGEMENT FUNCTIONS
// ==========================================

export interface HeroVideo {
  id: string;
  video_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseImage {
  id: string;
  image_url: string;
  type: 'sketch' | 'product' | 'model' | 'video' | 'adgenius_main' | 'adgenius_collage' | 'logo_media';
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
  updated_at: string;
}

// Upload hero video to storage and save to DB
export const uploadHeroVideo = async (
  file: File,
  orderIndex: number = 0
): Promise<{ success: boolean; videoUrl?: string; error?: string }> => {
  try {
    // Unique filename without folder path
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `hero-${orderIndex}-${Date.now()}.${fileExt}`;

    console.log(`📤 Uploading hero video ${orderIndex}:`, uniqueFileName);

    // Check if a video with this order_index already exists in DB
    const { data: existingVideos } = await supabase
      .from('hero_videos')
      .select('id, video_url')
      .eq('order_index', orderIndex)
      .limit(1);

    // If exists, delete old record from DB (storage file will be orphaned but that's ok)
    if (existingVideos && existingVideos.length > 0) {
      console.log(`🗑️ Deleting old hero video record for index ${orderIndex}`);
      const oldVideo = existingVideos[0];

      // Try to delete old file from storage (extract filename from URL)
      try {
        const urlParts = oldVideo.video_url.split('/object/public/hero-videos/');
        if (urlParts.length > 1) {
          const oldFileName = urlParts[1];
          await supabase.storage.from('hero-videos').remove([oldFileName]);
          console.log(`🗑️ Old storage file deleted: ${oldFileName}`);
        }
      } catch (storageError) {
        console.warn('Could not delete old storage file (not critical):', storageError);
      }

      // Delete old database record
      await supabase.from('hero_videos').delete().eq('id', oldVideo.id);
    }

    // Upload new file to storage (without folder path, upsert false to avoid trigger issues)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hero-videos')
      .upload(uniqueFileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      throw uploadError;
    }

    console.log('✅ Storage upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hero-videos')
      .getPublicUrl(uniqueFileName);

    const videoUrl = urlData.publicUrl;
    console.log('📍 Public URL:', videoUrl);

    // Save to database
    const { error: dbError } = await supabase.from('hero_videos').insert({
      video_url: videoUrl,
      order_index: orderIndex,
      is_active: true,
    });

    if (dbError) {
      console.error('❌ Database insert error:', dbError);
      throw dbError;
    }

    console.log('✅ Database record created');
    return { success: true, videoUrl };
  } catch (error: any) {
    console.error('❌ Error uploading hero video:', error);
    return { success: false, error: error.message };
  }
};

// Upload showcase image to storage and save to DB
export const uploadShowcaseImage = async (
  file: File,
  type: 'sketch' | 'product' | 'model' | 'video' | 'adgenius_main' | 'adgenius_collage' | 'logo_media' | 'pixshop_retush' | 'pixshop_product_placement' | 'adgenius_model' | 'adgenius_campaign' | 'adgenius_video' | 'adgenius_product_placement',
  orderIndex: number = 0
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    // Unique filename without folder path
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${type}-${Date.now()}.${fileExt}`;

    console.log(`📤 Uploading showcase ${type}:`, uniqueFileName);

    // Check if an image with this type already exists in DB
    const { data: existingImages } = await supabase
      .from('showcase_images')
      .select('id, image_url')
      .eq('type', type)
      .limit(1);

    // If exists, delete old record from DB
    if (existingImages && existingImages.length > 0) {
      console.log(`🗑️ Deleting old showcase ${type} record`);
      const oldImage = existingImages[0];

      // Try to delete old file from storage (extract filename from URL)
      try {
        const urlParts = oldImage.image_url.split('/object/public/showcase-images/');
        if (urlParts.length > 1) {
          const oldFileName = urlParts[1];
          await supabase.storage.from('showcase-images').remove([oldFileName]);
          console.log(`🗑️ Old storage file deleted: ${oldFileName}`);
        }
      } catch (storageError) {
        console.warn('Could not delete old storage file (not critical):', storageError);
      }

      // Delete old database record
      await supabase.from('showcase_images').delete().eq('id', oldImage.id);
    }

    // Upload new file to storage (without folder path, upsert false)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('showcase-images')
      .upload(uniqueFileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      throw uploadError;
    }

    console.log('✅ Storage upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('showcase-images')
      .getPublicUrl(uniqueFileName);

    const imageUrl = urlData.publicUrl;
    console.log('📍 Public URL:', imageUrl);

    // Save to database
    const { error: dbError } = await supabase.from('showcase_images').insert({
      image_url: imageUrl,
      type,
      order_index: orderIndex,
      is_active: true,
    });

    if (dbError) {
      console.error('❌ Database insert error:', dbError);
      throw dbError;
    }

    console.log('✅ Database record created');
    return { success: true, imageUrl };
  } catch (error: any) {
    console.error('❌ Error uploading showcase image:', error);
    return { success: false, error: error.message };
  }
};

// Get all hero videos (public)
export const getPublicHeroVideos = async (): Promise<HeroVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('hero_videos')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching hero videos:', error);
    return [];
  }
};

// Get all showcase images (public)
export const getPublicShowcaseImages = async (): Promise<ShowcaseImage[]> => {
  try {
    const { data, error } = await supabase
      .from('showcase_images')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching showcase images:', error);
    return [];
  }
};

// Get hero videos for admin (including inactive)
export const getAdminHeroVideos = async (): Promise<HeroVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('hero_videos')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin hero videos:', error);
    return [];
  }
};

// Get showcase images for admin (including inactive)
export const getAdminShowcaseImages = async (): Promise<ShowcaseImage[]> => {
  try {
    const { data, error } = await supabase
      .from('showcase_images')
      .select('*')
      .order('type', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin showcase images:', error);
    return [];
  }
};

// Delete hero video
export const deleteHeroVideo = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('hero_videos').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting hero video:', error);
    return false;
  }
};

// Delete showcase image
export const deleteShowcaseImage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('showcase_images').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting showcase image:', error);
    return false;
  }
};

// ==========================================
// SITE SETTINGS FUNCTIONS
// ==========================================

export const getSiteSettings = async (): Promise<Record<string, any>> => {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');

    if (error) throw error;

    // Convert to key-value object
    const settings: Record<string, any> = {};
    data?.forEach((setting) => {
      const value = setting.value;
      // Parse based on type
      switch (setting.type) {
        case 'number':
          settings[setting.key] = parseFloat(value);
          break;
        case 'boolean':
          settings[setting.key] = value === 'true';
          break;
        case 'json':
          settings[setting.key] = JSON.parse(value);
          break;
        default:
          settings[setting.key] = value;
      }
    });

    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {};
  }
};

export const updateSiteSetting = async (
  key: string,
  value: any,
  type: 'string' | 'number' | 'boolean' | 'json'
): Promise<boolean> => {
  try {
    let stringValue: string;
    switch (type) {
      case 'number':
        stringValue = value.toString();
        break;
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = value;
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value: stringValue, type, updated_at: new Date().toISOString() });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating site setting:', error);
    return false;
  }
};

// ==========================================
// USER ACTIVITY FUNCTIONS (ADMIN)
// ==========================================

export interface UserActivity {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  credits: number;
  is_admin: boolean;
  total_generations: number;
  total_credits_used: number;
  created_at: string;
  last_activity: string | null;
  signup_platform?: 'mobile' | 'web' | null;
}

export const getAllUsersActivity = async (): Promise<UserActivity[]> => {
  try {
    // Call the optimized database function
    const { data, error } = await supabase.rpc('get_admin_active_users');

    if (error) {
      console.error('RPC Error:', error);
      // Fallback to old method if RPC fails (e.g. not created yet)
      throw error;
    }

    return (data || []).map((user: any) => ({
      ...user,
      // Ensure specific types
      total_generations: Number(user.total_generations),
      total_credits_used: Number(user.total_credits_used)
    }));
  } catch (error) {
    console.warn('Falling back to client-side aggregation due to:', error);

    // Fallback Code (Original Implementation)
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get generation stats for each user
      const userActivities: UserActivity[] = [];

      for (const profile of profiles || []) {
        const { data: generations, error: genError } = await supabase
          .from('generations')
          .select('credits_used, created_at')
          .eq('user_id', profile.id);

        if (genError) {
          console.error('Error fetching generations for user:', profile.id, genError);
          continue;
        }

        const totalCreditsUsed = generations?.reduce((sum, gen) => sum + gen.credits_used, 0) || 0;
        const lastActivity = generations && generations.length > 0
          ? generations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        userActivities.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone_number: profile.phone_number || null,
          credits: profile.credits,
          is_admin: profile.subscription_tier === 'admin',
          total_generations: generations?.length || 0,
          total_credits_used: totalCreditsUsed,
          created_at: profile.created_at,
          last_activity: lastActivity,
          signup_platform: profile.signup_platform || null,
        });
      }

      return userActivities;
    } catch (fallbackError) {
      console.error('Error fetching user activities:', fallbackError);
      return [];
    }
  }
};

// ==========================================
// TRANSACTIONS FUNCTIONS (ADMIN)
// ==========================================

export interface AdminTransaction {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  type: 'subscription' | 'credit_purchase';
  amount: number;
  credits: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  platform?: 'mobile' | 'web' | 'admin';
  stripe_payment_id: string | null;
  created_at: string;
}

export const getAllTransactions = async (): Promise<AdminTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the data
    const transactions: AdminTransaction[] = (data || []).map((tx: any) => ({
      id: tx.id,
      user_id: tx.user_id,
      user_email: tx.profiles?.email || 'Unknown',
      user_name: tx.profiles?.full_name,
      type: tx.type,
      amount: tx.amount,
      credits: tx.credits,
      status: tx.status,
      payment_method: tx.payment_method,
      platform: tx.platform || (tx.payment_method === 'revenuecat' ? 'mobile' : tx.payment_method === 'admin_grant' ? 'admin' : 'web'),
      stripe_payment_id: tx.stripe_payment_id,
      created_at: tx.created_at,
    }));

    return transactions;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return [];
  }
};

// Get user's generation details (for admin view)
export const getUserGenerations = async (userId: string) => {
  try {
    // 1. Try RPC (Secure & Correct Way - Bypasses RLS)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_generations_admin', {
      target_user_id: userId
    });

    if (!rpcError) {
      return rpcData || [];
    }

    // 2. Fallback to direct select (Old Way - Subject to RLS)
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        throw new Error('İşlem kayıtlarına erişim sağlanamadı. Lütfen "FIX_ADMIN_ACCESS_VIA_RPC.sql" dosyasını Supabase SQL Editor\'de çalıştırın.');
      }
      throw error;
    }
    return data || [];
  } catch (error: any) {
    console.error('Error fetching user generations:', error);
    if (error.message?.includes('FIX_ADMIN_ACCESS_VIA_RPC')) {
      throw error;
    }
    throw new Error('İşlem kayıtlarına erişim sağlanamadı. RLS policy güncellemesi gerekebilir.');
  }
};

// ==========================================
// ADMIN CREDIT MANAGEMENT FUNCTIONS
// ==========================================

export interface AddCreditsResult {
  success: boolean;
  newCredits?: number;
  error?: string;
}

// Add credits to a user (admin function)
export const addCreditsToUser = async (
  userId: string,
  amount: number,
  reason: string = 'Admin tarafından eklendi'
): Promise<AddCreditsResult> => {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Kredi miktarı 0\'dan büyük olmalıdır.' };
    }

    // Get current credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const currentCredits = profile?.credits || 0;
    const newCredits = currentCredits + amount;

    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log the transaction as admin credit grant
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'credit_purchase',
        amount: 0, // Free admin grant
        credits: amount,
        status: 'completed',
        payment_method: 'admin_grant',
        platform: 'admin',
        metadata: { reason, granted_by: 'admin' }
      });

    if (txError) {
      console.warn('Transaction log error (non-critical):', txError);
    }

    console.log(`✅ ${amount} kredi kullanıcıya eklendi: ${userId}`);
    return { success: true, newCredits };
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return { success: false, error: error.message };
  }
};

// Get all generations for admin (bypasses RLS for admin view)
export const getAllGenerationsForAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('generations')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all generations:', error);
    return [];
  }
};

// ==========================================
// CREDIT REPORTS FUNCTIONS (ADMIN DASHBOARD)
// ==========================================

export interface CreditReportGeneration {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  type: string;
  credits_used: number;
  created_at: string;
}

export interface TypeDistribution {
  type: string;
  total_credits: number;
  count: number;
}

export interface DailyTrend {
  date: string;
  total_credits: number;
  count: number;
}

export interface TopCreditUser {
  user_id: string;
  email: string;
  full_name: string | null;
  total_credits_used: number;
  total_generations: number;
  most_used_type: string;
}

// Belirli tarih aralığında admin HARİÇ tüm generation'ları getir
export const getCreditUsageReport = async (
  startDate: string,
  endDate: string
): Promise<CreditReportGeneration[]> => {
  try {
    // Admin user ID'lerini al (is_admin boolean alanı ile)
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    const adminIds = (adminProfiles || []).map((p: any) => p.id);

    // Tüm generation'ları getir (tarih filtreli)
    let query = supabase
      .from('generations')
      .select(`
        id, user_id, type, credits_used, created_at,
        profiles:user_id ( email, full_name )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Admin kullanıcıları filtrele (client-side)
    const filtered = (data || [])
      .filter((g: any) => !adminIds.includes(g.user_id))
      .map((g: any) => ({
        id: g.id,
        user_id: g.user_id,
        user_email: g.profiles?.email || 'Bilinmiyor',
        user_name: g.profiles?.full_name || null,
        type: g.type,
        credits_used: g.credits_used || 0,
        created_at: g.created_at,
      }));

    return filtered;
  } catch (error) {
    console.error('Error fetching credit usage report:', error);
    return [];
  }
};

// Operasyon tipine göre kredi dağılımı (admin hariç)
export const getCreditDistributionByType = async (
  startDate: string,
  endDate: string
): Promise<TypeDistribution[]> => {
  try {
    const generations = await getCreditUsageReport(startDate, endDate);

    const typeMap = new Map<string, { total_credits: number; count: number }>();
    for (const gen of generations) {
      const existing = typeMap.get(gen.type) || { total_credits: 0, count: 0 };
      existing.total_credits += gen.credits_used;
      existing.count += 1;
      typeMap.set(gen.type, existing);
    }

    return Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.total_credits - a.total_credits);
  } catch (error) {
    console.error('Error fetching credit distribution:', error);
    return [];
  }
};

// Günlük kredi kullanım trendi (admin hariç)
export const getDailyCreditTrend = async (
  startDate: string,
  endDate: string
): Promise<DailyTrend[]> => {
  try {
    const generations = await getCreditUsageReport(startDate, endDate);

    const dailyMap = new Map<string, { total_credits: number; count: number }>();
    for (const gen of generations) {
      const date = gen.created_at.split('T')[0]; // YYYY-MM-DD
      const existing = dailyMap.get(date) || { total_credits: 0, count: 0 };
      existing.total_credits += gen.credits_used;
      existing.count += 1;
      dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching daily credit trend:', error);
    return [];
  }
};

// En çok kredi kullanan kullanıcılar (admin hariç)
export const getTopCreditUsers = async (
  startDate: string,
  endDate: string,
  limit: number = 20
): Promise<TopCreditUser[]> => {
  try {
    const generations = await getCreditUsageReport(startDate, endDate);

    const userMap = new Map<string, {
      email: string;
      full_name: string | null;
      total_credits_used: number;
      total_generations: number;
      typeCount: Map<string, number>;
    }>();

    for (const gen of generations) {
      const existing = userMap.get(gen.user_id) || {
        email: gen.user_email,
        full_name: gen.user_name,
        total_credits_used: 0,
        total_generations: 0,
        typeCount: new Map<string, number>(),
      };
      existing.total_credits_used += gen.credits_used;
      existing.total_generations += 1;
      existing.typeCount.set(gen.type, (existing.typeCount.get(gen.type) || 0) + 1);
      userMap.set(gen.user_id, existing);
    }

    return Array.from(userMap.entries())
      .map(([user_id, data]) => {
        // En çok kullanılan tip
        let mostUsedType = '-';
        let maxCount = 0;
        data.typeCount.forEach((count, type) => {
          if (count > maxCount) { maxCount = count; mostUsedType = type; }
        });
        return {
          user_id,
          email: data.email,
          full_name: data.full_name,
          total_credits_used: data.total_credits_used,
          total_generations: data.total_generations,
          most_used_type: mostUsedType,
        };
      })
      .sort((a, b) => b.total_credits_used - a.total_credits_used)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top credit users:', error);
    return [];
  }
};
