const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class SearchQueryInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.user = row.user_id;
    this.query = row.query;
    this.timestamp = row.timestamp;
  }
}

class SearchQuery {
  static async create(data) {
    const id = generateId();
    const sql = `
      INSERT INTO search_queries (id, user_id, query, timestamp)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const vals = [
      id,
      data.user || null,
      data.query,
      data.timestamp || new Date().toISOString()
    ];
    const res = await pool.query(sql, vals);
    return new SearchQueryInstance(res.rows[0]);
  }

  static async find(query = {}) {
    let sql = 'SELECT * FROM search_queries';
    let vals = [];
    let conditions = [];
    if (query.user) {
      conditions.push(`user_id = $${vals.length + 1}`);
      vals.push(query.user);
    }
    if (query.query) {
      conditions.push(`query ILIKE $${vals.length + 1}`);
      vals.push(`%${query.query}%`);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY timestamp DESC';
    const res = await pool.query(sql, vals);
    return res.rows.map(r => new SearchQueryInstance(r));
  }

  static async findOne(query = {}) {
    let sql = 'SELECT * FROM search_queries';
    let vals = [];
    let conditions = [];
    if (query._id || query.id) {
      conditions.push(`id = $${vals.length + 1}`);
      vals.push(query._id || query.id);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    const res = await pool.query(sql, vals);
    if (res.rows.length === 0) return null;
    return new SearchQueryInstance(res.rows[0]);
  }

  static async findById(id) {
    const res = await pool.query('SELECT * FROM search_queries WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return new SearchQueryInstance(res.rows[0]);
  }

  static async deleteMany() {
    await pool.query('DELETE FROM search_queries');
  }
}

module.exports = SearchQuery;
