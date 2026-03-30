// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./apps/agent/src/db/schema.ts",
  out: "./apps/agent/src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;