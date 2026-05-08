import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
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
      return candidate;
    }
  }
  return null;
}

export function serveStaticFiles(app: App) {
  const distPath = findDistPath();

  if (!distPath) {
    app.notFound((c) => c.json({ error: "Frontend not built" }, 500));
    return;
  }

  // Serve static assets (JS, CSS, images) from dist/public
  app.use("/assets/*", async (c, next) => {
    const filePath = path.join(distPath, c.req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes: Record<string, string> = {
        ".js": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
      };
      const content = fs.readFileSync(filePath);
      return c.body(content, 200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    }
    return await next();
  });

  // Serve favicon and other root-level static files
  app.use("/*.ico", async (c, next) => {
    const filePath = path.join(distPath, c.req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      return c.body(content, 200, { "Content-Type": "image/x-icon" });
    }
    return await next();
  });

  // SPA fallback: serve index.html for all non-API routes
  app.notFound((c) => {
    const reqPath = c.req.path;
    // Don't serve index.html for API routes
    if (reqPath.startsWith("/api/") || reqPath === "/health") {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.join(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
