import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

type App = Hono<{ Bindings: HttpBindings }>;

function findDistPath(): string | null {
  const candidates = [
    path.resolve(__dirname, "../../dist/public"),
    path.resolve(__dirname, "../dist/public"),
    path.resolve(__dirname, "dist/public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve("/app/dist/public"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      console.log(`[Static] Found frontend at: ${candidate}`);
      return candidate;
    }
  }

  console.error("[Static] Could not find dist/public with index.html");
  return null;
}

export function serveStaticFiles(app: App) {
  const distPath = findDistPath();

  if (!distPath) {
    app.use("*", (c) => c.json({ error: "Frontend not built" }, 500));
    return;
  }

  // Serve static files - skip API routes
  app.use("*", async (c, next) => {
    const path = c.req.path;
    // Don't serve static files for API routes
    if (path.startsWith("/api/") || path.startsWith("/health")) {
      return await next();
    }
    // For all other routes, try to serve a static file
    const staticHandler = serveStatic({ root: distPath });
    return await staticHandler(c, next);
  });

  // Fallback: serve index.html for SPA routes
  app.notFound((c) => {
    const reqPath = c.req.path;
    // Don't serve index.html for API routes
    if (reqPath.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
