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
    debug: true, // Geçici - debug için
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
  subscription_start: string | null;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  type: 'sketch_to_product' | 'product_to_model' | 'video';
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

// Credit costs
export const CREDIT_COSTS = {
  SKETCH_TO_PRODUCT: 1,
  PRODUCT_TO_MODEL: 1,
  VIDEO: 3,
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    credits: 100,
    price: 500,
    monthly: true,
  },
  PRO: {
    name: 'Pro',
    credits: 500,
    price: 2250,
    monthly: true,
  },
  PREMIUM: {
    name: 'Premium',
    credits: 1000,
    price: 4000,
    monthly: true,
  },
} as const;

// Credit packages
export const CREDIT_PACKAGES = {
  SMALL: {
    credits: 50,
    price: 250,
  },
  MEDIUM: {
    credits: 100,
    price: 500,
  },
  LARGE: {
    credits: 200,
    price: 1000,
  },
} as const;
