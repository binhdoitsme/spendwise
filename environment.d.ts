declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT?: string;
      DATABASE_URL?: string;
      NEXT_PUBLIC_SSO_PROVIDER?: string; // Semicolon separated, e.g. google;twitter
      NEXT_PUBLIC_BASE_URL?: string;
    }
  }
}

export {};
