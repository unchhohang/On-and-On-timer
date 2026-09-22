import { db } from "@db/index"; // adjust path to wherever you export `db`
import { goal } from "@db/schema"; // adjust path to your schema file

export async function createGoal(activityName: string, dailyTargetSeconds: number) {
  return db
    .insert(goal)
    .values({
      id: 1,
      activityName,
      dailyTargetSeconds,
    })
    .onConflictDoUpdate({
      target: goal.id,
      set: {
        activityName,
        dailyTargetSeconds,
      },
    });
}
