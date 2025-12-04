import { supabase, CREDIT_COSTS } from '../lib/supabase';

export const checkAndDeductCredits = async (
  userId: string,
  operationType: 'sketch_to_product' | 'product_to_model' | 'video'
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

    const creditsNeeded = CREDIT_COSTS[
      operationType === 'sketch_to_product'
        ? 'SKETCH_TO_PRODUCT'
        : operationType === 'product_to_model'
        ? 'PRODUCT_TO_MODEL'
        : 'VIDEO'
    ];

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
  type: 'sketch_to_product' | 'product_to_model' | 'video',
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
  type: 'output' | 'video'
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
