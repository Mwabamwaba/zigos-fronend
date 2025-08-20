/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_DEBUG: string
  readonly VITE_FIREFLIES_API_KEY: string
  readonly VITE_USE_BACKEND_FOR_FIREFLIES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}