const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class InvoiceInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.invoiceId = row.invoice_id;
    this.customer = row.customer_id;
    this.customerId = row.customer_id;
    this.repairOrder = row.repair_order_id;
    this.repairOrderId = row.repair_order_id;
    this.order = row.order_id;
    this.orderId = row.order_id;
    this.date = row.date;
    this.dueDate = row.due_date;
    this.status = row.status;
    this.items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
    this.subtotal = parseFloat(row.subtotal);
    this.cgst = parseFloat(row.cgst || 0);
    this.sgst = parseFloat(row.sgst || 0);
    this.totalAmount = parseFloat(row.total_amount);
    this.serviceCharge = parseFloat(row.service_charge || 0);
    this.paymentInstructions = row.payment_instructions;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE invoices
      SET status = $1, items = $2, subtotal = $3, cgst = $4, sgst = $5,
          total_amount = $6, service_charge = $7, payment_instructions = $8
      WHERE id = $9
      RETURNING *
    `;
    const vals = [
      this.status,
      JSON.stringify(this.items || []),
      this.subtotal,
      this.cgst || 0,
      this.sgst || 0,
      this.totalAmount,
      this.serviceCharge || 0,
      this.paymentInstructions || 'System Generated Invoice - No signature required',
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

async function populateInvoice(inv, populates) {
  if (!inv) return;
  const hasCustomer = populates.some(p => p === 'customer' || (p && p.path === 'customer'));
  const hasRepairOrder = populates.some(p => p === 'repairOrder' || (p && p.path === 'repairOrder'));

  if (hasCustomer && inv.customerId) {
    // Note: In schema, customer_id points to users(id) in invoices table
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [inv.customerId]);
    if (userRes.rows[0]) {
      inv.customer = {
        _id: userRes.rows[0].id,
        id: userRes.rows[0].id,
        fullName: userRes.rows[0].full_name,
        email: userRes.rows[0].email,
        phoneNumber: userRes.rows[0].phone_number,
        address: userRes.rows[0].address || {}
      };
    }
  }

  if (hasRepairOrder && inv.repairOrderId) {
    const repRes = await pool.query('SELECT * FROM repair_orders WHERE id = $1', [inv.repairOrderId]);
    if (repRes.rows[0]) {
      inv.repairOrder = {
        _id: repRes.rows[0].id,
        repairId: repRes.rows[0].repair_id,
        issueDescription: repRes.rows[0].issue_description
      };
    }
  }
}

class Invoice {
  static create(data) {
    return new CustomQuery(async () => {
      const id = generateId();
      const sql = `
        INSERT INTO invoices (
          id, invoice_id, customer_id, repair_order_id, order_id, date, due_date, status, 
          items, subtotal, cgst, sgst, service_charge, total_amount, payment_instructions
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      const vals = [
        id,
        data.invoiceId,
        data.customer || data.customerId,
        data.repairOrder || data.repairOrderId || null,
        data.order || data.orderId || null,
        data.date || new Date(),
        data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        data.status || 'Pending',
        JSON.stringify(data.items || []),
        data.subtotal,
        data.cgst || 0,
        data.sgst || 0,
        data.serviceCharge || 0,
        data.totalAmount,
        data.paymentInstructions || 'System Generated Invoice - No signature required'
      ];

      const res = await pool.query(sql, vals);
      return new InvoiceInstance(res.rows[0]);
    });
  }

  static find(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM invoices';
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
      if (query.order || query.orderId) {
        conditions.push(`order_id = $${vals.length + 1}`);
        vals.push(query.order || query.orderId);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY created_at DESC';

      const res = await pool.query(sql, vals);
      const list = res.rows.map(r => new InvoiceInstance(r));
      for (const inv of list) {
        await populateInvoice(inv, populates);
      }
      return list;
    });
  }

  static findById(id) {
    return new CustomQuery(async ({ populates }) => {
      const res = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const inv = new InvoiceInstance(res.rows[0]);
      await populateInvoice(inv, populates);
      return inv;
    });
  }

  static findOne(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM invoices';
      let vals = [];
      let conditions = [];

      if (query.invoiceId) {
        conditions.push(`invoice_id = $${vals.length + 1}`);
        vals.push(query.invoiceId);
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
      const inv = new InvoiceInstance(res.rows[0]);
      await populateInvoice(inv, populates);
      return inv;
    });
  }

  static async deleteMany() {
    await pool.query('DELETE FROM invoices');
  }
}

module.exports = Invoice;
