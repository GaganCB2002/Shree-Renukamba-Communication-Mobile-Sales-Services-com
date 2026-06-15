const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class NotificationInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.user = row.user_id;
    this.userId = row.user_id;
    this.title = row.title;
    this.message = row.message;
    this.type = row.type;
    this.isRead = row.is_read;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    await pool.query(
      'UPDATE notifications SET is_read = $1 WHERE id = $2',
      [this.isRead, this.id]
    );
    return this;
  }
}

class Notification {
  static create(data) {
    return new CustomQuery(async () => {
      const id = generateId();
      const sql = `
        INSERT INTO notifications (id, user_id, title, message, type, is_read)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const vals = [
        id,
        data.user || data.userId,
        data.title,
        data.message,
        data.type || 'general',
        data.isRead !== undefined ? data.isRead : false
      ];

      const res = await pool.query(sql, vals);
      return new NotificationInstance(res.rows[0]);
    });
  }

  static find(query = {}) {
    return new CustomQuery(async ({ sort, limit }) => {
      let sql = 'SELECT * FROM notifications';
      let vals = [];
      let conditions = [];

      if (query.user) {
        conditions.push(`user_id = $${vals.length + 1}`);
        vals.push(query.user);
      }
      if (query.userId) {
        conditions.push(`user_id = $${vals.length + 1}`);
        vals.push(query.userId);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      if (sort) {
        sql += ' ORDER BY created_at DESC';
      } else {
        sql += ' ORDER BY created_at DESC';
      }

      if (limit) {
        sql += ` LIMIT ${Number(limit)}`;
      }

      const res = await pool.query(sql, vals);
      return res.rows.map(r => new NotificationInstance(r));
    });
  }

  static findById(id) {
    return new CustomQuery(async () => {
      const res = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return new NotificationInstance(res.rows[0]);
    });
  }

  static async countDocuments(query = {}) {
    let sql = 'SELECT COUNT(*) FROM notifications';
    let vals = [];
    let conditions = [];

    if (query.user) {
      conditions.push(`user_id = $${vals.length + 1}`);
      vals.push(query.user);
    }
    if (query.userId) {
      conditions.push(`user_id = $${vals.length + 1}`);
      vals.push(query.userId);
    }
    if (query.isRead !== undefined) {
      conditions.push(`is_read = $${vals.length + 1}`);
      vals.push(query.isRead);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const res = await pool.query(sql, vals);
    return parseInt(res.rows[0].count, 10);
  }

  static async updateMany(query = {}, update = {}) {
    let sql = 'UPDATE notifications';
    let vals = [];
    let sets = [];
    let conditions = [];

    if (update.isRead !== undefined) {
      sets.push(`is_read = $${vals.length + 1}`);
      vals.push(update.isRead);
    }

    if (query.user) {
      conditions.push(`user_id = $${vals.length + 1}`);
      vals.push(query.user);
    }
    if (query.userId) {
      conditions.push(`user_id = $${vals.length + 1}`);
      vals.push(query.userId);
    }
    if (query.isRead !== undefined) {
      conditions.push(`is_read = $${vals.length + 1}`);
      vals.push(query.isRead);
    }

    sql += ' SET ' + sets.join(', ');
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    await pool.query(sql, vals);
    return true;
  }

  static async deleteMany() {
    await pool.query('DELETE FROM notifications');
  }
}

module.exports = Notification;
