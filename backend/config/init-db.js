const path = require('path');
const fs = require('fs');

const SCHEMA_PATH = process.env.SQLITE_SCHEMA_PATH || path.join(__dirname, 'schema.sql');

function getSchema() {
  const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  address TEXT DEFAULT '{}',
  security_questions TEXT DEFAULT '[]',
  profile_image TEXT DEFAULT '',
  otp TEXT,
  otp_expires TEXT,
  password_history TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  loyalty_points INTEGER DEFAULT 0,
  devices TEXT DEFAULT '[]',
  order_history TEXT DEFAULT '[]',
  repair_history TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  brand TEXT,
  model TEXT,
  imei TEXT,
  condition TEXT DEFAULT 'Good',
  images TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  category_name TEXT NOT NULL,
  category_image TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  images TEXT DEFAULT '[]',
  specifications TEXT DEFAULT '{}',
  model_3d TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS repair_orders (
  id TEXT PRIMARY KEY,
  repair_id TEXT,
  customer_id TEXT REFERENCES customers(id),
  device_id TEXT REFERENCES devices(id),
  issue_description TEXT,
  selected_issues TEXT DEFAULT '[]',
  estimated_cost REAL,
  final_cost REAL,
  technician_notes TEXT DEFAULT '',
  repair_status TEXT DEFAULT 'Received',
  repair_images TEXT DEFAULT '[]',
  assigned_technician_id TEXT,
  warranty_expires_at TEXT,
  expected_delivery_date TEXT,
  on_hold INTEGER DEFAULT 0,
  hold_reason TEXT DEFAULT '',
  diagnosis_details TEXT DEFAULT '',
  customer_notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  customer_id TEXT REFERENCES customers(id),
  products TEXT DEFAULT '[]',
  total_amount REAL DEFAULT 0,
  payment_info TEXT DEFAULT '{}',
  payment_status TEXT DEFAULT 'Pending',
  order_status TEXT DEFAULT 'Processing',
  shipping_address TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  stock_available INTEGER DEFAULT 0,
  low_stock_limit INTEGER DEFAULT 5,
  supplier_details TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_id TEXT,
  customer_id TEXT REFERENCES customers(id),
  repair_order_id TEXT REFERENCES repair_orders(id),
  date TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'Pending',
  items TEXT DEFAULT '[]',
  subtotal REAL DEFAULT 0,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  service_charge REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  payment_instructions TEXT DEFAULT 'System Generated Invoice',
  order_id TEXT REFERENCES orders(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

ALTER TABLE invoices ADD COLUMN order_id TEXT REFERENCES orders(id);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  discount_type TEXT,
  discount_value REAL DEFAULT 0,
  min_purchase REAL DEFAULT 0,
  max_discount REAL DEFAULT 0,
  description TEXT DEFAULT '',
  valid_from TEXT,
  valid_until TEXT,
  is_active INTEGER DEFAULT 1,
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  applicable_products TEXT DEFAULT '[]',
  applicable_categories TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'general',
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT,
  phone_number TEXT,
  source TEXT DEFAULT 'web',
  messages TEXT DEFAULT '[]',
  context TEXT DEFAULT '{}',
  is_resolved INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_visits (
  id TEXT PRIMARY KEY,
  page TEXT,
  user_id TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS search_queries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  query TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  user_name TEXT DEFAULT 'Unknown',
  user_email TEXT DEFAULT '',
  user_role TEXT DEFAULT 'guest',
  action TEXT NOT NULL,
  resource_type TEXT DEFAULT 'general',
  resource_id TEXT,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_devices_customer ON devices(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_customer ON repair_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_device ON repair_orders(device_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(repair_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_repair_order ON invoices(repair_order_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
`;
  return schema;
}

async function initDatabase(db) {
  const schema = getSchema();
  const statements = schema.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      db.exec(stmt + ';');
    } catch (err) {
      console.warn('Schema init warning:', err.message);
    }
  }
  console.log('SQLite database initialized successfully');

  // Auto-seed categories and products if empty
  try {
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    if (categoryCount === 0) {
      console.log('Seeding categories...');
      const categoriesList = [
        { id: 'cat-001', name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600' },
        { id: 'cat-002', name: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600' },
        { id: 'cat-003', name: 'Tablets', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600' },
        { id: 'cat-004', name: 'Wearables', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=600' },
        { id: 'cat-005', name: 'Accessories', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600' }
      ];
      const insertCat = db.prepare('INSERT INTO categories (id, category_name, category_image) VALUES (?, ?, ?)');
      for (const cat of categoriesList) {
        insertCat.run(cat.id, cat.name, cat.image);
      }
    }

    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (productCount === 0) {
      console.log('Seeding products...');
      const productsPath = path.join(__dirname, '..', 'data', 'products.json');
      if (fs.existsSync(productsPath)) {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const insertProd = db.prepare(`
          INSERT INTO products (id, product_id, title, description, category_id, stock, price, discount, images, specifications, model_3d)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of productsData) {
          const catRow = db.prepare('SELECT id FROM categories WHERE category_name = ?').get(p.category);
          const catId = catRow ? catRow.id : 'cat-005';
          
          const id = p.productId || Math.random().toString(36).substring(2, 15);
          insertProd.run(
            id,
            p.productId,
            p.title,
            p.description,
            catId,
            p.stock,
            p.price,
            p.discount || 0,
            JSON.stringify(p.images || []),
            JSON.stringify(p.specifications || {}),
            p.model3d || ''
          );
        }
      }
    }

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      console.log('Seeding default users...');
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      
      const adminPassword = bcrypt.hashSync('admin123', salt);
      const customerPassword = bcrypt.hashSync('customer123', salt);

      const generateId = () => {
        const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
        const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, '0');
        const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        return (timestamp + machine + pid + increment).substring(0, 24);
      };

      const adminId = generateId();
      const customerId = generateId();
      const customerProfileId = generateId();

      // Seed admin
      db.prepare(`
        INSERT INTO users (id, full_name, phone_number, email, password, role, address, security_questions, password_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        adminId,
        'System Admin',
        '9876543210',
        'admin@electrofix.com',
        adminPassword,
        'admin',
        JSON.stringify({ street: '123 Main St', city: 'Bangalore', state: 'Karnataka', zip: '560001' }),
        JSON.stringify([
          { question: "What is your mother's maiden name?", answer: bcrypt.hashSync('admin', salt) },
          { question: 'What was the name of your first pet?', answer: bcrypt.hashSync('admin', salt) },
          { question: 'What city were you born in?', answer: bcrypt.hashSync('admin', salt) }
        ]),
        JSON.stringify([adminPassword])
      );

      // Seed customer
      db.prepare(`
        INSERT INTO users (id, full_name, phone_number, email, password, role, address, security_questions, password_history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customerId,
        'John Doe',
        '9876543211',
        'john@example.com',
        customerPassword,
        'customer',
        JSON.stringify({ street: '456 Side St', city: 'Bangalore', state: 'Karnataka', zip: '560002' }),
        JSON.stringify([
          { question: "What is your mother's maiden name?", answer: bcrypt.hashSync('customer', salt) },
          { question: 'What was the name of your first pet?', answer: bcrypt.hashSync('customer', salt) },
          { question: 'What city were you born in?', answer: bcrypt.hashSync('customer', salt) }
        ]),
        JSON.stringify([customerPassword])
      );

      // Seed customer profile link
      db.prepare(`
        INSERT INTO customers (id, user_id, loyalty_points)
        VALUES (?, ?, ?)
      `).run(
        customerProfileId,
        customerId,
        100
      );

      console.log('Default users seeded successfully');
    }
  } catch (seedErr) {
    console.error('Failed to seed database:', seedErr.message);
  }
}

module.exports = { initDatabase, getSchema };
