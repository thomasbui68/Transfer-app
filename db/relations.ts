import { relations } from "drizzle-orm";
import { transactions, properties, milestones, expenses, transactionParties, documents, chatMessages } from "./schema";

export const propertiesRelations = relations(properties, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  property: one(properties, { fields: [transactions.propertyId], references: [properties.id] }),
  parties: many(transactionParties),
  milestones: many(milestones),
  documents: many(documents),
  expenses: many(expenses),
}));

export const transactionPartiesRelations = relations(transactionParties, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionParties.transactionId], references: [transactions.id] }),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  transaction: one(transactions, { fields: [milestones.transactionId], references: [transactions.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  transaction: one(transactions, { fields: [documents.transactionId], references: [transactions.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  transaction: one(transactions, { fields: [expenses.transactionId], references: [transactions.id] }),
}));
