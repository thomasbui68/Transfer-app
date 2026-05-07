import "dotenv/config";

function getEnv(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  appId: getEnv("APP_ID"),
  appSecret: getEnv("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL") || "https://auth.kimi.com",
  kimiOpenUrl: getEnv("KIMI_OPEN_URL") || "https://open.kimi.com",
  ownerUnionId: getEnv("OWNER_UNION_ID"),
  anthropicApiKey: getEnv("ANTHROPIC_API_KEY"),
};
