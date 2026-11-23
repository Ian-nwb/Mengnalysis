import * as SQLite from 'expo-sqlite';
import { DATASETS, DatasetId } from './datasets';

// One sandbox database, re-seeded on first use each launch so earlier
// experiments can never leave the data in a weird state.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('sandbox.db');
      for (const d of Object.values(DATASETS)) await db.execAsync(d.sql);
      return db;
    })();
  }
  return dbPromise;
}

export type Row = Record<string, string | number | null>;
export type RunResult = { ok: true; rows: Row[] } | { ok: false; error: string };

export async function runQuery(query: string, _dataset?: DatasetId): Promise<RunResult> {
  const q = query.trim().replace(/;+\s*$/, '');
  if (!q) return { ok: false, error: 'Type a query first.' };
  if (!/^(select|with)\b/i.test(q)) return { ok: false, error: 'Queries here start with SELECT.' };
  if (q.includes(';')) return { ok: false, error: 'One query at a time, please.' };
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<Row>(q);
    return { ok: true, rows };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e instanceof Error ? e.message : String(e)) };
  }
}

function friendlyError(msg: string) {
  const m = msg.replace(/^.*?Error code[^:]*:\s*/i, '').replace(/^Calling the '.*?' function has failed\s*→?\s*Caused by:\s*/i, '');
  if (/no such table/i.test(m)) return `That table doesn't exist. ${m}`;
  if (/no such column/i.test(m)) return `That column doesn't exist. Check the spelling. (${m})`;
  if (/syntax error/i.test(m)) return `SQL couldn't read that. Check commas, quotes and spelling. (${m})`;
  return m;
}

const rowKey = (r: Row) =>
  Object.values(r)
    .map((v) => (typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v)))
    .sort()
    .join('|');

/** Compares results, not query text. Column order and names don't matter. */
export function sameResult(got: Row[], expected: Row[], ordered: boolean) {
  if (got.length !== expected.length) return false;
  const a = got.map(rowKey);
  const b = expected.map(rowKey);
  if (!ordered) {
    a.sort();
    b.sort();
  }
  return a.every((x, i) => x === b[i]);
}
