import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { transactions, transactionParties, milestones, expenses } from "@db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type InsertTransaction = InferInsertModel<typeof transactions>;
export type InsertParty = InferInsertModel<typeof transactionParties>;
export type InsertMilestone = InferInsertModel<typeof milestones>;
export type InsertExpense = InferInsertModel<typeof expenses>;

export async function findAllTransactions() {
  return getDb().select().from(transactions).orderBy(desc(transactions.createdAt));
}

export async function findTransactionById(id: number) {
  const rows = await getDb().select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return rows[0];
}

export async function createTransaction(data: InsertTransaction) {
  return getDb().insert(transactions).values(data);
}

export async function updateTransaction(id: number, data: Partial<InsertTransaction>) {
  await getDb().update(transactions).set(data).where(eq(transactions.id, id));
}

export async function deleteTransaction(id: number) {
  await getDb().delete(transactions).where(eq(transactions.id, id));
}

export async function findPartiesByTransactionId(transactionId: number) {
  return getDb().select().from(transactionParties).where(eq(transactionParties.transactionId, transactionId));
}

export async function createParty(data: InsertParty) {
  return getDb().insert(transactionParties).values(data);
}

export async function deleteParty(id: number) {
  await getDb().delete(transactionParties).where(eq(transactionParties.id, id));
}

export async function findMilestonesByTransactionId(transactionId: number) {
  return getDb().select().from(milestones).where(eq(milestones.transactionId, transactionId)).orderBy(milestones.createdAt);
}

export async function createMilestone(data: InsertMilestone) {
  return getDb().insert(milestones).values(data);
}

export async function updateMilestone(id: number, data: Partial<InsertMilestone>) {
  await getDb().update(milestones).set(data).where(eq(milestones.id, id));
}

export async function deleteMilestone(id: number) {
  await getDb().delete(milestones).where(eq(milestones.id, id));
}

export async function findExpensesByTransactionId(transactionId: number) {
  return getDb().select().from(expenses).where(eq(expenses.transactionId, transactionId));
}

export async function createExpense(data: InsertExpense) {
  return getDb().insert(expenses).values(data);
}

export async function updateExpense(id: number, data: Partial<InsertExpense>) {
  await getDb().update(expenses).set(data).where(eq(expenses.id, id));
}

export async function deleteExpense(id: number) {
  await getDb().delete(expenses).where(eq(expenses.id, id));
}
