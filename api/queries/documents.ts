import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { documents } from "@db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type InsertDocument = InferInsertModel<typeof documents>;

export async function findDocumentsByTransactionId(transactionId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.transactionId, transactionId)).orderBy(desc(documents.createdAt));
}

export async function findDocumentById(id: number) {
  const db = getDb();
  if (!db) return undefined;
  const rows = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return rows[0];
}

export async function createDocument(data: InsertDocument) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(documents).values(data);
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}
