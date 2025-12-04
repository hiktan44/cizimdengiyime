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
  type: 'sketch' | 'product' | 'model' | 'video';
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
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-${orderIndex}-${Date.now()}.${fileExt}`;

    // Check if a video with this order_index already exists
    const { data: existingVideos } = await supabase
      .from('hero_videos')
      .select('id, video_url')
      .eq('order_index', orderIndex)
      .limit(1);

    // If exists, delete old file from storage and old record from DB
    if (existingVideos && existingVideos.length > 0) {
      const oldVideo = existingVideos[0];
      const oldFileName = oldVideo.video_url.split('/').pop();
      
      // Delete old file from storage
      if (oldFileName) {
        await supabase.storage.from('hero-videos').remove([oldFileName]);
      }

      // Delete old record from database
      await supabase.from('hero_videos').delete().eq('id', oldVideo.id);
    }

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('hero-videos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('hero-videos')
      .getPublicUrl(fileName);

    const videoUrl = data.publicUrl;

    // Save to database
    const { error: dbError } = await supabase.from('hero_videos').insert({
      video_url: videoUrl,
      order_index: orderIndex,
      is_active: true,
    });

    if (dbError) throw dbError;

    return { success: true, videoUrl };
  } catch (error: any) {
    console.error('Error uploading hero video:', error);
    return { success: false, error: error.message };
  }
};

// Upload showcase image to storage and save to DB
export const uploadShowcaseImage = async (
  file: File,
  type: 'sketch' | 'product' | 'model' | 'video',
  orderIndex: number = 0
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;

    // Check if an image with this type already exists
    const { data: existingImages } = await supabase
      .from('showcase_images')
      .select('id, image_url')
      .eq('type', type)
      .limit(1);

    // If exists, delete old file from storage and old record from DB
    if (existingImages && existingImages.length > 0) {
      const oldImage = existingImages[0];
      const oldFileName = oldImage.image_url.split('/').pop();
      
      // Delete old file from storage
      if (oldFileName) {
        await supabase.storage.from('showcase-images').remove([oldFileName]);
      }

      // Delete old record from database
      await supabase.from('showcase_images').delete().eq('id', oldImage.id);
    }

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('showcase-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('showcase-images')
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    // Save to database
    const { error: dbError } = await supabase.from('showcase_images').insert({
      image_url: imageUrl,
      type,
      order_index: orderIndex,
      is_active: true,
    });

    if (dbError) throw dbError;

    return { success: true, imageUrl };
  } catch (error: any) {
    console.error('Error uploading showcase image:', error);
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
  credits: number;
  is_admin: boolean;
  total_generations: number;
  total_credits_used: number;
  created_at: string;
  last_activity: string | null;
}

export const getAllUsersActivity = async (): Promise<UserActivity[]> => {
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
        credits: profile.credits,
        is_admin: profile.is_admin || false,
        total_generations: generations?.length || 0,
        total_credits_used: totalCreditsUsed,
        created_at: profile.created_at,
        last_activity: lastActivity,
      });
    }

    return userActivities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
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
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user generations:', error);
    return [];
  }
};

