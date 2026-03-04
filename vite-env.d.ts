/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
