import { db } from "@db/index"; // adjust path to wherever you export `db`
import { dailyLogs } from "@db/schema"; // adjust path to your schema file

export async function createDailyLogs(date: string, milliSec: number) {
  return db
    .insert(dailyLogs)
    .values({
      date: date,
      milliSeconds: milliSec
    })
    .onConflictDoUpdate({
      target: dailyLogs.date,
      set: {
        date: date,
        milliSeconds: milliSec
      },
    })
}
