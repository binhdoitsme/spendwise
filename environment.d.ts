declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string | undefined;
      NODE_ENV: "development" | "production";
      PORT?: string;
    }
  }
}

export {};
