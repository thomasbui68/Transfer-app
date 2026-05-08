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

// Health check
app.get("/health", (c) => c.json({
  ok: true,
  ts: Date.now(),
  env: env.isProduction ? "production" : "development",
  dbConfigured: !!env.databaseUrl,
  aiConfigured: !!env.anthropicApiKey,
}));

// DEMO LOGIN - Simple bypass for OAuth issues
app.get("/api/demo-login", async (c) => {
  try {
    const { getDb } = await import("./queries/connection");
    const db = getDb();
    if (!db) {
      return c.json({ error: "Database not available" }, 500);
    }
    
    // Check if demo user exists
    const { users } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");
    
    let user = await db.select().from(users).where(eq(users.unionId, "demo-user")).limit(1).then(rows => rows[0]);
    
    if (!user) {
      // Create demo user
      await db.insert(users).values({
        unionId: "demo-user",
        name: "Demo User",
        email: "demo@transfer.app",
        role: "user",
      });
      user = await db.select().from(users).where(eq(users.unionId, "demo-user")).limit(1).then(rows => rows[0]);
    }
    
    // Sign a session token
    const { signSessionToken } = await import("./kimi/session");
    const { getSessionCookieOptions } = await import("./lib/cookies");
    const { Session } = await import("@contracts/constants");
    const { setCookie } = await import("hono/cookie");
    
    const token = await signSessionToken({
      unionId: "demo-user",
      clientId: env.appId,
    });
    
    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });
    
    return c.redirect("/", 302);
  } catch (err: any) {
    console.error("[Demo Login] Error:", err);
    return c.json({ error: "Demo login failed", detail: err?.message || String(err) }, 500);
  }
});

// OAuth authorize - redirects to Kimi login
app.get("/api/oauth/authorize", (c) => {
  const clientId = c.req.query("client_id") || env.appId;
  const redirectUri = c.req.query("redirect_uri") || `${c.req.header("origin") || "https://transfer-app-production.up.railway.app"}/api/oauth/callback`;
  const state = c.req.query("state") || btoa(redirectUri);

  const authUrl = new URL(env.kimiAuthUrl || "https://auth.kimi.com");
  authUrl.pathname = "/api/oauth/authorize";
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "profile");
  authUrl.searchParams.set("state", state);

  return c.redirect(authUrl.toString(), 302);
});

// OAuth callback
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// tRPC API
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Generic API 404 - must be AFTER specific API routes
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
    runMigrations();
  });
}
