import { db } from "@/src/app/db";
import { dailyLogs } from "@/src/app/db/schema";
import { getWeekRange } from "@/src/app/lib/datetime";
import { addDays, format } from "date-fns";
import { eq } from "drizzle-orm";

/**
 * Get a single day's log by its date string ("YYYY-MM-DD")
 */
export async function getDailyLogByDate(date: string) {
  const [row] = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.date, date));

  return row ?? null;
}

export async function getEachDayTimeSpent() {
  // get start and end date
  const { startDate, endDate } = getWeekRange();

  // get days seq in week
  const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // get date seq in week
  const datesInWeek = daysInWeek.map((d, i) => {
    const dateObj = new Date(startDate); // parsed as UTC midnight
    const nextDay = addDays(dateObj, i);
    return format(nextDay, "yyyy-MM-dd");
  }
  );

  const timesSpent = await Promise.all(
    datesInWeek.map(async (d, i) => {
      const log = await getDailyLogByDate(d);
      return {[daysInWeek[i]] : log?.milliSeconds ?? 0};
    })
  );

  return timesSpent;
}


