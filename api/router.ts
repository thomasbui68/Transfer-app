import { authRouter } from "./auth-router";
import { propertyRouter } from "./property-router";
import { transactionRouter } from "./transaction-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  property: propertyRouter,
  transaction: transactionRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
