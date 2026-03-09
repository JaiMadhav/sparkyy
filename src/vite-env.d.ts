/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
