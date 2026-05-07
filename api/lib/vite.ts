import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

type App = Hono<{ Bindings: HttpBindings }>;

function findDistPath(): string | null {
  // Try multiple possible locations for dist/public
  const candidates = [
    path.resolve(__dirname, "../../dist/public"),     // dev: api/lib -> root/dist/public
    path.resolve(__dirname, "../dist/public"),         // bundled at root
    path.resolve(__dirname, "dist/public"),            // same dir
    path.resolve(process.cwd(), "dist/public"),         // Railway working dir
    path.resolve("/app/dist/public"),                  // Docker common path
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      console.log(`Found frontend at: ${candidate}`);
      return candidate;
    }
  }
  
  console.error("Could not find dist/public with index.html");
  console.error("Tried:", candidates);
  return null;
}

export function serveStaticFiles(app: App) {
  const distPath = findDistPath();
  
  if (!distPath) {
    // No frontend built - return error for all routes
    app.use("*", (c) => c.json({ error: "Frontend not built" }, 500));
    return;
  }

  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}