const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class CouponInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.code = row.code;
    this.discountType = row.discount_type;
    this.discountValue = parseFloat(row.discount_value);
    this.minPurchase = parseFloat(row.min_purchase || 0);
    this.maxDiscount = parseFloat(row.max_discount || 0);
    this.description = row.description || '';
    this.validFrom = row.valid_from;
    this.validUntil = row.valid_until;
    this.isActive = row.is_active;
    this.usageLimit = row.usage_limit || 0;
    this.usedCount = row.used_count || 0;
    this.applicableProducts = row.applicable_products || [];
    this.applicableCategories = row.applicable_categories || [];
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE coupons 
      SET is_active = $1, used_count = $2, usage_limit = $3, min_purchase = $4, max_discount = $5, description = $6, valid_until = $7
      WHERE id = $8
      RETURNING *
    `;
    const vals = [
      this.isActive,
      this.usedCount,
      this.usageLimit,
      this.minPurchase,
      this.maxDiscount,
      this.description,
      this.validUntil,
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

class Coupon {
  static create(data) {
    return new CustomQuery(async () => {
      const id = generateId();
      const sql = `
        INSERT INTO coupons (
          id, code, discount_type, discount_value, min_purchase, max_discount, description, 
          valid_from, valid_until, is_active, usage_limit, used_count, applicable_products, applicable_categories
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      const vals = [
        id,
        data.code.toUpperCase(),
        data.discountType,
        data.discountValue,
        data.minPurchase || 0,
        data.maxDiscount || 0,
        data.description || '',
        data.validFrom || new Date(),
        data.validUntil,
        data.isActive !== undefined ? data.isActive : true,
        data.usageLimit || 0,
        data.usedCount || 0,
        JSON.stringify(data.applicableProducts || []),
        JSON.stringify(data.applicableCategories || [])
      ];

      const res = await pool.query(sql, vals);
      return new CouponInstance(res.rows[0]);
    });
  }

  static findOne(query) {
    return new CustomQuery(async () => {
      let sql = 'SELECT * FROM coupons';
      let vals = [];
      let conditions = [];
      if (query.code) {
        conditions.push(`code = $${vals.length + 1}`);
        vals.push(query.code.toUpperCase());
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
      return new CouponInstance(res.rows[0]);
    });
  }

  static find(query = {}) {
    return new CustomQuery(async () => {
      let sql = 'SELECT * FROM coupons';
      let vals = [];
      let conditions = [];

      if (query.isActive !== undefined) {
        conditions.push(`is_active = $${vals.length + 1}`);
        vals.push(query.isActive);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY created_at DESC';

      const res = await pool.query(sql, vals);
      return res.rows.map(r => new CouponInstance(r));
    });
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    // Find coupon by ID and update
    const res = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const coupon = new CouponInstance(res.rows[0]);
    if (updateData.isActive !== undefined) coupon.isActive = updateData.isActive;
    if (updateData.usedCount !== undefined) coupon.usedCount = updateData.usedCount;
    if (updateData.minPurchase !== undefined) coupon.minPurchase = updateData.minPurchase;
    if (updateData.maxDiscount !== undefined) coupon.maxDiscount = updateData.maxDiscount;
    if (updateData.description !== undefined) coupon.description = updateData.description;
    if (updateData.validUntil !== undefined) coupon.validUntil = updateData.validUntil;
    await coupon.save();
    return coupon;
  }

  static async findByIdAndDelete(id) {
    await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
    return true;
  }

  static async deleteMany() {
    await pool.query('DELETE FROM coupons');
  }
}

module.exports = Coupon;
