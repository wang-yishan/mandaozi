import { defineConfig } from "drizzle-kit";

const isProd = process.env.PROJ_STATUS === "PROD";
const tursoUrl = process.env.MANDAOZI_TURSO_DATABASE_URL;
const tursoAuthToken = process.env.MANDAOZI_TURSO_AUTH_TOKEN;

export default defineConfig(
  isProd
    ? {
        dialect: "turso",
        schema: "./src/db/schema.ts",
        out: "./src/db/migrations",
        dbCredentials: {
          url: tursoUrl ?? "",
          authToken: tursoAuthToken,
        },
      }
    : {
        dialect: "sqlite",
        schema: "./src/db/schema.ts",
        out: "./src/db/migrations",
        dbCredentials: { url: process.env.SQLITE_PATH ?? "data/m.db" },
      },
);
