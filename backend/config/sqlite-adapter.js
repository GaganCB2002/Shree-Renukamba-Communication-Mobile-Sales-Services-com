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

  sanitizeParams(params) {
    return params.map(p => {
      if (p === undefined || p === null) return null;
      if (typeof p === 'boolean') return p ? 1 : 0;
      if (typeof p === 'string' || Buffer.isBuffer(p)) return p;
      if (typeof p === 'bigint') return p;
      if (typeof p === 'number') {
        if (Number.isFinite(p)) return p;
        console.warn('sanitizeParams: non-finite number converted to null:', p);
        return null;
      }
      if (p instanceof Date) return p.toISOString();
      if (Array.isArray(p) || typeof p === 'object') {
        const id = p?.id || p?._id;
        if (id) return id;
        console.warn('sanitizeParams: object/array converted to JSON string:', p);
        return JSON.stringify(p);
      }
      console.warn('sanitizeParams: unexpected type converted to string:', typeof p, p);
      return String(p);
    });
  }

  async query(sql, params = []) {
    const conn = getDb();
    const sanitized = this.sanitizeParams(params);
    const convertedSql = convertSql(sql);
    const stmt = conn.prepare(convertedSql);
    const isSelect = convertedSql.trim().toUpperCase().startsWith('SELECT');
    const isInsert = convertedSql.trim().toUpperCase().startsWith('INSERT');
    const isUpdate = convertedSql.trim().toUpperCase().startsWith('UPDATE');
    const isDelete = convertedSql.trim().toUpperCase().startsWith('DELETE');
    const hasReturning = convertedSql.toUpperCase().includes('RETURNING');

    if (isSelect) {
      const rows = stmt.all(...sanitized);
      return { rows };
    }

    if (isInsert && hasReturning) {
      const result = stmt.run(...sanitized);
      const tableMatch = convertedSql.match(/INSERT\s+INTO\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const row = conn.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(result.lastInsertRowid);
        return { rows: row ? [row] : [] };
      }
      return { rows: [] };
    }

    if (isUpdate && hasReturning) {
      const updateSql = convertedSql.replace(/\s+RETURNING\s+\*?\s*$/i, '');
      conn.prepare(updateSql).run(...sanitized);
      const tableMatch = convertedSql.match(/UPDATE\s+(\w+)/i);
      const whereMatch = convertedSql.match(/WHERE\s+(.+?)(?:\s+RETURNING|\s*$)/i);
      if (tableMatch && whereMatch) {
        const table = tableMatch[1];
        const whereClause = whereMatch[1];
        const preWhere = convertedSql.substring(0, convertedSql.indexOf('WHERE'));
        const preWhereCount = (preWhere.match(/\?/g) || []).length;
        const whereParams = sanitized.slice(preWhereCount);
        const rows = conn.prepare(`SELECT * FROM ${table} WHERE ${whereClause}`).all(...whereParams);
        return { rows };
      }
      return { rows: [] };
    }

    const result = stmt.run(...sanitized);
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
