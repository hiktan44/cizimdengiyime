import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
    debug: false, // Production için kapalı
  },
  global: {
    headers: {
      'X-Client-Info': 'cizimdengiyime-app',
    },
  },
});

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'starter' | 'pro' | 'premium';
  credits: number;
  is_admin: boolean;
  is_affiliate: boolean;
  subscription_start: string | null;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  type: 'sketch_to_product' | 'product_to_model' | 'video' | 'tech_sketch' | 'pixshop' | 'fotomatik_transform' | 'fotomatik_describe' | 'adgenius_campaign_image' | 'adgenius_campaign_video' | 'adgenius_ecommerce_image' | 'adgenius_ecommerce_video' | 'collage';
  credits_used: number;
  input_image_url: string | null;
  output_image_url: string | null;
  output_video_url: string | null;
  settings: Record<string, any>;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'subscription' | 'credit_purchase';
  amount: number;
  credits: number;
  status: 'pending' | 'completed' | 'failed';
  stripe_payment_id: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  user_name: string;
  user_company: string | null;
  user_avatar: string | null;
  rating: number;
  comment: string;
  is_featured: boolean;
  created_at: string;
}

// Re-export constants
export { CREDIT_COSTS, SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from './constants';
