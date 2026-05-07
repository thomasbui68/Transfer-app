import { eq, desc, like, and } from "drizzle-orm";
import { getDb } from "./connection";
import { properties } from "@db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type InsertProperty = InferInsertModel<typeof properties>;

export async function findAllProperties(search?: string) {
  const db = getDb();
  if (!db) return [];
  const conditions = [];
  if (search) conditions.push(like(properties.address, `%${search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(properties).where(where).orderBy(desc(properties.createdAt));
}

export async function findPropertyById(id: number) {
  const db = getDb();
  if (!db) return undefined;
  const rows = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return rows[0];
}

export async function createProperty(data: InsertProperty) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(properties).values(data);
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(properties).set(data).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(properties).where(eq(properties.id, id));
}
