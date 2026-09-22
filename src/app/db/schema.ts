import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const dailyLogs = sqliteTable("daily_logs", {
  id: integer().primaryKey({ autoIncrement: true }),
  date: text().notNull().unique(),        // e.g. "2026-09-13"
  milliSeconds: integer().notNull().default(0),
});

export const goal = sqliteTable("goal", {
  id: integer().primaryKey(),
  activityName: text().notNull(),
  dailyTargetSeconds: integer().notNull(),
});
