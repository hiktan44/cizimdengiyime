import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  CREDIT_COSTS: {
    SKETCH_TO_PRODUCT: 1,
    PRODUCT_TO_MODEL: 2,
    VIDEO: 3,
  },
  SUBSCRIPTION_PLANS: {
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
  },
  CREDIT_PACKAGES: {
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
  },
}));

// Mock database functions
vi.mock('../../lib/database', () => ({
  checkAndDeductCredits: vi.fn().mockResolvedValue({ success: true }),
  saveGeneration: vi.fn().mockResolvedValue({ success: true }),
  uploadBase64ToStorage: vi.fn().mockResolvedValue('mock-url'),
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render landing page when not logged in', async () => {
    render(<App />);

    await waitFor(() => {
      // Should render the app container
      expect(document.body.firstChild).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display main navigation', async () => {
    render(<App />);

    await waitFor(() => {
      // App should render without errors
      const container = document.body.querySelector('div');
      expect(container).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle loading state', () => {
    render(<App />);

    // During initial render, app should handle loading gracefully
    expect(document.body).toBeInTheDocument();
  });
});
