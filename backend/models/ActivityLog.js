const { pool } = require('../config/db');

class ActivityLog {
  static async create(data) {
    const sql = `
      INSERT INTO activity_logs (user_id, user_name, user_email, user_role, action, resource_type, resource_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const vals = [
      data.userId || null,
      data.userName || 'Unknown',
      data.userEmail || '',
      data.userRole || 'guest',
      data.action,
      data.resourceType || 'general',
      data.resourceId || null,
      data.details ? JSON.stringify(data.details) : '{}',
      data.ipAddress || null,
    ];
    const res = await pool.query(sql, vals);
    return res.rows[0];
  }

  static async find(query = {}) {
    let sql = 'SELECT * FROM activity_logs';
    let conditions = [];
    let vals = [];
    if (query.userId) {
      conditions.push(`user_id = $${vals.length + 1}`);
      vals.push(query.userId);
    }
    if (query.action) {
      conditions.push(`action = $${vals.length + 1}`);
      vals.push(query.action);
    }
    if (query.resourceType) {
      conditions.push(`resource_type = $${vals.length + 1}`);
      vals.push(query.resourceType);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    if (query.limit) {
      sql += ` LIMIT ${parseInt(query.limit)}`;
    }
    const res = await pool.query(sql, vals);
    return res.rows;
  }

  static async deleteMany() {
    await pool.query('DELETE FROM activity_logs');
  }
}

module.exports = ActivityLog;
