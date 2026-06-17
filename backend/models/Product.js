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
    const getAutoImage = (title) => {
      const t = (title || '').toLowerCase();
      if (t.includes('iphone')) return "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600";
      if (t.includes('samsung') || t.includes('galaxy')) return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600";
      if (t.includes('pixel') || t.includes('google')) return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600";
      if (t.includes('macbook')) return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600";
      if (t.includes('ipad') || t.includes('tablet')) return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600";
      if (t.includes('watch') || t.includes('wearable')) return "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=600";
      if (t.includes('sony') || t.includes('headphones') || t.includes('xm6') || t.includes('xm5')) return "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600";
      if (t.includes('airpods') || t.includes('earbuds') || t.includes('buds')) return "https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=600";
      if (t.includes('dell') || t.includes('xps') || t.includes('laptop')) return "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600";
      if (t.includes('oneplus')) return "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=600";
      if (t.includes('mouse') || t.includes('keyboard') || t.includes('logitech')) return "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600";
      if (t.includes('charger') || t.includes('adapter')) return "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=600";
      if (t.includes('cable')) return "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=600";
      if (t.includes('case') || t.includes('cover')) return "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600";
      if (t.includes('glass') || t.includes('protector')) return "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=600";
      if (t.includes('power') || t.includes('bank')) return "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&q=80&w=600";
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600";
    };

    try {
      let imgs = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
      if (!imgs || imgs.length === 0 || !imgs[0] || imgs[0].includes('placeholder') || imgs[0].includes('picsum.photos')) {
        imgs = [getAutoImage(row.title)];
      }
      this.images = imgs;
    } catch {
      this.images = [getAutoImage(row.title)];
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
          description = $5, specifications = $6, category_id = $7,
          images = $8, model_3d = $9, product_id = $10
      WHERE id = $11
      RETURNING *
    `;
    const vals = [
      this.title,
      this.price,
      this.discount || 0,
      this.stock,
      this.description || '',
      JSON.stringify(this.specifications || {}),
      this.category?.id || this.category?._id || this.category || this.categoryId,
      JSON.stringify(this.images || []),
      this.model3d || '',
      this.productId || '',
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

class Product {
  static find(query = {}, projection) {
    return new CustomQuery(async ({ populates, selects, sort, limit }) => {
      let sql = 'SELECT * FROM products';
      let vals = [];
      let conditions = [];

      if (query.category) {
        const catVal = query.category?.id || query.category?._id || query.category;
        conditions.push(`category_id = $${vals.length + 1}`);
        vals.push(catVal);
      }

      const idVal = query.id || query._id;
      if (idVal) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(idVal);
      }

      if (query.title) {
        if (typeof query.title === 'object' && query.title.$regex) {
          conditions.push(`title ILIKE $${vals.length + 1}`);
          vals.push(`%${query.title.$regex}%`);
        } else {
          conditions.push(`title = $${vals.length + 1}`);
          vals.push(query.title);
        }
      }

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

      if (query.price) {
        if (typeof query.price === 'object') {
          if (query.price.$gte !== undefined) {
            conditions.push(`price >= $${vals.length + 1}`);
            vals.push(query.price.$gte);
          }
          if (query.price.$lte !== undefined) {
            conditions.push(`price <= $${vals.length + 1}`);
            vals.push(query.price.$lte);
          }
          if (query.price.$gt !== undefined) {
            conditions.push(`price > $${vals.length + 1}`);
            vals.push(query.price.$gt);
          }
          if (query.price.$lt !== undefined) {
            conditions.push(`price < $${vals.length + 1}`);
            vals.push(query.price.$lt);
          }
        } else {
          conditions.push(`price = $${vals.length + 1}`);
          vals.push(query.price);
        }
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      if (sort) {
        const sortField = { created_at: 'created_at', createdAt: 'created_at', price: 'price', title: 'title', discount: 'discount' }[sort] || 'created_at';
        sql += ` ORDER BY ${sortField} DESC`;
      } else {
        sql += ' ORDER BY created_at DESC';
      }

      if (limit) {
        sql += ` LIMIT ${Number(limit)}`;
      }

      const res = await pool.query(sql, vals);
      let products = res.rows.map(r => new ProductInstance(r));

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
      data.category?.id || data.category?._id || data.category,
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
