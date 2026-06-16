const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class OrderInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.orderId = row.order_id;
    this.customer = row.customer_id;
    this.customerId = row.customer_id;
    this.products = typeof row.products === 'string' ? JSON.parse(row.products) : (row.products || []);
    this.totalAmount = parseFloat(row.total_amount);
    this.paymentInfo = typeof row.payment_info === 'string' ? JSON.parse(row.payment_info) : (row.payment_info || {});
    this.paymentStatus = row.payment_status;
    this.orderStatus = row.order_status;
    this.shippingAddress = typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : (row.shipping_address || {});
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }
}

async function populateOrder(o, populates) {
  if (!o) return;
  const hasCustomer = populates.some(p => p === 'customer' || (p && p.path === 'customer'));
  if (hasCustomer && o.customerId) {
    const custRes = await pool.query('SELECT * FROM customers WHERE id = $1', [o.customerId]);
    if (custRes.rows[0]) {
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [custRes.rows[0].user_id]);
      o.customer = {
        _id: custRes.rows[0].id,
        id: custRes.rows[0].id,
        userId: userRes.rows[0] ? {
          _id: userRes.rows[0].id,
          fullName: userRes.rows[0].full_name,
          email: userRes.rows[0].email,
          phoneNumber: userRes.rows[0].phone_number
        } : null
      };
    }
  }
}

class Order {
  static create(data) {
    return new CustomQuery(async () => {
      const id = generateId();
      const sql = `
        INSERT INTO orders (id, order_id, customer_id, products, total_amount, payment_info, payment_status, order_status, shipping_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const vals = [
        id,
        data.orderId,
        data.customer || data.customerId,
        JSON.stringify(data.products || []),
        data.totalAmount,
        JSON.stringify(data.paymentInfo || {}),
        data.paymentStatus || 'Pending',
        data.orderStatus || 'Processing',
        JSON.stringify(data.shippingAddress || {})
      ];

      const res = await pool.query(sql, vals);
      return new OrderInstance(res.rows[0]);
    });
  }

  static find(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM orders';
      let vals = [];
      let conditions = [];

      if (query.customer) {
        conditions.push(`customer_id = $${vals.length + 1}`);
        vals.push(query.customer);
      }
      if (query.customerId) {
        conditions.push(`customer_id = $${vals.length + 1}`);
        vals.push(query.customerId);
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
      const list = res.rows.map(r => new OrderInstance(r));
      for (const o of list) {
        await populateOrder(o, populates);
      }
      return list;
    });
  }

  static findById(id) {
    return new CustomQuery(async ({ populates }) => {
      const res = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const o = new OrderInstance(res.rows[0]);
      await populateOrder(o, populates);
      return o;
    });
  }

  static findOne(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM orders';
      let vals = [];
      let conditions = [];

      if (query.orderId) {
        conditions.push(`order_id = $${vals.length + 1}`);
        vals.push(query.orderId);
      }
      if (query._id || query.id) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(query._id || query.id);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const res = await pool.query(sql, vals);
      if (res.rows.length === 0) return null;
      const o = new OrderInstance(res.rows[0]);
      await populateOrder(o, populates);
      return o;
    });
  }

  static async deleteMany() {
    await pool.query('DELETE FROM orders');
  }
}

module.exports = Order;
