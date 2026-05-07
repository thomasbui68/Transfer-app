import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { transactions, transactionParties, milestones, expenses } from "@db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type InsertTransaction = InferInsertModel<typeof transactions>;
export type InsertParty = InferInsertModel<typeof transactionParties>;
export type InsertMilestone = InferInsertModel<typeof milestones>;
export type InsertExpense = InferInsertModel<typeof expenses>;

export async function findAllTransactions() {
  const db = getDb();
  if (!db) return [];
  return db.select().from(transactions).orderBy(desc(transactions.createdAt));
}

export async function findTransactionById(id: number) {
  const db = getDb();
  if (!db) return undefined;
  const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return rows[0];
}

export async function createTransaction(data: InsertTransaction) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}

export async function updateTransaction(id: number, data: Partial<InsertTransaction>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(transactions).set(data).where(eq(transactions.id, id));
}

export async function deleteTransaction(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(transactions).where(eq(transactions.id, id));
}

export async function findPartiesByTransactionId(transactionId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(transactionParties).where(eq(transactionParties.transactionId, transactionId));
}

export async function createParty(data: InsertParty) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactionParties).values(data);
}

export async function deleteParty(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(transactionParties).where(eq(transactionParties.id, id));
}

export async function findMilestonesByTransactionId(transactionId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(milestones).where(eq(milestones.transactionId, transactionId)).orderBy(milestones.createdAt);
}

export async function createMilestone(data: InsertMilestone) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(milestones).values(data);
}

export async function updateMilestone(id: number, data: Partial<InsertMilestone>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(milestones).set(data).where(eq(milestones.id, id));
}

export async function deleteMilestone(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(milestones).where(eq(milestones.id, id));
}

export async function findExpensesByTransactionId(transactionId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(expenses).where(eq(expenses.transactionId, transactionId));
}

export async function createExpense(data: InsertExpense) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(expenses).values(data);
}

export async function updateExpense(id: number, data: Partial<InsertExpense>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expenses).set(data).where(eq(expenses.id, id));
}

export async function deleteExpense(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(eq(expenses.id, id));
}
