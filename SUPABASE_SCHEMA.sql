-- Graphix Phone Repair Ticketing System Database Schema
-- Copy and paste this into Supabase SQL Editor

-- Drop existing tables if they exist (clean rebuild)
DROP TABLE IF EXISTS parts_pricing CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table (for login)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'technician' CHECK (role IN ('admin', 'technician')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Technicians Table
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Parts Table
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('battery', 'charging_board', 'charging_pin', 'screen', 'camera', 'speaker', 'other')),
  device_type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Parts Pricing Table (only admins can edit)
CREATE TABLE parts_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  device_type VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tickets Table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(10) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  device_type VARCHAR(255) NOT NULL,
  device_model VARCHAR(100),
  issue_description TEXT NOT NULL,
  assigned_technician VARCHAR(255),
  status VARCHAR(50) DEFAULT 'diagnosing' CHECK (status IN ('diagnosing', 'repairing', 'repaired', 'received', 'cancelled')),
  notes TEXT DEFAULT '',
  cost_estimate DECIMAL(10, 2),
  parts JSON,
  total_parts_cost DECIMAL(10, 2),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'gcash', 'maya', 'bank_transfer')),
  received_by VARCHAR(255),
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE
);

-- Create Parts Orders Table (technicians request, admins review)
CREATE TABLE parts_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100) NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  admin_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Users (Admin and Technicians)
INSERT INTO users (email, password, name, role, active) VALUES
('admin@graphix', 'graphix1', 'Admin', 'admin', true),
('jefford@graphix', 'graphix1', 'Jefford Calvo', 'technician', true),
('jhondel@graphix', 'graphix1', 'Jhondel Virtudazo', 'technician', true),
('mark@graphix', 'graphix1', 'Mark Saludares', 'technician', true)
ON CONFLICT DO NOTHING;

-- Insert Technicians linked to Users
INSERT INTO technicians (user_id, name, active)
SELECT id, name, active FROM users WHERE role = 'technician'
ON CONFLICT DO NOTHING;

-- Insert Common Parts for iPhones
INSERT INTO parts (name, category, device_type, description) VALUES
('iPhone Battery', 'battery', 'iPhone', 'Replacement battery for iPhone'),
('iPhone Charging Board', 'charging_board', 'iPhone', 'USB charging port assembly'),
('iPhone Charging Pin', 'charging_pin', 'iPhone', 'Lightning charging pin'),
('iPhone Screen', 'screen', 'iPhone', 'LCD or OLED display'),
('iPhone Camera', 'camera', 'iPhone', 'Rear camera module'),
('iPhone Speaker', 'speaker', 'iPhone', 'Speaker assembly')
ON CONFLICT DO NOTHING;

-- Insert Common Parts for Android
INSERT INTO parts (name, category, device_type, description) VALUES
('Android Battery', 'battery', 'Android', 'Replacement battery for Android phones'),
('Android Charging Board', 'charging_board', 'Android', 'USB-C/Type-C charging port'),
('Android Charging Pin', 'charging_pin', 'Android', 'Charging connector pins'),
('Android Screen', 'screen', 'Android', 'LCD or AMOLED display'),
('Android Camera', 'camera', 'Android', 'Rear camera module'),
('Android Speaker', 'speaker', 'Android', 'Speaker assembly')
ON CONFLICT DO NOTHING;

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_technician ON tickets(assigned_technician);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_device_type ON parts(device_type);
CREATE INDEX IF NOT EXISTS idx_parts_orders_status ON parts_orders(status);
CREATE INDEX IF NOT EXISTS idx_parts_orders_requested_by ON parts_orders(requested_by);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_read_users" ON users;
DROP POLICY IF EXISTS "allow_all_insert_users" ON users;
DROP POLICY IF EXISTS "allow_all_read_technicians" ON technicians;
DROP POLICY IF EXISTS "allow_all_read_tickets" ON tickets;
DROP POLICY IF EXISTS "allow_all_insert_tickets" ON tickets;
DROP POLICY IF EXISTS "allow_all_update_tickets" ON tickets;
DROP POLICY IF EXISTS "allow_all_delete_tickets" ON tickets;
DROP POLICY IF EXISTS "allow_all_read_parts" ON parts;
DROP POLICY IF EXISTS "allow_all_read_parts_pricing" ON parts_pricing;
DROP POLICY IF EXISTS "allow_admin_write_parts_pricing" ON parts_pricing;
DROP POLICY IF EXISTS "allow_admin_delete_parts_pricing" ON parts_pricing;
DROP POLICY IF EXISTS "allow_all_read_parts_orders" ON parts_orders;
DROP POLICY IF EXISTS "allow_all_insert_parts_orders" ON parts_orders;
DROP POLICY IF EXISTS "allow_all_update_parts_orders" ON parts_orders;
DROP POLICY IF EXISTS "allow_all_delete_parts_orders" ON parts_orders;

-- Create policies for open access (adjust for production)
CREATE POLICY "allow_all_read_users" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_read_technicians" ON technicians FOR SELECT USING (true);
CREATE POLICY "allow_all_read_tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_tickets" ON tickets FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete_tickets" ON tickets FOR DELETE USING (true);
CREATE POLICY "allow_all_read_parts" ON parts FOR SELECT USING (true);
CREATE POLICY "allow_all_read_parts_pricing" ON parts_pricing FOR SELECT USING (true);
CREATE POLICY "allow_admin_write_parts_pricing" ON parts_pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_admin_delete_parts_pricing" ON parts_pricing FOR DELETE USING (true);
CREATE POLICY "allow_all_read_parts_orders" ON parts_orders FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_parts_orders" ON parts_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_parts_orders" ON parts_orders FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete_parts_orders" ON parts_orders FOR DELETE USING (true);

-- Insert Sample Parts Pricing for iPhone (get admin user ID for created_by)
WITH admin_user AS (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
INSERT INTO parts_pricing (part_id, price, device_type, created_by)
SELECT p.id, 
  CASE p.category
    WHEN 'battery' THEN 1500
    WHEN 'charging_board' THEN 3500
    WHEN 'charging_pin' THEN 500
    WHEN 'screen' THEN 8500
    WHEN 'camera' THEN 4500
    WHEN 'speaker' THEN 2000
  END as price,
  'iPhone',
  (SELECT id FROM admin_user)
FROM parts p
WHERE p.device_type = 'iPhone'
ON CONFLICT DO NOTHING;

-- Insert Sample Parts Pricing for Android
WITH admin_user AS (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
INSERT INTO parts_pricing (part_id, price, device_type, created_by)
SELECT p.id,
  CASE p.category
    WHEN 'battery' THEN 1200
    WHEN 'charging_board' THEN 3000
    WHEN 'charging_pin' THEN 400
    WHEN 'screen' THEN 7500
    WHEN 'camera' THEN 4000
    WHEN 'speaker' THEN 1800
  END as price,
  'Android',
  (SELECT id FROM admin_user)
FROM parts p
WHERE p.device_type = 'Android'
ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRATION: Run this on EXISTING databases to add missing columns/tables
-- ============================================================
-- If your live Supabase DB was created before these updates,
-- run these statements in the Supabase SQL Editor:
--
-- Add received_by and target_completion_date to tickets:
-- ALTER TABLE tickets ADD COLUMN IF NOT EXISTS received_by VARCHAR(255);
-- ALTER TABLE tickets ADD COLUMN IF NOT EXISTS target_completion_date DATE;
--
-- Update status constraint to new workflow:
-- ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
-- ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (status IN ('diagnosing', 'repairing', 'repaired', 'received', 'cancelled'));
--
-- Create parts_orders table:
-- CREATE TABLE IF NOT EXISTS parts_orders (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   part_name VARCHAR(255) NOT NULL,
--   device_type VARCHAR(100) NOT NULL,
--   requested_by VARCHAR(255) NOT NULL,
--   quantity INTEGER NOT NULL DEFAULT 1,
--   notes TEXT,
--   admin_notes TEXT,
--   status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
--
-- Enable RLS and policies for parts_orders:
-- ALTER TABLE parts_orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_all_read_parts_orders" ON parts_orders FOR SELECT USING (true);
-- CREATE POLICY "allow_all_insert_parts_orders" ON parts_orders FOR INSERT WITH CHECK (true);
-- CREATE POLICY "allow_all_update_parts_orders" ON parts_orders FOR UPDATE USING (true);
-- CREATE POLICY "allow_all_delete_parts_orders" ON parts_orders FOR DELETE USING (true);
-- ============================================================

