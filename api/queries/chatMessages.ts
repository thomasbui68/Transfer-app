import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { chatMessages } from "@db/schema";
import type { InferInsertModel } from "drizzle-orm";

export type InsertChatMessage = InferInsertModel<typeof chatMessages>;

export async function findChatMessagesByUserId(userId: number, limit = 50) {
  const messages = await getDb()
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  return messages.reverse();
}

export async function createChatMessage(data: InsertChatMessage) {
  return getDb().insert(chatMessages).values(data);
}

export async function deleteChatMessagesByUserId(userId: number) {
  await getDb().delete(chatMessages).where(eq(chatMessages.userId, userId));
}
