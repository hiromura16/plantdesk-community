/** SQLiteを共通SQL境界へ接続し、batch全体を同じトランザクションで確定します。 */
import { DatabaseSync } from 'node:sqlite';
import { chmodSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { migrations } from '../scripts/lib/migrations.mjs';

export function openDatabase(filename) {
  mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
  const sqlite = new DatabaseSync(filename);
  chmodSync(filename, 0o600);
  sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  sqlite.exec('CREATE TABLE IF NOT EXISTS community_migrations(name TEXT PRIMARY KEY)');
  const migrated = new Set(
    sqlite
      .prepare('SELECT name FROM community_migrations')
      .all()
      .map((r) => r.name),
  );
  for (const migration of migrations) {
    if (migrated.has(migration.name)) {
      continue;
    }
    sqlite.exec('BEGIN IMMEDIATE');
    try {
      sqlite.exec(migration.sql);
      sqlite.prepare('INSERT INTO community_migrations(name) VALUES(?)').run(migration.name);
      sqlite.exec('COMMIT');
    } catch (error) {
      sqlite.exec('ROLLBACK');
      sqlite.close();
      throw error;
    }
  }
  const execute = ({ sql, params }) => {
    const statement = sqlite.prepare(sql);
    if (statement.columns().length) {
      return { results: statement.all(...params), meta: { changes: 0 } };
    }
    const result = statement.run(...params);
    return { results: [], meta: { changes: Number(result.changes) } };
  };
  const DB = {
    prepare(sql) {
      const statement = (params) => ({
        sql,
        params,
        bind: (...values) => statement(values),
        async all() {
          return execute({ sql, params });
        },
        async first() {
          return execute({ sql, params }).results[0] ?? null;
        },
        async run() {
          return execute({ sql, params });
        },
      });
      return statement([]);
    },
    async batch(queries) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const results = queries.map(execute);
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return { DB, close: () => sqlite.close() };
}
