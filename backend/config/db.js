const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected successfully to Supabase');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          user_id TEXT,
          user_name TEXT DEFAULT 'Unknown',
          user_email TEXT DEFAULT '',
          user_role TEXT DEFAULT 'guest',
          action TEXT NOT NULL,
          resource_type TEXT DEFAULT 'general',
          resource_id TEXT,
          details JSONB DEFAULT '{}',
          ip_address TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (e) {
      console.warn('Activity logs table creation warning:', e.message);
    }
      
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_devices_customer ON devices(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_repair_orders_customer ON repair_orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_repair_orders_device ON repair_orders(device_id)',
      'CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(repair_status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_repair_order ON invoices(repair_order_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)'
    ];

    for (const idxSql of indexes) {
      try {
        await client.query(idxSql);
      } catch (idxErr) {
        console.warn(`Index optimization warning (${idxSql.split(' ')[5]}): ${idxErr.message}`);
      }
    }

    try {
      await client.query(`ALTER TABLE repair_orders ADD COLUMN IF NOT EXISTS selected_issues JSONB DEFAULT '[]'::jsonb`);
    } catch (e) {
      console.warn('Add selected_issues column warning:', e.message);
    }

    // Ensure repair_status CHECK constraint includes all statuses used by the app
    try {
      await client.query(`ALTER TABLE repair_orders DROP CONSTRAINT IF EXISTS repair_orders_repair_status_check`);
      await client.query(`
        ALTER TABLE repair_orders
        ADD CONSTRAINT repair_orders_repair_status_check
        CHECK (repair_status IN (
          'Received', 'Under Review', 'Diagnosis Complete',
          'Awaiting Approval', 'Approved', 'Repair Started',
          'Parts Ordered', 'Repair Completed', 'Ready For Pickup',
          'Delivered', 'Cancelled'
        ))
      `);
    } catch (e) {
      console.warn('Repair status constraint update warning:', e.message);
    }

    try {
      await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service_charge NUMERIC DEFAULT 0`);
    } catch (e) {
      console.warn('Add service_charge column warning:', e.message);
    }

    client.release();
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, pool };
