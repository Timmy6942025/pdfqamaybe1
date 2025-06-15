import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  totalPages: integer("total_pages").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentChunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  chunkText: text("chunk_text").notNull(),
  pageNumber: integer("page_number").notNull(),
  startIndex: integer("start_index").notNull(),
  endIndex: integer("end_index").notNull(),
  embedding: jsonb("embedding").$type<number[]>(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  type: text("type", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  context: jsonb("context").$type<{
    relevantChunks?: Array<{
      chunkId: number;
      pageNumber: number;
      text: string;
      similarity: number;
    }>;
  }>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
