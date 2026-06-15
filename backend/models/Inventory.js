const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class InventoryInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.product = row.product_id; // Will hold populated product
    this.productId = row.product_id;
    this.stockAvailable = row.stock_available;
    this.lowStockLimit = row.low_stock_limit;
    this.supplierDetails = row.supplier_details || {};
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async populate(opt) {
    let path = typeof opt === 'string' ? opt : opt.path;
    if (path === 'product') {
      const prodRes = await pool.query('SELECT * FROM products WHERE id = $1', [this.productId]);
      if (prodRes.rows[0]) {
        this.product = {
          _id: prodRes.rows[0].id,
          id: prodRes.rows[0].id,
          productId: prodRes.rows[0].product_id,
          title: prodRes.rows[0].title,
          price: parseFloat(prodRes.rows[0].price),
          stock: prodRes.rows[0].stock
        };
      }
    }
    return this;
  }

  async save() {
    const sql = `
      UPDATE inventory 
      SET stock_available = $1, low_stock_limit = $2, supplier_details = $3
      WHERE id = $4
      RETURNING *
    `;
    const vals = [
      this.stockAvailable,
      this.lowStockLimit,
      JSON.stringify(this.supplierDetails),
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

class Inventory {
  static async create(data) {
    const id = generateId();
    const sql = `
      INSERT INTO inventory (id, product_id, stock_available, low_stock_limit, supplier_details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const vals = [
      id,
      data.product,
      data.stockAvailable || 0,
      data.lowStockLimit || 5,
      JSON.stringify(data.supplierDetails || {})
    ];

    const res = await pool.query(sql, vals);
    return new InventoryInstance(res.rows[0]);
  }

  static async findOne(query) {
    let sql = 'SELECT * FROM inventory';
    let vals = [];
    if (query.product) {
      sql += ' WHERE product_id = $1';
      vals.push(query.product);
    } else if (query._id) {
      sql += ' WHERE id = $1';
      vals.push(query._id);
    }

    const res = await pool.query(sql, vals);
    if (res.rows.length === 0) {
      return {
        populate: () => null
      };
    }
    return new InventoryInstance(res.rows[0]);
  }

  static async find(query = {}) {
    const res = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    const items = res.rows.map(r => new InventoryInstance(r));

    items.populate = async (opt) => {
      for (const item of items) {
        await item.populate(opt);
      }
      return items;
    };

    return items;
  }

  static async deleteMany() {
    await pool.query('DELETE FROM inventory');
  }
}

module.exports = Inventory;
