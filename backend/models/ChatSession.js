const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class ChatSessionInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.sessionId = row.session_id;
    this.userId = row.user_id;
    this.phoneNumber = row.phone_number;
    this.source = row.source;
    this.messages = typeof row.messages === 'string' ? JSON.parse(row.messages) : (row.messages || []);
    this.context = typeof row.context === 'string' ? JSON.parse(row.context) : (row.context || {});
    this.isResolved = row.is_resolved;
    this.metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE chat_sessions 
      SET messages = $1, context = $2, is_resolved = $3, metadata = $4, user_id = $5, phone_number = $6
      WHERE id = $7
      RETURNING *
    `;
    const vals = [
      JSON.stringify(this.messages),
      JSON.stringify(this.context),
      this.isResolved,
      JSON.stringify(this.metadata),
      this.userId || null,
      this.phoneNumber || null,
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

class ChatSession {
  static async create(data) {
    const id = generateId();
    const sql = `
      INSERT INTO chat_sessions (id, session_id, user_id, phone_number, source, messages, context, is_resolved, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const vals = [
      id,
      data.sessionId,
      data.userId || null,
      data.phoneNumber || null,
      data.source || 'web',
      JSON.stringify(data.messages || []),
      JSON.stringify(data.context || {}),
      data.isResolved !== undefined ? data.isResolved : false,
      JSON.stringify(data.metadata || {})
    ];

    const res = await pool.query(sql, vals);
    return new ChatSessionInstance(res.rows[0]);
  }

  static async findOne(query) {
    let sql = 'SELECT * FROM chat_sessions';
    let vals = [];
    if (query.sessionId) {
      sql += ' WHERE session_id = $1';
      vals.push(query.sessionId);
    } else if (query._id) {
      sql += ' WHERE id = $1';
      vals.push(query._id);
    }

    const res = await pool.query(sql, vals);
    if (res.rows.length === 0) return null;
    return new ChatSessionInstance(res.rows[0]);
  }

  static async find(query = {}) {
    const res = await pool.query('SELECT * FROM chat_sessions ORDER BY created_at DESC');
    return res.rows.map(r => new ChatSessionInstance(r));
  }

  static async deleteMany() {
    await pool.query('DELETE FROM chat_sessions');
  }
}

module.exports = ChatSession;
