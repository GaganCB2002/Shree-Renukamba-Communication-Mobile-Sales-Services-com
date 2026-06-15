const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class PageVisitInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.page = row.page;
    this.user = row.user_id;
    this.timestamp = row.timestamp;
  }
}

class PageVisit {
  static async create(data) {
    const id = generateId();
    const sql = `
      INSERT INTO page_visits (id, page, user_id, timestamp)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const vals = [
      id,
      data.page,
      data.user || null,
      data.timestamp || new Date()
    ];
    const res = await pool.query(sql, vals);
    return new PageVisitInstance(res.rows[0]);
  }

  static async find(query = {}) {
    const res = await pool.query('SELECT * FROM page_visits ORDER BY timestamp DESC');
    return res.rows.map(r => new PageVisitInstance(r));
  }

  static async deleteMany() {
    await pool.query('DELETE FROM page_visits');
  }
}

module.exports = PageVisit;
