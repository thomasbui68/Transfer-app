import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findDocumentsByTransactionId, findDocumentById, createDocument, updateDocument, deleteDocument } from "./queries/documents";

export const documentRouter = createRouter({
  list: publicQuery
    .input(z.object({ transactionId: z.number() }))
    .query(async ({ input }) => {
      return findDocumentsByTransactionId(input.transactionId);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findDocumentById(input.id);
    }),

  create: authedQuery
    .input(
      z.object({
        transactionId: z.number(),
        filename: z.string().min(1),
        originalName: z.string().min(1),
        mimeType: z.string().min(1),
        size: z.number(),
        category: z.enum([
          "contract", "search", "enquiry", "id_proof", "address_proof",
          "mortgage", "survey", "correspondence", "other",
        ]),
        isSignatureRequired: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createDocument({
        ...input,
        uploadedById: ctx.user.id,
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          category: z.enum([
            "contract", "search", "enquiry", "id_proof", "address_proof",
            "mortgage", "survey", "correspondence", "other",
          ]).optional(),
          isSignatureRequired: z.boolean().optional(),
          notes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return updateDocument(input.id, input.data);
    }),

  sign: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return updateDocument(input.id, {
        isSigned: true,
        signedAt: new Date(),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteDocument(input.id);
    }),
});
