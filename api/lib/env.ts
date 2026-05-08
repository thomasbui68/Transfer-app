import "dotenv/config";

function getEnv(name: string, fallback?: string): string {
  return process.env[name] || fallback || "";
}

export const env = {
  // Hardcoded fallbacks so the app works even without env vars
  appId: getEnv("APP_ID", "19e03172-e202-80b6-8000-00002d9eb328"),
  appSecret: getEnv("APP_SECRET", "0dyLgefivdtulBYDYMpvetmqwmS32Ikb"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", "https://auth.kimi.com"),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", "https://open.kimi.com"),
  ownerUnionId: getEnv("OWNER_UNION_ID"),
  anthropicApiKey: getEnv("ANTHROPIC_API_KEY"),
};
