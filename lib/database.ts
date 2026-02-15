import { supabase, CREDIT_COSTS, Generation } from '../lib/supabase';

export const checkAndDeductCredits = async (
  userId: string,
  operationType: 'sketch_to_product' | 'product_to_model' | 'video' | 'video_fast' | 'video_high' | 'tech_sketch' | 'tech_pack' | 'pixshop' | 'fotomatik_transform' | 'fotomatik_describe' | 'adgenius_campaign_image' | 'adgenius_campaign_video' | 'adgenius_ecommerce_image' | 'adgenius_ecommerce_video' | 'collage'
): Promise<{ success: boolean; message?: string; remainingCredits?: number }> => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    const creditCostMap: Record<string, keyof typeof CREDIT_COSTS> = {
      'sketch_to_product': 'SKETCH_TO_PRODUCT',
      'product_to_model': 'PRODUCT_TO_MODEL',
      'video': 'VIDEO',
      'video_fast': 'VIDEO_FAST',
      'video_high': 'VIDEO_HIGH',
      'tech_sketch': 'TECH_SKETCH',
      'tech_pack': 'TECH_PACK',
      'pixshop': 'PIXSHOP',
      'fotomatik_transform': 'FOTOMATIK_TRANSFORM',
      'fotomatik_describe': 'FOTOMATIK_DESCRIBE',
      'adgenius_campaign_image': 'ADGENIUS_IMAGE',
      'adgenius_campaign_video': 'ADGENIUS_VIDEO',
      'adgenius_ecommerce_image': 'ADGENIUS_IMAGE',
      'adgenius_ecommerce_video': 'ADGENIUS_VIDEO',
      'collage': 'COLLAGE',
    };

    const creditsNeeded = CREDIT_COSTS[creditCostMap[operationType]];

    if (profile.credits < creditsNeeded) {
      return {
        success: false,
        message: `Yetersiz kredi. Bu işlem için ${creditsNeeded} kredi gerekli. Mevcut krediniz: ${profile.credits}. Lütfen kredi satın alın.`,
      };
    }

    // Deduct credits
    const newCredits = profile.credits - creditsNeeded;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) throw updateError;

    return {
      success: true,
      remainingCredits: newCredits,
    };
  } catch (error) {
    console.error('Error checking/deducting credits:', error);
    return {
      success: false,
      message: 'Kredi kontrolü sırasında bir hata oluştu.',
    };
  }
};

export const saveGeneration = async (
  userId: string,
  type: 'sketch_to_product' | 'product_to_model' | 'video' | 'video_fast' | 'video_high' | 'tech_sketch' | 'tech_pack' | 'pixshop' | 'fotomatik_transform' | 'fotomatik_describe' | 'adgenius_campaign_image' | 'adgenius_campaign_video' | 'adgenius_ecommerce_image' | 'adgenius_ecommerce_video' | 'collage',
  creditsUsed: number,
  inputImageUrl: string | null,
  outputImageUrl: string | null,
  outputVideoUrl: string | null,
  settings: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase.from('generations').insert({
      user_id: userId,
      type,
      credits_used: creditsUsed,
      input_image_url: inputImageUrl,
      output_image_url: outputImageUrl,
      output_video_url: outputVideoUrl,
      settings,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving generation:', error);
  }
};

export const uploadImageToStorage = async (
  file: File,
  userId: string,
  type: 'input' | 'output'
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('generations').getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const uploadBase64ToStorage = async (
  base64Data: string,
  userId: string,
  type: 'input' | 'output' | 'video'
): Promise<string | null> => {
  try {
    // Extract mime type and base64 data
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;

    const mimeType = matches[1];
    const base64 = matches[2];

    // Convert base64 to blob
    const blob = await fetch(base64Data).then((res) => res.blob());

    const fileExt = mimeType.split('/')[1];
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(fileName, blob, {
        contentType: mimeType,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('generations').getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading base64:', error);
    return null;
  }
};

// ==========================================
// PAYMENT & CREDITS FUNCTIONS
// ==========================================

export const addCreditsToUser = async (
  userId: string,
  credits: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
  try {
    // Get current credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const newBalance = profile.credits + credits;

    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newBalance, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, newBalance };
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return { success: false, error: error.message };
  }
};

export const createTransaction = async (
  userId: string,
  type: 'subscription' | 'credit_purchase',
  amount: number,
  credits: number,
  paymentId?: string,
  paymentMethod: string = 'paytr'
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        credits,
        status: 'pending',
        stripe_payment_id: paymentId,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, transactionId: data.id };
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: 'completed' | 'failed',
  paymentId?: string
): Promise<boolean> => {
  try {
    const updateData: any = { status };
    if (paymentId) {
      updateData.stripe_payment_id = paymentId;
    }

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
};

export const getUserTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
};

export const getUserGenerations = async (userId: string, page: number = 1, limit: number = 5): Promise<Generation[]> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .neq('type', 'video')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user generations:', error);
    return [];
  }
};

export const deleteGeneration = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting generation:', error);
    return false;
  }
};

export const deleteOldGenerations = async (): Promise<{ success: boolean; deletedCount?: number; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('delete_old_generations');

    if (error) throw error;

    return { success: true, deletedCount: data };
  } catch (error: any) {
    console.error('Error deleting old generations:', error);
    return { success: false, error: error.message };
  }
};