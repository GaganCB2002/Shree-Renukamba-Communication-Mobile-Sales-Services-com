const { pool } = require('../config/db');

class Settings {
  static async get(key) {
    const res = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    if (res.rows.length === 0) return null;
    return res.rows[0].value;
  }

  static async set(key, value) {
    await pool.query(
      "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = datetime('now')",
      [key, String(value)]
    );
    return value;
  }

  static async getAll() {
    const res = await pool.query('SELECT * FROM settings ORDER BY key');
    return res.rows;
  }

  static async getCancelHours(type) {
    const key = type === 'repair' ? 'cancel_repair_hours' : 'cancel_order_hours';
    const val = await this.get(key);
    return val ? parseInt(val, 10) : 24;
  }
}

module.exports = Settings;