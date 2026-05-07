import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any;
let connectionError: string | null = null;

export function getDb() {
  if (!instance) {
    if (!env.databaseUrl) {
      connectionError = "DATABASE_URL not configured";
      throw new Error(connectionError);
    }
    try {
      instance = drizzle(env.databaseUrl, {
        mode: "default",
        schema: fullSchema,
      });
    } catch (err) {
      connectionError = err instanceof Error ? err.message : "Unknown DB error";
      throw new Error(connectionError);
    }
  }
  return instance;
}

export function getDbStatus() {
  return { connected: !!instance, error: connectionError };
}
