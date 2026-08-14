export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  RESEND_API_KEY: string;
  AI_API_KEY?: string;
  SESSION_SECRET: string;
  DO_NOTIFICATION_HUB: DurableObjectNamespace;
  R2_BUCKET: R2Bucket;
}

export const env: Env = {
  TURSO_DATABASE_URL: "",
  TURSO_AUTH_TOKEN: "",
  RESEND_API_KEY: "",
  AI_API_KEY: "",
  SESSION_SECRET: "",
  DO_NOTIFICATION_HUB: null as any,
  R2_BUCKET: null as any,
};

export function setEnv(newEnv: Partial<Env>) {
  Object.assign(env, newEnv);
}