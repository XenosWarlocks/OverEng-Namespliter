import { db } from "./db";
import { splitHistory, type SplitHistory, type InsertSplitHistory } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  createSplitHistory(history: InsertSplitHistory): Promise<SplitHistory>;
  getSplitHistory(): Promise<SplitHistory[]>;
}

export class DatabaseStorage implements IStorage {
  async createSplitHistory(history: InsertSplitHistory): Promise<SplitHistory> {
    const [entry] = await db
      .insert(splitHistory)
      .values(history)
      .returning();
    return entry;
  }

  async getSplitHistory(): Promise<SplitHistory[]> {
    return await db
      .select()
      .from(splitHistory)
      .orderBy(desc(splitHistory.createdAt));
  }
}

export const storage = new DatabaseStorage();
