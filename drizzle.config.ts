import type { Config } from "drizzle-kit";

export default {
  schema: "./src/app/db/schema.ts", // path to your schema file
  out: "./drizzle",         // where migration files get generated
  dialect: "sqlite",
  driver: "expo",
} satisfies Config;
