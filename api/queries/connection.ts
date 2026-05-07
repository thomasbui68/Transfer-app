import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any;
let connectionError: string | null = null;
let hasAttempted = false;

export function getDb() {
  if (hasAttempted && !instance) {
    return null;
  }
  if (!instance) {
    hasAttempted = true;
    if (!env.databaseUrl) {
      connectionError = "DATABASE_URL not configured";
      console.warn("[DB] " + connectionError);
      return null;
    }
    try {
      instance = drizzle(env.databaseUrl, {
        mode: "default",
        schema: fullSchema,
      });
    } catch (err) {
      connectionError = err instanceof Error ? err.message : "Unknown DB error";
      console.error("[DB] Connection failed:", connectionError);
      return null;
    }
  }
  return instance;
}

export function getDbStatus() {
  return { connected: !!instance, error: connectionError };
}
