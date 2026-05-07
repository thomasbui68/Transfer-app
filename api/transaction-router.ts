import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findAllTransactions, findTransactionById, createTransaction, updateTransaction, deleteTransaction, findPartiesByTransactionId, createParty, deleteParty, findMilestonesByTransactionId, createMilestone, updateMilestone, deleteMilestone, findExpensesByTransactionId, createExpense, updateExpense, deleteExpense } from "./queries/transactions";

export const transactionRouter = createRouter({
  list: publicQuery.query(async () => findAllTransactions()),

  byId: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => findTransactionById(input.id)),

  create: authedQuery.input(z.object({
    reference: z.string().min(1), title: z.string().min(1),
    type: z.enum(["purchase", "sale", "remortgage", "transfer"]),
    propertyId: z.number(), clientId: z.number(), conveyancerId: z.number().optional(),
    agreedPrice: z.string().or(z.number()), depositAmount: z.string().or(z.number()).optional(),
    mortgageAmount: z.string().or(z.number()).optional(), mortgageLender: z.string().optional(),
    surveyType: z.enum(["none", "condition_report", "homebuyer_report", "building_survey", "snagging"]).optional(),
    chainDetails: z.string().optional(), targetCompletionDate: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const data = { ...input, agreedPrice: String(input.agreedPrice) };
    if (input.depositAmount) (data as Record<string, unknown>).depositAmount = String(input.depositAmount);
    if (input.mortgageAmount) (data as Record<string, unknown>).mortgageAmount = String(input.mortgageAmount);
    if (input.targetCompletionDate) (data as Record<string, unknown>).targetCompletionDate = new Date(input.targetCompletionDate);
    return createTransaction(data);
  }),

  update: authedQuery.input(z.object({
    id: z.number(), data: z.object({
      title: z.string().optional(), type: z.enum(["purchase", "sale", "remortgage", "transfer"]).optional(),
      status: z.enum(["draft", "instruction", "searches", "enquiries", "contracts", "exchange", "completion", "archived"]).optional(),
      conveyancerId: z.number().optional(), agreedPrice: z.string().or(z.number()).optional(),
      depositAmount: z.string().or(z.number()).optional(), mortgageAmount: z.string().or(z.number()).optional(),
      mortgageLender: z.string().optional(), chainDetails: z.string().optional(),
      targetCompletionDate: z.string().optional(), actualCompletionDate: z.string().optional(), notes: z.string().optional(),
    }),
  })).mutation(async ({ input }) => {
    const { id, data } = input;
    const updateData: Record<string, unknown> = { ...data };
    if (data.agreedPrice !== undefined) updateData.agreedPrice = String(data.agreedPrice);
    if (data.depositAmount !== undefined) updateData.depositAmount = String(data.depositAmount);
    if (data.mortgageAmount !== undefined) updateData.mortgageAmount = String(data.mortgageAmount);
    if (data.targetCompletionDate) updateData.targetCompletionDate = new Date(data.targetCompletionDate);
    if (data.actualCompletionDate) updateData.actualCompletionDate = new Date(data.actualCompletionDate);
    await updateTransaction(id, updateData);
    return { success: true };
  }),

  delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteTransaction(input.id);
    return { success: true };
  }),

  parties: publicQuery.input(z.object({ transactionId: z.number() })).query(async ({ input }) =>
    findPartiesByTransactionId(input.transactionId)),

  addParty: authedQuery.input(z.object({
    transactionId: z.number(), name: z.string().min(1), email: z.string().email().optional(),
    phone: z.string().optional(), role: z.enum(["buyer", "seller", "conveyancer", "estate_agent", "mortgage_broker", "surveyor", "lender"]),
    organisation: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input }) => createParty(input)),

  removeParty: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteParty(input.id);
    return { success: true };
  }),

  milestones: publicQuery.input(z.object({ transactionId: z.number() })).query(async ({ input }) =>
    findMilestonesByTransactionId(input.transactionId)),

  addMilestone: authedQuery.input(z.object({
    transactionId: z.number(), title: z.string().min(1), description: z.string().optional(),
    category: z.enum(["instruction", "searches", "enquiries", "contracts", "exchange", "completion", "post_completion"]),
    dueDate: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input }) => createMilestone({ ...input, dueDate: input.dueDate ? new Date(input.dueDate) : undefined })),

  updateMilestone: authedQuery.input(z.object({
    id: z.number(), data: z.object({
      title: z.string().optional(), description: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed", "overdue"]).optional(),
      dueDate: z.string().optional(), notes: z.string().optional(),
    }),
  })).mutation(async ({ input }) => {
    const updateData: Record<string, unknown> = { ...input.data };
    if (input.data.dueDate) updateData.dueDate = new Date(input.data.dueDate);
    if (input.data.status === "completed") updateData.completedDate = new Date();
    await updateMilestone(input.id, updateData);
    return { success: true };
  }),

  removeMilestone: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteMilestone(input.id);
    return { success: true };
  }),

  expenses: publicQuery.input(z.object({ transactionId: z.number() })).query(async ({ input }) =>
    findExpensesByTransactionId(input.transactionId)),

  addExpense: authedQuery.input(z.object({
    transactionId: z.number(), description: z.string().min(1), amount: z.string().or(z.number()),
    category: z.enum(["stamp_duty", "legal_fees", "search_fees", "survey_fees", "land_registry", "vat", "disbursements", "other"]),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => createExpense({ ...input, amount: String(input.amount) })),

  updateExpense: authedQuery.input(z.object({
    id: z.number(), data: z.object({
      description: z.string().optional(), amount: z.string().or(z.number()).optional(),
      category: z.enum(["stamp_duty", "legal_fees", "search_fees", "survey_fees", "land_registry", "vat", "disbursements", "other"]).optional(),
      isPaid: z.boolean().optional(), paidDate: z.string().optional(), notes: z.string().optional(),
    }),
  })).mutation(async ({ input }) => {
    const updateData: Record<string, unknown> = { ...input.data };
    if (input.data.amount !== undefined) updateData.amount = String(input.data.amount);
    if (input.data.paidDate) updateData.paidDate = new Date(input.data.paidDate);
    if (input.data.isPaid) updateData.paidDate = new Date();
    await updateExpense(input.id, updateData);
    return { success: true };
  }),

  removeExpense: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteExpense(input.id);
    return { success: true };
  }),
});
