const { pool } = require('../config/db');
const CustomQuery = require('../utils/customQuery');

const generateId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return (timestamp + machine + pid + increment).substring(0, 24);
};

class RepairOrderInstance {
  constructor(row) {
    if (!row) return;
    this._id = row.id;
    this.id = row.id;
    this.repairId = row.repair_id;
    this.customer = row.customer_id;
    this.customerId = row.customer_id;
    this.device = row.device_id;
    this.deviceId = row.device_id;
    this.issueDescription = row.issue_description;
    this.selectedIssues = row.selected_issues || [];
    this.estimatedCost = row.estimated_cost ? parseFloat(row.estimated_cost) : null;
    this.finalCost = row.final_cost ? parseFloat(row.final_cost) : null;
    this.technicianNotes = row.technician_notes || '';
    this.repairStatus = row.repair_status;
    this.repairImages = row.repair_images || [];
    this.assignedTechnician = row.assigned_technician_id;
    this.assignedTechnicianId = row.assigned_technician_id;
    this.warrantyExpiresAt = row.warranty_expires_at;
    this.expectedDeliveryDate = row.expected_delivery_date;
    this.onHold = row.on_hold;
    this.holdReason = row.hold_reason || '';
    this.diagnosisDetails = row.diagnosis_details || '';
    this.customerNotes = row.customer_notes || '';
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const sql = `
      UPDATE repair_orders 
      SET repair_status = $1, technician_notes = $2, final_cost = $3, 
          expected_delivery_date = $4, on_hold = $5, hold_reason = $6, 
          diagnosis_details = $7, customer_notes = $8, estimated_cost = $9,
          assigned_technician_id = $10
      WHERE id = $11
      RETURNING *
    `;
    const vals = [
      this.repairStatus,
      this.technicianNotes,
      this.finalCost,
      this.expectedDeliveryDate,
      this.onHold,
      this.holdReason,
      this.diagnosisDetails,
      this.customerNotes,
      this.estimatedCost,
      this.assignedTechnicianId,
      this.id
    ];
    await pool.query(sql, vals);
    return this;
  }
}

async function populateRepairOrder(r, populates) {
  if (!r) return;
  const hasDevice = populates.some(p => p === 'device' || (p && p.path === 'device'));
  const hasCustomer = populates.some(p => p === 'customer' || (p && p.path === 'customer'));
  const hasTechnician = populates.some(p => p === 'assignedTechnician' || (p && p.path === 'assignedTechnician'));

  if (hasDevice && r.deviceId) {
    const devRes = await pool.query('SELECT * FROM devices WHERE id = $1', [r.deviceId]);
    if (devRes.rows[0]) {
      r.device = {
        _id: devRes.rows[0].id,
        id: devRes.rows[0].id,
        brand: devRes.rows[0].brand,
        model: devRes.rows[0].model,
        imei: devRes.rows[0].imei,
        condition: devRes.rows[0].condition,
        images: devRes.rows[0].images || []
      };
    }
  }

  if (hasCustomer && r.customerId) {
    const custRes = await pool.query('SELECT * FROM customers WHERE id = $1', [r.customerId]);
    if (custRes.rows[0]) {
      const customerObj = {
        _id: custRes.rows[0].id,
        id: custRes.rows[0].id,
        loyaltyPoints: custRes.rows[0].loyalty_points,
        userId: custRes.rows[0].user_id
      };
      
      const custPopOption = populates.find(p => p && p.path === 'customer');
      const shouldPopulateUser = !custPopOption || (custPopOption.populate && (custPopOption.populate.path === 'userId' || custPopOption.populate === 'userId')) || true;
      
      if (shouldPopulateUser && custRes.rows[0].user_id) {
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [custRes.rows[0].user_id]);
        if (userRes.rows[0]) {
          customerObj.userId = {
            _id: userRes.rows[0].id,
            id: userRes.rows[0].id,
            fullName: userRes.rows[0].full_name,
            email: userRes.rows[0].email,
            phoneNumber: userRes.rows[0].phone_number,
            profileImage: userRes.rows[0].profile_image || '',
            address: userRes.rows[0].address || {}
          };
        }
      }
      r.customer = customerObj;
    }
  }

  if (hasTechnician && r.assignedTechnicianId) {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [r.assignedTechnicianId]);
    if (userRes.rows[0]) {
      r.assignedTechnician = {
        _id: userRes.rows[0].id,
        id: userRes.rows[0].id,
        fullName: userRes.rows[0].full_name,
        email: userRes.rows[0].email,
        phoneNumber: userRes.rows[0].phone_number
      };
    }
  }
}

class RepairOrder {
  static create(data) {
    return new CustomQuery(async () => {
      const id = generateId();
      const sql = `
        INSERT INTO repair_orders (
          id, repair_id, customer_id, device_id, issue_description, selected_issues,
          estimated_cost, final_cost, technician_notes, repair_status, 
          repair_images, assigned_technician_id, warranty_expires_at, 
          expected_delivery_date, on_hold, hold_reason, diagnosis_details, customer_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;
      const vals = [
        id,
        data.repairId,
        data.customer || data.customerId,
        data.device || data.deviceId,
        data.issueDescription,
        JSON.stringify(data.selectedIssues || []),
        data.estimatedCost || null,
        data.finalCost || null,
        data.technicianNotes || '',
        data.repairStatus || 'Received',
        JSON.stringify(data.repairImages || []),
        data.assignedTechnician || data.assignedTechnicianId || null,
        data.warrantyExpiresAt || null,
        data.expectedDeliveryDate || null,
        data.onHold || false,
        data.holdReason || '',
        data.diagnosisDetails || '',
        data.customerNotes || ''
      ];

      const res = await pool.query(sql, vals);
      return new RepairOrderInstance(res.rows[0]);
    });
  }

  static find(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM repair_orders';
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
      if (query.assignedTechnician) {
        conditions.push(`assigned_technician_id = $${vals.length + 1}`);
        vals.push(query.assignedTechnician);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY created_at DESC';

      const res = await pool.query(sql, vals);
      const list = res.rows.map(r => new RepairOrderInstance(r));
      for (const r of list) {
        await populateRepairOrder(r, populates);
      }
      return list;
    });
  }

  static findById(id) {
    return new CustomQuery(async ({ populates }) => {
      const res = await pool.query('SELECT * FROM repair_orders WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const r = new RepairOrderInstance(res.rows[0]);
      await populateRepairOrder(r, populates);
      return r;
    });
  }

  static findOne(query = {}) {
    return new CustomQuery(async ({ populates }) => {
      let sql = 'SELECT * FROM repair_orders';
      let vals = [];
      let conditions = [];

      if (query.repairId) {
        conditions.push(`repair_id = $${vals.length + 1}`);
        vals.push(query.repairId);
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
      const r = new RepairOrderInstance(res.rows[0]);
      await populateRepairOrder(r, populates);
      return r;
    });
  }

  static async deleteMany() {
    await pool.query('DELETE FROM repair_orders');
  }
}

module.exports = RepairOrder;
