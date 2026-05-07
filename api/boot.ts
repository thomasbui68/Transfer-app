import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check - always works even if DB is down
app.get("/health", (c) => c.json({
  ok: true,
  ts: Date.now(),
  env: env.isProduction ? "production" : "development",
  dbConfigured: !!env.databaseUrl,
  aiConfigured: !!env.anthropicApiKey,
}));

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Auto-migrate database on startup
async function runMigrations() {
  try {
    const db = await import("./queries/connection").then(m => m.getDb());
    if (!db) {
      console.log("[DB] No database configured, skipping migration");
      return;
    }
    // Push schema to database
    const { spawn } = await import("child_process");
    const child = spawn("npx", ["drizzle-kit", "push", "--force"], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    child.on("exit", (code) => {
      console.log(`[DB] Migration exited with code ${code}`);
    });
  } catch (err) {
    console.error("[DB] Migration failed:", err);
  }
}

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Database URL configured: ${!!env.databaseUrl}`);
    console.log(`AI configured: ${!!env.anthropicApiKey}`);
    // Run migrations in background
    runMigrations();
  });
}
