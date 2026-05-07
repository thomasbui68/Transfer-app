import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findAllProperties, findPropertyById, createProperty, updateProperty, deleteProperty } from "./queries/properties";

export const propertyRouter = createRouter({
  list: publicQuery.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    return findAllProperties(input?.search);
  }),

  byId: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return findPropertyById(input.id);
  }),

  create: authedQuery.input(z.object({
    address: z.string().min(1), postcode: z.string().min(1),
    propertyType: z.enum(["freehold", "leasehold", "share_of_freehold", "commonhold"]),
    tenure: z.string().optional(), leaseLength: z.number().optional(),
    councilTaxBand: z.string().optional(), epcRating: z.string().optional(),
    price: z.string().or(z.number()), bedrooms: z.number().optional(),
    bathrooms: z.number().optional(), squareFootage: z.number().optional(),
    yearBuilt: z.number().optional(), description: z.string().optional(), notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => ({
    result: await createProperty({ ...input, price: String(input.price), createdById: ctx.user.id })
  })),

  update: authedQuery.input(z.object({
    id: z.number(), data: z.object({
      address: z.string().optional(), postcode: z.string().optional(),
      propertyType: z.enum(["freehold", "leasehold", "share_of_freehold", "commonhold"]).optional(),
      price: z.string().or(z.number()).optional(), status: z.enum(["available", "under_offer", "sold", "withdrawn"]).optional(),
      tenure: z.string().optional(), leaseLength: z.number().optional(),
      councilTaxBand: z.string().optional(), epcRating: z.string().optional(),
      bedrooms: z.number().optional(), bathrooms: z.number().optional(),
      description: z.string().optional(), notes: z.string().optional(),
    }),
  })).mutation(async ({ input }) => {
    const { id, data } = input;
    const updateData: Record<string, unknown> = { ...data };
    if (data.price !== undefined) updateData.price = String(data.price);
    await updateProperty(id, updateData);
    return { success: true };
  }),

  delete: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteProperty(input.id);
    return { success: true };
  }),
});
