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
    this.applicableProducts = typeof row.applicable_products === 'string' ? JSON.parse(row.applicable_products) : (row.applicable_products || []);
    this.applicableCategories = typeof row.applicable_categories === 'string' ? JSON.parse(row.applicable_categories) : (row.applicable_categories || []);
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE coupons 
      SET code = $1, discount_type = $2, discount_value = $3, min_purchase = $4, max_discount = $5,
          description = $6, valid_from = $7, valid_until = $8, is_active = $9, usage_limit = $10,
          used_count = $11, applicable_products = $12, applicable_categories = $13
      WHERE id = $14
      RETURNING *
    `;
    const vals = [
      this.code,
      this.discountType,
      this.discountValue,
      this.minPurchase,
      this.maxDiscount,
      this.description || '',
      this.validFrom instanceof Date ? this.validFrom.toISOString() : this.validFrom,
      this.validUntil instanceof Date ? this.validUntil.toISOString() : this.validUntil,
      this.isActive,
      this.usageLimit,
      this.usedCount,
      JSON.stringify(this.applicableProducts || []),
      JSON.stringify(this.applicableCategories || []),
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
        typeof data.code === 'string' ? data.code.toUpperCase() : data.code,
        data.discountType,
        data.discountValue,
        data.minPurchase || 0,
        data.maxDiscount || 0,
        data.description || '',
        data.validFrom ? (data.validFrom instanceof Date ? data.validFrom.toISOString() : data.validFrom) : new Date().toISOString(),
        data.validUntil instanceof Date ? data.validUntil.toISOString() : data.validUntil,
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
        vals.push(typeof query.code === 'string' ? query.code.toUpperCase() : query.code);
      }
      if (query._id || query.id) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(query._id || query.id);
      }
      if (query.isActive !== undefined) {
        conditions.push(`is_active = $${vals.length + 1}`);
        vals.push(query.isActive ? 1 : 0);
      }
      if (query.validFrom && query.validFrom.$lte) {
        conditions.push(`valid_from <= $${vals.length + 1}`);
        vals.push(query.validFrom.$lte instanceof Date ? query.validFrom.$lte.toISOString() : query.validFrom.$lte);
      }
      if (query.validUntil && query.validUntil.$gte) {
        conditions.push(`valid_until >= $${vals.length + 1}`);
        vals.push(query.validUntil.$gte instanceof Date ? query.validUntil.$gte.toISOString() : query.validUntil.$gte);
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

      if (query.code) {
        conditions.push(`code = $${vals.length + 1}`);
        vals.push(typeof query.code === 'string' ? query.code.toUpperCase() : query.code);
      }

      if (query._id || query.id) {
        conditions.push(`id = $${vals.length + 1}`);
        vals.push(query._id || query.id);
      }

      if (query.discountType) {
        conditions.push(`discount_type = $${vals.length + 1}`);
        vals.push(query.discountType);
      }

      if (query.isActive !== undefined) {
        conditions.push(`is_active = $${vals.length + 1}`);
        vals.push(query.isActive ? 1 : 0);
      }

      if (query.validFrom && query.validFrom.$lte) {
        conditions.push(`valid_from <= $${vals.length + 1}`);
        vals.push(query.validFrom.$lte instanceof Date ? query.validFrom.$lte.toISOString() : query.validFrom.$lte);
      }

      if (query.validUntil && query.validUntil.$gte) {
        conditions.push(`valid_until >= $${vals.length + 1}`);
        vals.push(query.validUntil.$gte instanceof Date ? query.validUntil.$gte.toISOString() : query.validUntil.$gte);
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
    const res = await pool.query('SELECT * FROM coupons WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const coupon = new CouponInstance(res.rows[0]);
    if (updateData.code !== undefined) coupon.code = updateData.code;
    if (updateData.discountType !== undefined) coupon.discountType = updateData.discountType;
    if (updateData.discountValue !== undefined) coupon.discountValue = updateData.discountValue;
    if (updateData.minPurchase !== undefined) coupon.minPurchase = updateData.minPurchase;
    if (updateData.maxDiscount !== undefined) coupon.maxDiscount = updateData.maxDiscount;
    if (updateData.description !== undefined) coupon.description = updateData.description;
    if (updateData.validFrom !== undefined) coupon.validFrom = updateData.validFrom;
    if (updateData.validUntil !== undefined) coupon.validUntil = updateData.validUntil;
    if (updateData.isActive !== undefined) coupon.isActive = updateData.isActive;
    if (updateData.usageLimit !== undefined) coupon.usageLimit = updateData.usageLimit;
    if (updateData.usedCount !== undefined) coupon.usedCount = updateData.usedCount;
    if (updateData.applicableProducts !== undefined) coupon.applicableProducts = updateData.applicableProducts;
    if (updateData.applicableCategories !== undefined) coupon.applicableCategories = updateData.applicableCategories;
    await coupon.save();
    return coupon;
  }

  static async findByIdAndDelete(id) {
    const res = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);
    if (res.rows.length === 0) return null;
    return new CouponInstance(res.rows[0]);
  }

  static async deleteMany() {
    await pool.query('DELETE FROM coupons');
  }
}

module.exports = Coupon;
