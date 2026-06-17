const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class DeviceInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.customer = row.customer_id;
    this.brand = row.brand;
    this.model = row.model;
    this.imei = row.imei;
    this.condition = row.condition;
    this.images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE devices
      SET customer_id = $1, brand = $2, model = $3, imei = $4, condition = $5, images = $6
      WHERE id = $7
      RETURNING *
    `;
    const vals = [
      this.customer?.id || this.customer?._id || this.customer,
      this.brand,
      this.model,
      this.imei,
      this.condition || 'Good',
      JSON.stringify(this.images || []),
      this.id
    ];
    const res = await pool.query(sql, vals);
    if (res.rows[0]) {
      this.brand = res.rows[0].brand;
      this.model = res.rows[0].model;
      this.imei = res.rows[0].imei;
      this.condition = res.rows[0].condition;
    }
    return this;
  }
}

class Device {
  static async findOne(query) {
    let sql = 'SELECT * FROM devices';
    let vals = [];
    if (query.imei) {
      sql += ' WHERE imei = $1';
      vals.push(query.imei);
    } else if (query._id) {
      sql += ' WHERE id = $1';
      vals.push(query._id);
    }

    const res = await pool.query(sql, vals);
    if (res.rows.length === 0) return null;
    return new DeviceInstance(res.rows[0]);
  }

  static async find(query = {}) {
    let sql = 'SELECT * FROM devices';
    let vals = [];
    let conditions = [];
    if (query.customer || query.customerId) {
      conditions.push(`customer_id = $${vals.length + 1}`);
      vals.push(query.customer || query.customerId);
    }
    if (query.brand) {
      conditions.push(`brand = $${vals.length + 1}`);
      vals.push(query.brand);
    }
    if (query.model) {
      conditions.push(`model = $${vals.length + 1}`);
      vals.push(query.model);
    }
    if (query._id || query.id) {
      conditions.push(`id = $${vals.length + 1}`);
      vals.push(query._id || query.id);
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    const res = await pool.query(sql, vals);
    return res.rows.map(r => new DeviceInstance(r));
  }

  static async findById(id) {
    return this.findOne({ _id: id });
  }

  static async create(data) {
    const id = generateId();
    const sql = `
      INSERT INTO devices (id, customer_id, brand, model, imei, condition, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const vals = [
      id,
      data.customer?.id || data.customer?._id || data.customer,
      data.brand,
      data.model,
      data.imei,
      data.condition || 'Good',
      JSON.stringify(data.images || [])
    ];

    const res = await pool.query(sql, vals);
    return new DeviceInstance(res.rows[0]);
  }

  static async deleteMany() {
    await pool.query('DELETE FROM devices');
  }
}

module.exports = Device;
