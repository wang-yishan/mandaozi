import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// Local SQLite database (Drizzle + better-sqlite3).
const sqlite = new Database("data/m.db");

export const db = drizzle(sqlite);
