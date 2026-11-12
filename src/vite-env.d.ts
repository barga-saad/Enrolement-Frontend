/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LOG_LEVEL?: string;
  /** Dev server only — see src/utils/devAuth.ts */
  readonly VITE_DEV_AUTH_BYPASS?: string;
  /** Automatic sign-out after this many ms without activity (default 60000 = 1 minute) */
  readonly VITE_IDLE_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
