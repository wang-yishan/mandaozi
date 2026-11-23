import Database from "better-sqlite3";

// Persistence backend for the Mandaozi demo app (fetch("actions") contract:
// {action, args} -> {data} | {error}).
const db = new Database("data/m.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS madara_records (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    value TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

interface RecordRow {
  id: string;
  value: string;
}

export async function POST(request: Request) {
  let body: { action?: string; args?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { action, args = {} } = body;
  const collection = typeof args.collection === "string" ? args.collection : "";

  try {
    if (action === "records.list") {
      const rows = db
        .prepare(
          "SELECT id, value FROM madara_records WHERE collection = ? ORDER BY created_at ASC",
        )
        .all(collection) as RecordRow[];
      return Response.json({
        data: {
          records: rows.map((row) => ({
            id: row.id,
            value: JSON.parse(row.value),
          })),
        },
      });
    }

    if (action === "records.create") {
      const now = Date.now();
      const id = crypto.randomUUID();
      const key =
        typeof args.idempotency_key === "string" ? args.idempotency_key : null;
      db.prepare(
        `INSERT INTO madara_records (id, collection, value, idempotency_key, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(idempotency_key) DO NOTHING`,
      ).run(id, collection, JSON.stringify(args.value ?? null), key, now, now);
      const finalId = key
        ? ((
            db
              .prepare(
                "SELECT id FROM madara_records WHERE idempotency_key = ?",
              )
              .get(key) as { id: string } | undefined
          )?.id ?? id)
        : id;
      return Response.json({ data: { id: finalId } });
    }

    if (action === "records.replace") {
      const id = typeof args.id === "string" ? args.id : "";
      const result = db
        .prepare(
          "UPDATE madara_records SET value = ?, updated_at = ? WHERE id = ?",
        )
        .run(JSON.stringify(args.value ?? null), Date.now(), id);
      if (result.changes === 0) {
        return Response.json({ error: "Record not found" }, { status: 404 });
      }
      return Response.json({ data: { id } });
    }

    return Response.json(
      { error: `Unknown action: ${action}` },
      {
        status: 400,
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
