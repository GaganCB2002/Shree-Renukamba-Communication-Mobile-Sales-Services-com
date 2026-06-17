const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Helper to generate 24-character hex ID
const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class UserInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.fullName = row.full_name;
    this.phoneNumber = row.phone_number;
    this.email = row.email;
    this.password = row.password;
    this.role = row.role;
    this.address = typeof row.address === 'string' ? JSON.parse(row.address) : (row.address || {});
    this.securityQuestions = typeof row.security_questions === 'string' ? JSON.parse(row.security_questions) : (row.security_questions || []);
    this.profileImage = row.profile_image || '';
    this.googleId = row.google_id || '';
    this.authProvider = row.auth_provider || 'email';
    this.otp = row.otp;
    this.otpExpires = row.otp_expires;
    this.passwordHistory = typeof row.password_history === 'string' ? JSON.parse(row.password_history) : (row.password_history || []);
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  // Chainable helper mock
  select() {
    return this;
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async matchSecurityAnswer(questionIndex, enteredAnswer) {
    if (!this.securityQuestions[questionIndex]) return false;
    return await bcrypt.compare(enteredAnswer, this.securityQuestions[questionIndex].answer);
  }

  async save() {
    // Hash password if modified
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    // Hash security questions if modified
    if (this.securityQuestions) {
      for (const sq of this.securityQuestions) {
        if (sq.answer && !sq.answer.startsWith('$2a$') && !sq.answer.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          sq.answer = await bcrypt.hash(sq.answer, salt);
        }
      }
    }

    const sql = `
      UPDATE users 
      SET full_name = $1, phone_number = $2, email = $3, password = $4, role = $5, 
          address = $6, security_questions = $7, profile_image = $8, google_id = $9,
          auth_provider = $10, otp = $11, otp_expires = $12, password_history = $13
      WHERE id = $14
      RETURNING *
    `;
    const vals = [
      this.fullName,
      this.phoneNumber,
      this.email,
      this.password,
      this.role,
      JSON.stringify(this.address),
      JSON.stringify(this.securityQuestions),
      this.profileImage,
      this.googleId,
      this.authProvider,
      this.otp,
      this.otpExpires instanceof Date ? this.otpExpires.toISOString() : this.otpExpires,
      JSON.stringify(this.passwordHistory),
      this.id
    ];
    const res = await pool.query(sql, vals);
    if (res.rows[0]) {
      return new UserInstance(res.rows[0]);
    }
    return this;
  }
}

class User {
  // Build a chainable query object that supports .select() and is awaitable
  static _buildQuery(sql, vals, singleResult = true) {
    const queryObj = {
      _fields: null,
      select(fieldStr) {
        if (!fieldStr) return this;
        const isExclude = fieldStr.startsWith('-');
        const isInclude = fieldStr.startsWith('+');
        if (isExclude) {
          this._fields = fieldStr.slice(1).split(' ').filter(Boolean);
        } else if (isInclude || !fieldStr.includes(',')) {
          // include or specific - keep all fields (SELECT *)
        } else {
          this._fields = fieldStr.split(' ').filter(Boolean);
        }
        return this;
      },
      async exec() {
        const res = await pool.query(sql, vals);
        if (singleResult) {
          if (res.rows.length === 0) return null;
          const inst = new UserInstance(res.rows[0]);
          if (this._fields) {
            for (const f of this._fields) { delete inst[f]; }
          }
          return inst;
        }
        const instances = res.rows.map(r => new UserInstance(r));
        if (this._fields) {
          for (const inst of instances) {
            for (const f of this._fields) { delete inst[f]; }
          }
        }
        return instances;
      },
    };
    queryObj.then = (resolve, reject) => queryObj.exec().then(resolve, reject);
    return queryObj;
  }

  static findOne(query) {
    let sql = 'SELECT * FROM users';
    let vals = [];
    let conditions = [];

    if (query._id || query.id) {
      conditions.push(`id = $${vals.length + 1}`);
      vals.push(query._id || query.id);
    }
    if (query.email) {
      conditions.push(`email = $${vals.length + 1}`);
      vals.push(query.email);
    }
    if (query.phoneNumber) {
      conditions.push(`phone_number = $${vals.length + 1}`);
      vals.push(query.phoneNumber);
    }
    if (query.googleId) {
      conditions.push(`google_id = $${vals.length + 1}`);
      vals.push(query.googleId);
    }
    if (query.$or) {
      const emailVal = query.$or.find(o => o.email)?.email;
      const phoneVal = query.$or.find(o => o.phoneNumber)?.phoneNumber;
      if (emailVal || phoneVal) {
        const parts = [];
        if (emailVal) { parts.push(`email = $${vals.length + 1}`); vals.push(emailVal); }
        if (phoneVal) { parts.push(`phone_number = $${vals.length + 1}`); vals.push(phoneVal); }
        conditions.push('(' + parts.join(' OR ') + ')');
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    return this._buildQuery(sql, vals, true);
  }

  static findById(id) {
    return this._buildQuery('SELECT * FROM users WHERE id = $1', [id], true);
  }

  static find(query = {}) {
    let sql = 'SELECT * FROM users';
    let vals = [];
    let conditions = [];

    if (query.role) {
      conditions.push(`role = $${vals.length + 1}`);
      vals.push(query.role);
    }
    if (query.phoneNumber) {
      conditions.push(`phone_number = $${vals.length + 1}`);
      vals.push(query.phoneNumber);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    return this._buildQuery(sql, vals, false);
  }

  static async create(data) {
    const id = generateId();
    // Hash password if not hashed
    let password = data.password;
    if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    // Hash security questions if not hashed
    const sqs = data.securityQuestions || [];
    for (const sq of sqs) {
      if (sq.answer && !sq.answer.startsWith('$2a$') && !sq.answer.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        sq.answer = await bcrypt.hash(sq.answer, salt);
      }
    }

    const sql = `
      INSERT INTO users (id, full_name, phone_number, email, password, role, address, security_questions, profile_image, google_id, auth_provider, otp, otp_expires, password_history)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const vals = [
      id,
      data.fullName,
      data.phoneNumber,
      data.email,
      password,
      data.role || 'customer',
      JSON.stringify(data.address || {}),
      JSON.stringify(sqs),
      data.profileImage || '',
      data.googleId || '',
      data.authProvider || 'email',
      data.otp,
      data.otpExpires instanceof Date ? data.otpExpires.toISOString() : data.otpExpires,
      JSON.stringify(data.passwordHistory || [password])
    ];

    const res = await pool.query(sql, vals);
    return new UserInstance(res.rows[0]);
  }

  static async deleteMany() {
    await pool.query('DELETE FROM users');
  }
}

module.exports = User;
