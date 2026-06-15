const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class ProductInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.productId = row.product_id;
    this.title = row.title;
    this.description = row.description;
    this.category = row.category_id;
    this.categoryId = row.category_id;
    this.stock = row.stock;
    this.price = parseFloat(row.price) || 0;
    this.discount = parseFloat(row.discount || 0) || 0;
    try {
      this.images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
    } catch {
      this.images = [];
    }
    try {
      this.specifications = typeof row.specifications === 'string' ? JSON.parse(row.specifications) : (row.specifications || {});
    } catch {
      this.specifications = {};
    }
    this.model3d = row.model_3d || '';
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE products
      SET title = $1, price = $2, discount = $3, stock = $4,
          description = $5, specifications = $6
      WHERE id = $7
      RETURNING *
    `;
    const vals = [
      this.title,
      this.price,
      this.discount || 0,
      this.stock,
      this.description || '',
      JSON.stringify(this.specifications || {}),
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

class Product {
  static find(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM products';
      let vals = [];
      let conditions = [];

      // Parse category
      if (query.category) {
        conditions.push(`category_id = $${vals.length + 1}`);
        vals.push(query.category);
      }

      // Parse id / _id
      const idVal = query.id || query._id;
      if (idVal) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(idVal);
      }

      // Parse title regex/like
      if (query.title) {
        if (typeof query.title === 'object' && query.title.$regex) {
          conditions.push(`title ILIKE $${vals.length + 1}`);
          vals.push(`%${query.title.$regex}%`);
        } else {
          conditions.push(`title = $${vals.length + 1}`);
          vals.push(query.title);
        }
      }

      // Parse stock comparison (e.g. { stock: { $gt: 0 } })
      if (query.stock) {
        if (typeof query.stock === 'object') {
          if (query.stock.$gt !== undefined) {
            conditions.push(`stock > $${vals.length + 1}`);
            vals.push(query.stock.$gt);
          }
          if (query.stock.$lt !== undefined) {
            conditions.push(`stock < $${vals.length + 1}`);
            vals.push(query.stock.$lt);
          }
        } else {
          conditions.push(`stock = $${vals.length + 1}`);
          vals.push(query.stock);
        }
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const res = await pool.query(sql, vals);
      const products = res.rows.map(r => new ProductInstance(r));

      // Handle populates
      if (populates.includes('category')) {
        for (const p of products) {
          const catRes = await pool.query('SELECT * FROM categories WHERE id = $1', [p.categoryId]);
          if (catRes.rows[0]) {
            p.category = {
              _id: catRes.rows[0].id,
              id: catRes.rows[0].id,
              categoryName: catRes.rows[0].category_name,
              categoryImage: catRes.rows[0].category_image
            };
          }
        }
      }

      return products;
    });
  }

  static findById(id) {
    return new CustomQuery(async ({ populates }) => {
      const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const p = new ProductInstance(res.rows[0]);

      if (populates.includes('category')) {
        const catRes = await pool.query('SELECT * FROM categories WHERE id = $1', [p.categoryId]);
        if (catRes.rows[0]) {
          p.category = {
            _id: catRes.rows[0].id,
            id: catRes.rows[0].id,
            categoryName: catRes.rows[0].category_name,
            categoryImage: catRes.rows[0].category_image
          };
        }
      }

      return p;
    });
  }

  static async create(data) {
    const id = generateId();
    const sql = `
      INSERT INTO products (id, product_id, title, description, category_id, stock, price, discount, images, specifications, model_3d)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const vals = [
      id,
      data.productId,
      data.title,
      data.description,
      data.category,
      data.stock || 0,
      data.price,
      data.discount || 0,
      JSON.stringify(data.images || []),
      JSON.stringify(data.specifications || {}),
      data.model3d || ''
    ];

    const res = await pool.query(sql, vals);
    return new ProductInstance(res.rows[0]);
  }

  static async insertMany(items) {
    const created = [];
    for (const item of items) {
      const p = await this.create(item);
      created.push(p);
    }
    return created;
  }

  static async deleteMany() {
    await pool.query('DELETE FROM products');
  }
}

module.exports = Product;
