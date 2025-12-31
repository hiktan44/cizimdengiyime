import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Helper to get backend URL
const getBackendUrl = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:3001';
    }
    // Production URL (Coolify or Vercel)
    return import.meta.env.VITE_BACKEND_URL || window.location.origin;
};

// Stripe instance loader
// We fetch the key from DB via Admin settings if possible, or use env var
let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
    if (stripePromise) return stripePromise;

    // 1. Try env var
    let publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    // Validate key format (must start with pk_ and not be the placeholder)
    const isValidKey = (key: string | undefined) =>
        key && key.startsWith('pk_') && key !== 'your_stripe_publishable_key_here';

    if (!isValidKey(publishableKey)) {
        console.log('Valid Stripe key not found in env, checking DB...');
        // 2. If not in env, try to get from Site Settings (via Supabase)
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'stripe_publishable_key')
            .single();

        if (data && isValidKey(data.value)) {
            publishableKey = data.value;
        } else {
            // If DB also has invalid/no key, set to null but don't crash yet
            console.warn('No valid Stripe Publishable Key found in DB either.');
        }
    }

    if (!publishableKey || !isValidKey(publishableKey)) {
        console.error('Stripe Publishable Key missing or invalid. Please check Admin Settings.');
        return null;
    }

    stripePromise = loadStripe(publishableKey);
    return stripePromise;
};

export interface CurrencyRate {
    currency: string;
    rate: number;
}

export const getCurrencyRate = async (): Promise<CurrencyRate> => {
    try {
        const response = await fetch(`${getBackendUrl()}/api/get-currency-rate`);
        if (!response.ok) throw new Error('Failed to fetch currency rate');
        return await response.json();
    } catch (error) {
        console.error('Error fetching currency rate:', error);
        // Fallback rate (avoid blocking UI, but warn)
        return { currency: 'EUR', rate: 35.0 };
    }
};

export interface PaymentIntentParams {
    amountTL: number;
    credits: number;
    userId: string;
    userEmail: string;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    amountEUR: string;
    rate: number;
}

export const createPaymentIntent = async (
    params: PaymentIntentParams
): Promise<PaymentIntentResponse> => {
    const response = await fetch(`${getBackendUrl()}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment initialization failed');
    }

    return await response.json();
};
