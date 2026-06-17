-- PostgreSQL Database Schema for Shree Renukamba Communication
-- Complete database schema for the e-commerce + repair platform
-- Auto-generated from backend/config/init-db.js

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    address JSONB DEFAULT '{}'::jsonb,
    security_questions JSONB DEFAULT '[]'::jsonb,
    profile_image TEXT DEFAULT '',
    google_id TEXT,
    auth_provider TEXT DEFAULT 'email',
    otp TEXT,
    otp_expires TIMESTAMP,
    password_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- SESSIONS (Token-based session tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_valid INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loyalty_points NUMERIC DEFAULT 0,
    devices JSONB DEFAULT '[]'::jsonb,
    order_history JSONB DEFAULT '[]'::jsonb,
    repair_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    category_name TEXT NOT NULL,
    category_image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
    stock NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    model_3d TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- ============================================================
-- DEVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    brand TEXT,
    model TEXT,
    imei TEXT,
    condition TEXT DEFAULT 'Good',
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_customer ON devices(customer_id);

-- ============================================================
-- REPAIR ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS repair_orders (
    id TEXT PRIMARY KEY,
    repair_id TEXT,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
    issue_description TEXT,
    selected_issues JSONB DEFAULT '[]'::jsonb,
    estimated_cost NUMERIC,
    final_cost NUMERIC,
    technician_notes TEXT DEFAULT '',
    repair_status TEXT DEFAULT 'Received',
    repair_images JSONB DEFAULT '[]'::jsonb,
    assigned_technician_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    warranty_expires_at TIMESTAMP,
    expected_delivery_date TIMESTAMP,
    on_hold INTEGER DEFAULT 0,
    hold_reason TEXT DEFAULT '',
    diagnosis_details TEXT DEFAULT '',
    customer_notes TEXT DEFAULT '',
    cancel_requested INTEGER DEFAULT 0,
    cancel_reason TEXT DEFAULT '',
    cancel_approved INTEGER DEFAULT 0,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE repair_orders DROP CONSTRAINT IF EXISTS repair_orders_repair_status_check;
ALTER TABLE repair_orders ADD CONSTRAINT repair_orders_repair_status_check
    CHECK (repair_status IN (
        'Received', 'Under Review', 'Diagnosis Complete',
        'Awaiting Approval', 'Approved', 'Repair Started',
        'Parts Ordered', 'Repair Completed', 'Ready For Pickup',
        'Delivered', 'Cancelled'
    ));

CREATE INDEX IF NOT EXISTS idx_repair_orders_customer ON repair_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_device ON repair_orders(device_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(repair_status);

-- ============================================================
-- ORDERS (E-commerce)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    products JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    coupon_code TEXT DEFAULT '',
    coupon_discount NUMERIC DEFAULT 0,
    payment_info JSONB DEFAULT '{}'::jsonb,
    payment_status TEXT DEFAULT 'Pending',
    order_status TEXT DEFAULT 'Pending',
    shipping_address JSONB DEFAULT '{}'::jsonb,
    cancel_requested INTEGER DEFAULT 0,
    cancel_reason TEXT DEFAULT '',
    cancel_approved INTEGER DEFAULT 0,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    repair_order_id TEXT REFERENCES repair_orders(id) ON DELETE SET NULL,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    date TIMESTAMP,
    due_date TIMESTAMP,
    status TEXT DEFAULT 'Pending',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    cgst NUMERIC DEFAULT 0,
    sgst NUMERIC DEFAULT 0,
    service_charge NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    payment_instructions TEXT DEFAULT 'System Generated Invoice',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_repair_order ON invoices(repair_order_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    type TEXT DEFAULT 'general',
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    discount_type TEXT,
    discount_value NUMERIC DEFAULT 0,
    min_purchase NUMERIC DEFAULT 0,
    max_discount NUMERIC DEFAULT 0,
    description TEXT DEFAULT '',
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    usage_limit INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    applicable_products JSONB DEFAULT '[]'::jsonb,
    applicable_categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    stock_available NUMERIC DEFAULT 0,
    low_stock_limit NUMERIC DEFAULT 5,
    supplier_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);

-- ============================================================
-- PAGE VISITS (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_visits (
    id TEXT PRIMARY KEY,
    page TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEARCH QUERIES (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS search_queries (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    query TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    user_name TEXT DEFAULT 'Unknown',
    user_email TEXT DEFAULT '',
    user_role TEXT DEFAULT 'guest',
    action TEXT NOT NULL,
    resource_type TEXT DEFAULT 'general',
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    phone_number TEXT,
    source TEXT DEFAULT 'web',
    messages JSONB DEFAULT '[]'::jsonb,
    context JSONB DEFAULT '{}'::jsonb,
    is_resolved INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- ============================================================
-- SETTINGS (Key-value configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- VISITORS (Analytics tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    visitor_id TEXT UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT,
    screen_resolution TEXT,
    language TEXT,
    timezone TEXT,
    referrer TEXT,
    pages_visited JSONB DEFAULT '[]'::jsonb,
    consent_given INTEGER DEFAULT 0,
    visit_count INTEGER DEFAULT 1,
    first_visit TIMESTAMP,
    last_visit TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_modtime BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repair_orders_modtime BEFORE UPDATE ON repair_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_modtime BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_modtime BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_modtime BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitors_modtime BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
