const { pool } = require('../config/db');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class CategoryInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.categoryName = row.category_name;
    this.categoryImage = row.category_image;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE categories
      SET category_name = $1, category_image = $2
      WHERE id = $3
      RETURNING *
    `;
    const vals = [
      this.categoryName,
      this.categoryImage || '',
      this.id
    ];
    const res = await pool.query(sql, vals);
    if (res.rows.length > 0) {
      this.categoryName = res.rows[0].category_name;
      this.categoryImage = res.rows[0].category_image;
    }
    return this;
  }
}

class Category {
  static async find(query = {}) {
    const res = await pool.query('SELECT * FROM categories ORDER BY category_name ASC');
    return res.rows.map(r => new CategoryInstance(r));
  }

  static async findOne(query) {
    let sql = 'SELECT * FROM categories';
    let vals = [];
    if (query.categoryName) {
      if (typeof query.categoryName === 'object' && query.categoryName.$regex) {
        sql += ' WHERE category_name ILIKE $1';
        vals.push(`%${query.categoryName.$regex}%`);
      } else {
        sql += ' WHERE category_name = $1';
        vals.push(query.categoryName);
      }
    } else if (query._id) {
      sql += ' WHERE id = $1';
      vals.push(query._id);
    }
    const res = await pool.query(sql, vals);
    if (res.rows.length === 0) return null;
    return new CategoryInstance(res.rows[0]);
  }

  static async findById(id) {
    const res = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return new CategoryInstance(res.rows[0]);
  }

  static async create(data) {
    const id = generateId();
    const res = await pool.query(
      `INSERT INTO categories (id, category_name, category_image) VALUES ($1, $2, $3) RETURNING *`,
      [id, data.categoryName, data.categoryImage]
    );
    return new CategoryInstance(res.rows[0]);
  }

  static async insertMany(items) {
    const created = [];
    for (const item of items) {
      const c = await this.create(item);
      created.push(c);
    }
    return created;
  }

  static async deleteMany() {
    await pool.query('DELETE FROM categories');
  }
}

module.exports = Category;
