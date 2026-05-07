import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  json,
  int,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export const properties = mysqlTable("properties", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 500 }).notNull(),
  postcode: varchar("postcode", { length: 20 }).notNull(),
  propertyType: mysqlEnum("propertyType", ["freehold", "leasehold", "share_of_freehold", "commonhold"]).notNull(),
  tenure: varchar("tenure", { length: 100 }),
  leaseLength: int("leaseLength"),
  councilTaxBand: varchar("councilTaxBand", { length: 10 }),
  epcRating: varchar("epcRating", { length: 10 }),
  price: decimal("price", { precision: 14, scale: 2 }).notNull(),
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  squareFootage: int("squareFootage"),
  yearBuilt: int("yearBuilt"),
  description: text("description"),
  notes: text("notes"),
  status: mysqlEnum("status", ["available", "under_offer", "sold", "withdrawn"]).default("available").notNull(),
  createdById: bigint("createdById", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["purchase", "sale", "remortgage", "transfer"]).notNull(),
  status: mysqlEnum("status", ["draft", "instruction", "searches", "enquiries", "contracts", "exchange", "completion", "archived"]).default("draft").notNull(),
  propertyId: bigint("propertyId", { mode: "number", unsigned: true }).notNull(),
  clientId: bigint("clientId", { mode: "number", unsigned: true }).notNull(),
  conveyancerId: bigint("conveyancerId", { mode: "number", unsigned: true }),
  agreedPrice: decimal("agreedPrice", { precision: 14, scale: 2 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 14, scale: 2 }),
  mortgageAmount: decimal("mortgageAmount", { precision: 14, scale: 2 }),
  mortgageLender: varchar("mortgageLender", { length: 255 }),
  surveyType: mysqlEnum("surveyType", ["none", "condition_report", "homebuyer_report", "building_survey", "snagging"]).default("none"),
  chainDetails: text("chainDetails"),
  targetCompletionDate: timestamp("targetCompletionDate"),
  actualCompletionDate: timestamp("actualCompletionDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const transactionParties = mysqlTable("transaction_parties", {
  id: serial("id").primaryKey(),
  transactionId: bigint("transactionId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  role: mysqlEnum("role", ["buyer", "seller", "conveyancer", "estate_agent", "mortgage_broker", "surveyor", "lender"]).notNull(),
  organisation: varchar("organisation", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const milestones = mysqlTable("milestones", {
  id: serial("id").primaryKey(),
  transactionId: bigint("transactionId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["instruction", "searches", "enquiries", "contracts", "exchange", "completion", "post_completion"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  completedById: bigint("completedById", { mode: "number", unsigned: true }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const documents = mysqlTable("documents", {
  id: serial("id").primaryKey(),
  transactionId: bigint("transactionId", { mode: "number", unsigned: true }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  category: mysqlEnum("category", ["contract", "search", "enquiry", "id_proof", "address_proof", "mortgage", "survey", "correspondence", "other"]).notNull(),
  uploadedById: bigint("uploadedById", { mode: "number", unsigned: true }).notNull(),
  isSignatureRequired: boolean("isSignatureRequired").default(false),
  isSigned: boolean("isSigned").default(false),
  signedAt: timestamp("signedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const expenses = mysqlTable("expenses", {
  id: serial("id").primaryKey(),
  transactionId: bigint("transactionId", { mode: "number", unsigned: true }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: mysqlEnum("category", ["stamp_duty", "legal_fees", "search_fees", "survey_fees", "land_registry", "vat", "disbursements", "other"]).notNull(),
  isPaid: boolean("isPaid").default(false),
  paidDate: timestamp("paidDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  transactionId: bigint("transactionId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
