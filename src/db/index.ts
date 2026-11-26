import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __mandaozi_sqlite?: Database.Database;
  __mandaozi_db?: DrizzleDb;
};

function createDb(): DrizzleDb {
  const sqlitePath = process.env.SQLITE_PATH ?? "data/m.db";
  const sqlite = new Database(sqlitePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  globalForDb.__mandaozi_sqlite = sqlite;
  return drizzle(sqlite, { schema });
}

export const db: DrizzleDb = globalForDb.__mandaozi_db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mandaozi_db = db;
}

export type Db = typeof db;


