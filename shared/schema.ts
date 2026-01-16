import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const splitHistory = pgTable("split_history", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  processedData: jsonb("processed_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSplitHistorySchema = createInsertSchema(splitHistory).omit({ id: true, createdAt: true });

export type SplitHistory = typeof splitHistory.$inferSelect;
export type InsertSplitHistory = z.infer<typeof insertSplitHistorySchema>;

export type ProcessedName = {
  original: string;
  firstName: string;
  lastName: string;
};
