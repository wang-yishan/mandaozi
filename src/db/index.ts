import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// TODO: tighten to LibSQLDatabase<typeof schema> and make repo calls async-safe.
export type Db = any;

const globalForDb = globalThis as unknown as {
  __mandaozi_libsql?: ReturnType<typeof createClient>;
  __mandaozi_db?: Db;
};

function createDb(): Db {
  const isProd = process.env.PROJ_STATUS === "PROD";
  const client = isProd
    ? createClient({
        url: process.env.MANDAOZI_TURSO_DATABASE_URL ?? "",
        authToken: process.env.MANDAOZI_TURSO_AUTH_TOKEN,
      })
    : createClient({
        url: `file:${process.env.SQLITE_PATH ?? "data/m.db"}`,
      });

  if (isProd && !process.env.MANDAOZI_TURSO_DATABASE_URL) {
    throw new Error(
      "MANDAOZI_TURSO_DATABASE_URL is required when PROJ_STATUS=PROD",
    );
  }

  globalForDb.__mandaozi_libsql = client;
  return drizzle(client, { schema }) as Db;
}

export const db: Db = globalForDb.__mandaozi_db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mandaozi_db = db;
}


