import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');

// Mock fetch globally with proper response
global.fetch = vi.fn((url) => {
  if (typeof url === 'string' && url.startsWith('data:')) {
    // Mock fetch for data URLs (base64)
    return Promise.resolve({
      ok: true,
      blob: async () => new Blob(['mock-data'], { type: 'image/png' }),
    } as Response);
  }
  return Promise.resolve({
    ok: true,
    blob: async () => new Blob(['mock-data']),
    json: async () => ({}),
  } as Response);
});

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  writable: true,
  value: vi.fn(),
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();
