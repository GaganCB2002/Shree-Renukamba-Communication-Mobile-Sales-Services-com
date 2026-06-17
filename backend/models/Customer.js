const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class CustomerInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.userId = row.user_id;
    this.loyaltyPoints = row.loyalty_points || 0;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
    this.devices = typeof row.devices === 'string' ? JSON.parse(row.devices) : (row.devices || []);
    this.repairHistory = typeof row.repair_history === 'string' ? JSON.parse(row.repair_history) : (row.repair_history || []);
    this.orderHistory = typeof row.order_history === 'string' ? JSON.parse(row.order_history) : (row.order_history || []);
  }

  async save() {
    await pool.query(
      `UPDATE customers SET loyalty_points = $1, devices = $2, repair_history = $3, order_history = $4 WHERE id = $5`,
      [
        this.loyaltyPoints,
        JSON.stringify(this.devices || []),
        JSON.stringify(this.repairHistory || []),
        JSON.stringify(this.orderHistory || []),
        this.id
      ]
    );
    return this;
  }
}

async function populateCustomer(c, populates) {
  if (!c) return;
  // Handle nested populate formats like { path: 'userId', select: '...' }
  const hasUserId = populates.some(p => p === 'userId' || (p && p.path === 'userId'));
  const hasDevices = populates.some(p => p === 'devices' || (p && p.path === 'devices'));
  const hasRepairHistory = populates.some(p => p === 'repairHistory' || (p && p.path === 'repairHistory'));

  if (hasUserId) {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [c.userId]);
    if (userRes.rows[0]) {
      c.userId = {
        _id: userRes.rows[0].id,
        id: userRes.rows[0].id,
        fullName: userRes.rows[0].full_name,
        email: userRes.rows[0].email,
        phoneNumber: userRes.rows[0].phone_number,
        address: userRes.rows[0].address || {},
        role: userRes.rows[0].role,
        createdAt: userRes.rows[0].created_at
      };
    }
  }
  if (hasDevices) {
    const devRes = await pool.query('SELECT * FROM devices WHERE customer_id = $1', [c.id]);
    c.devices = devRes.rows.map(row => ({
      _id: row.id,
      id: row.id,
      brand: row.brand,
      model: row.model,
      imei: row.imei,
      condition: row.condition,
      images: row.images || []
    }));
  }
  if (hasRepairHistory) {
    const repRes = await pool.query('SELECT * FROM repair_orders WHERE customer_id = $1', [c.id]);
    c.repairHistory = repRes.rows.map(row => ({
      _id: row.id,
      id: row.id,
      repairId: row.repair_id,
      issueDescription: row.issue_description,
      estimatedCost: row.estimated_cost ? parseFloat(row.estimated_cost) : null,
      finalCost: row.final_cost ? parseFloat(row.final_cost) : null,
      repairStatus: row.repair_status,
      createdAt: row.created_at
    }));
  }
}

class Customer {
  static findOne(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM customers';
      let vals = [];
      let conditions = [];

      if (query.userId) {
        conditions.push(`user_id = $${vals.length + 1}`);
        vals.push(query.userId);
      }
      if (query._id || query.id) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(query._id || query.id);
      }
      if (query.phoneNumber) {
        sql = 'SELECT c.* FROM customers c JOIN users u ON c.user_id = u.id';
        conditions.push(`u.phone_number = $${vals.length + 1}`);
        vals.push(query.phoneNumber);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const res = await pool.query(sql, vals);
      if (res.rows.length === 0) return null;
      const c = new CustomerInstance(res.rows[0]);
      await populateCustomer(c, populates);
      return c;
    });
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static find(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM customers';
      let vals = [];
      let conditions = [];

      if (query.userId) {
        conditions.push(`user_id = $${vals.length + 1}`);
        vals.push(query.userId);
      }
      if (query._id || query.id) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(query._id || query.id);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const res = await pool.query(sql, vals);
      const list = res.rows.map(r => new CustomerInstance(r));
      for (const c of list) {
        await populateCustomer(c, populates);
      }
      return list;
    });
  }

  static async create(data) {
    const id = generateId();
    const sql = `INSERT INTO customers (id, user_id, loyalty_points, devices, repair_history, order_history) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const res = await pool.query(sql, [
      id,
      data.userId,
      data.loyaltyPoints || 0,
      JSON.stringify(data.devices || []),
      JSON.stringify(data.repairHistory || []),
      JSON.stringify(data.orderHistory || [])
    ]);
    return new CustomerInstance(res.rows[0]);
  }

  static async deleteMany() {
    await pool.query('DELETE FROM customers');
  }
}

module.exports = Customer;
