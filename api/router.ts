import { authRouter } from "./auth-router";
import { propertyRouter } from "./property-router";
import { transactionRouter } from "./transaction-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";
import { getDbStatus } from "./queries/connection";
import { env } from "./lib/env";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  status: publicQuery.query(() => ({
    ok: true,
    db: getDbStatus(),
    ai: !!env.anthropicApiKey,
    env: env.isProduction ? "production" : "development",
  })),
  auth: authRouter,
  property: propertyRouter,
  transaction: transactionRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
