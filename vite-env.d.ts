/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_R2_ACCOUNT_ID?: string;
  readonly VITE_R2_ACCESS_KEY_ID?: string;
  readonly VITE_R2_SECRET_ACCESS_KEY?: string;
  readonly VITE_R2_BUCKET_NAME?: string;
  readonly VITE_R2_PUBLIC_URL?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
