-- PostgreSQL Database Schema for Shree Renukamba Communication
-- Complete database schema for the e-commerce + repair platform

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    address JSONB DEFAULT '{}'::jsonb,
    security_questions JSONB DEFAULT '[]'::jsonb,
    profile_image TEXT DEFAULT '',
    otp TEXT,
    otp_expires TIMESTAMP,
    password_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loyalty_points NUMERIC DEFAULT 0,
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
    product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
    stock NUMERIC DEFAULT 0,
    price NUMERIC NOT NULL,
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
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
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
    repair_id TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
    issue_description TEXT NOT NULL,
    selected_issues JSONB DEFAULT '[]'::jsonb,
    estimated_cost NUMERIC,
    final_cost NUMERIC,
    technician_notes TEXT DEFAULT '',
    repair_status TEXT DEFAULT 'Received',
    repair_images JSONB DEFAULT '[]'::jsonb,
    assigned_technician_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    warranty_expires_at TIMESTAMP,
    expected_delivery_date TIMESTAMP,
    on_hold BOOLEAN DEFAULT FALSE,
    hold_reason TEXT DEFAULT '',
    diagnosis_details TEXT DEFAULT '',
    customer_notes TEXT DEFAULT '',
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
    order_id TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    products JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL,
    payment_info JSONB DEFAULT '{}'::jsonb,
    payment_status TEXT DEFAULT 'Pending',
    order_status TEXT DEFAULT 'Processing',
    shipping_address JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    repair_order_id TEXT REFERENCES repair_orders(id) ON DELETE SET NULL,
    date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'Pending',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL,
    cgst NUMERIC DEFAULT 0,
    sgst NUMERIC DEFAULT 0,
    service_charge NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    payment_instructions TEXT DEFAULT 'System Generated Invoice - No signature required',
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
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
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
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    min_purchase NUMERIC DEFAULT 0,
    max_discount NUMERIC DEFAULT 0,
    description TEXT DEFAULT '',
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit NUMERIC DEFAULT 0,
    used_count NUMERIC DEFAULT 0,
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
    page TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEARCH QUERIES (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS search_queries (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
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
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    phone_number TEXT,
    source TEXT DEFAULT 'web',
    messages JSONB DEFAULT '[]'::jsonb,
    context JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

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
