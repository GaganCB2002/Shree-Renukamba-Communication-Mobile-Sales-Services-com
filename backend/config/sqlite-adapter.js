const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'database', 'app.db');

let db;

function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function convertSql(sql) {
  return sql
    .replace(/\$\d+/g, '?')
    .replace(/::jsonb/gi, '')
    .replace(/JSONB/gi, 'TEXT')
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bCURRENT_TIMESTAMP\b/gi, "datetime('now')")
    .replace(/\bSERIAL\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/\bILIKE\b/gi, 'LIKE');
}

class SqliteAdapter {
  constructor() {
    this.dbPath = DB_PATH;
  }

  async query(sql, params = []) {
    const conn = getDb();
    const convertedSql = convertSql(sql);
    const stmt = conn.prepare(convertedSql);
    const isSelect = convertedSql.trim().toUpperCase().startsWith('SELECT');
    const isInsert = convertedSql.trim().toUpperCase().startsWith('INSERT');
    const isUpdate = convertedSql.trim().toUpperCase().startsWith('UPDATE');
    const isDelete = convertedSql.trim().toUpperCase().startsWith('DELETE');
    const hasReturning = convertedSql.toUpperCase().includes('RETURNING');

    if (isSelect) {
      const rows = stmt.all(...params);
      return { rows };
    }

    if (isInsert && hasReturning) {
      const result = stmt.run(...params);
      const tableMatch = convertedSql.match(/INSERT\s+INTO\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const row = conn.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(result.lastInsertRowid);
        return { rows: row ? [row] : [] };
      }
      return { rows: [] };
    }

    if (isUpdate && hasReturning) {
      const whereMatch = convertedSql.match(/WHERE\s+(.+?)(?:ORDER\s+BY|LIMIT|$)/is);
      stmt.run(...params);
      const selectSql = `SELECT * FROM ${convertedSql.match(/UPDATE\s+(\w+)/i)[1]}`;
      const rows = conn.prepare(selectSql).all();
      return { rows };
    }

    const result = stmt.run(...params);
    return { rows: [], changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  }

  getNativeDb() {
    return getDb();
  }

  async connect() {
    getDb();
    return this;
  }

  async end() {
    if (db) {
      db.close();
      db = null;
    }
  }
}

module.exports = SqliteAdapter;
