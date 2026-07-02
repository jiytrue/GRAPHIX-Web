-- ============================================================
-- LCD INVENTORY - PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
-- ============================================================

-- Create LCD Inventory Table
CREATE TABLE lcd_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lcd_name VARCHAR(500) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL CHECK (branch IN ('Villanueva', 'Jasaan')),
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LCD Stock Logs Table (audit trail)
CREATE TABLE lcd_stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lcd_inventory_id UUID REFERENCES lcd_inventory(id) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('stock_in', 'stock_out', 'adjustment', 'used_for_repair')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  ticket_id VARCHAR(10),
  notes TEXT,
  changed_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_lcd_inventory_branch ON lcd_inventory(branch);
CREATE INDEX IF NOT EXISTS idx_lcd_inventory_brand ON lcd_inventory(brand);
CREATE INDEX IF NOT EXISTS idx_lcd_inventory_lcd_name ON lcd_inventory(lcd_name);
CREATE INDEX IF NOT EXISTS idx_lcd_stock_logs_inventory_id ON lcd_stock_logs(lcd_inventory_id);
CREATE INDEX IF NOT EXISTS idx_lcd_stock_logs_change_type ON lcd_stock_logs(change_type);
CREATE INDEX IF NOT EXISTS idx_lcd_stock_logs_created_at ON lcd_stock_logs(created_at);

-- Enable RLS
ALTER TABLE lcd_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE lcd_stock_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "allow_all_read_lcd_inventory" ON lcd_inventory FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_lcd_inventory" ON lcd_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update_lcd_inventory" ON lcd_inventory FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete_lcd_inventory" ON lcd_inventory FOR DELETE USING (true);
CREATE POLICY "allow_all_read_lcd_stock_logs" ON lcd_stock_logs FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_lcd_stock_logs" ON lcd_stock_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- VILLANUEVA BRANCH LCD STOCKS
-- ============================================================
INSERT INTO lcd_inventory (lcd_name, brand, branch, quantity) VALUES
('A3s', 'Realme / Oppo', 'Villanueva', 1),
('A5s / A7 / A11k / A12 / AX5s', 'Realme / Oppo', 'Villanueva', 1),
('A52 / A72 / A92', 'Realme / Oppo', 'Villanueva', 1),
('A54s / Oppo A16k / C21y / C25y', 'Realme / Oppo', 'Villanueva', 1),
('A56 OLED', 'Realme / Oppo', 'Villanueva', 1),
('C2 / A1k', 'Realme / Oppo', 'Villanueva', 1),
('C11 / C12 / C15 / Oppo A15 / A15s / Narzo 20 / Narzo 30A', 'Realme / Oppo', 'Villanueva', 1),
('C11 / C25 / A16', 'Realme / Oppo', 'Villanueva', 1),
('C55 / C65 / C67', 'Realme / Oppo', 'Villanueva', 4),
('C61', 'Realme / Oppo', 'Villanueva', 1),
('C65', 'Realme / Oppo', 'Villanueva', 1),
('C75 4g', 'Realme / Oppo', 'Villanueva', 1),
('C75 5g', 'Realme / Oppo', 'Villanueva', 1),
('F15', 'Realme / Oppo', 'Villanueva', 1),
('Narzo 50 4g', 'Realme / Oppo', 'Villanueva', 1),
('Oppo A17k / A17 / A57 / A77 / Realme C33', 'Realme / Oppo', 'Villanueva', 1),
('Oppo A57 / Realme C35', 'Realme / Oppo', 'Villanueva', 1),
('Oppo A58 / A78 4g', 'Realme / Oppo', 'Villanueva', 1),
('Oppo F15 / A91', 'Realme / Oppo', 'Villanueva', 1),
('Oppo Reno 2 (Incell)', 'Realme / Oppo', 'Villanueva', 1),
('Oppo Reno 5 / Reno 6 / Reno 7 Pro / Reno 8 4g / A94 / F19 Pro', 'Realme / Oppo', 'Villanueva', 1),
('Oppo Reno 7', 'Realme / Oppo', 'Villanueva', 1),
('Oppo Reno 8 5g', 'Realme / Oppo', 'Villanueva', 1),
('Realme 7 Pro', 'Realme / Oppo', 'Villanueva', 1),
('Realme 7 X', 'Realme / Oppo', 'Villanueva', 1),
('Realme 7i', 'Realme / Oppo', 'Villanueva', 1),
('Realme 7i / C17 / Oneplus N100 / A32 / A33 / A53 / A53s / A54s / A55 4g / A55 / A94', 'Realme / Oppo', 'Villanueva', 1),
('Realme 8 5g', 'Realme / Oppo', 'Villanueva', 2),
('Realme 8i', 'Realme / Oppo', 'Villanueva', 0),
('Realme 10 T', 'Realme / Oppo', 'Villanueva', 1),
('Realme C1 / Oppo A3s', 'Realme / Oppo', 'Villanueva', 3),
('Realme C21 / C21y / C25 / C25s', 'Realme / Oppo', 'Villanueva', 1),
('Realme C21y', 'Realme / Oppo', 'Villanueva', 1),
('Realme C67', 'Realme / Oppo', 'Villanueva', 1),
('Realme Note 50 / C51 / C53 / Oppo A18 / A38', 'Realme / Oppo', 'Villanueva', 4),
('Redmi Note 10s 4g', 'Realme / Oppo', 'Villanueva', 1),
('Note 10 Pro 4g', 'Realme / Oppo', 'Villanueva', 1),
('Note 11s 4g', 'Realme / Oppo', 'Villanueva', 1),
('Reno 8 OLED', 'Realme / Oppo', 'Villanueva', 1),
('Infinix Hot 12', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Hot 12 Play', 'Infinix / Tecno / Itel', 'Villanueva', 2),
('Infinix Hot 30 / Tecno Spark 10 Pro', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Hot 30 5g / Note 30 4g / Tecno Pova 5', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Hot 30i / Smart 7 HD / Spark 10c', 'Infinix / Tecno / Itel', 'Villanueva', 2),
('Infinix Hot 30i / Tecno Spark 10c', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Hot 40 Pro / Hot 40 / Spark 20 Pro 4g', 'Infinix / Tecno / Itel', 'Villanueva', 4),
('Infinix Hot 50 5g', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Hot 50 Pro+', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Hot 60 Pro', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Note 10 Pro / Note 11 Pro', 'Infinix / Tecno / Itel', 'Villanueva', 3),
('Infinix Note 12', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Note 30 4g 5g / Tecno Spark 20 Pro', 'Infinix / Tecno / Itel', 'Villanueva', 2),
('Infinix Smart 5 / Tecno Spark 6 Go', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Smart 6 (HD / Plus) / Tecno Pop 5 / Pop 6 Pro', 'Infinix / Tecno / Itel', 'Villanueva', 3),
('Infinix Smart 6 / Hot 12i', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Smart 6 / Smart 6 HD / Smart 6 Plus / Tecno Pop 6', 'Infinix / Tecno / Itel', 'Villanueva', 0),
('Infinix Smart 7 / Tecno Pop 7 / Pop 7 Pro', 'Infinix / Tecno / Itel', 'Villanueva', 10),
('Infinix Smart 8', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Infinix Smart 8 / Tecno Pop 8 / Hot 40i / Spark 20 Go', 'Infinix / Tecno / Itel', 'Villanueva', 2),
('Infinix Smart 10 Plus / Hot 60 5g / Smart 10', 'Infinix / Tecno / Itel', 'Villanueva', 4),
('Itel A60 / A60s', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Tecno Camon 30', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Tecno Spark 6 / Hot 10', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('Tecno Spark Go 2021 / 2020', 'Infinix / Tecno / Itel', 'Villanueva', 1),
('A01', 'Samsung', 'Villanueva', 2),
('A02s', 'Samsung', 'Villanueva', 3),
('A04 / A04s', 'Samsung', 'Villanueva', 3),
('A05', 'Samsung', 'Villanueva', 1),
('A05 w/ Frame', 'Samsung', 'Villanueva', 1),
('A07', 'Samsung', 'Villanueva', 1),
('A10', 'Samsung', 'Villanueva', 1),
('A20s', 'Samsung', 'Villanueva', 3),
('A22 4g / M32 4g', 'Samsung', 'Villanueva', 1),
('A22 5g / F42 5g', 'Samsung', 'Villanueva', 1),
('A25 OLED w/ Frame', 'Samsung', 'Villanueva', 1),
('A31 4g', 'Samsung', 'Villanueva', 1),
('A32 / M32 5g', 'Samsung', 'Villanueva', 1),
('A42 w/ Frame', 'Samsung', 'Villanueva', 1),
('A50s w/ Frame', 'Samsung', 'Villanueva', 1),
('A51 4g', 'Samsung', 'Villanueva', 1),
('A51 Incell', 'Samsung', 'Villanueva', 1),
('A51 OLED w/ Frame', 'Samsung', 'Villanueva', 1),
('A52 Incell', 'Samsung', 'Villanueva', 1),
('A53 Incell w/ Frame', 'Samsung', 'Villanueva', 1),
('A71 Incell w/ Frame', 'Samsung', 'Villanueva', 1),
('A71 OLED w/ Frame', 'Samsung', 'Villanueva', 1),
('J5', 'Samsung', 'Villanueva', 1),
('J6 2018', 'Samsung', 'Villanueva', 1),
('J7 Prime', 'Samsung', 'Villanueva', 1),
('M20', 'Samsung', 'Villanueva', 1),
('M33 5g / A33 5g', 'Samsung', 'Villanueva', 1),
('V5 / V5s / Y67 / Y66', 'Vivo', 'Villanueva', 1),
('V20 / V20 2021 / V20 SE', 'Vivo', 'Villanueva', 1),
('V23 5g / V23 Pro 5g / S12 / S12 Pro', 'Vivo', 'Villanueva', 1),
('Y02', 'Vivo', 'Villanueva', 1),
('Y03', 'Vivo', 'Villanueva', 1),
('Y12 / Y15 / Y17', 'Vivo', 'Villanueva', 1),
('Y17 / Y12 / Y15 / Y11 (2019) / Y3', 'Vivo', 'Villanueva', 1),
('Y20 / Y20i / Y20s / Y20s G / Y20T / Y21 / Y21s / Y21a / Y21e / Y15s / Y15a / Y01 / Y16 / Y02s / Y17s / Y33s', 'Vivo', 'Villanueva', 4),
('Y28 4g / Y38 5g / Y18 / Y18e / Y03', 'Vivo', 'Villanueva', 1),
('Y30 / Y30i', 'Vivo', 'Villanueva', 1),
('Y35 2022 (4g) / Y56 5g / Y55s 5g / Y77 5g / Y72t / Y73t / Y77e / Y55 5g / Y27 5g / Y27s / Y36 5g / T1 5g / T2x 5g / iQOO Z6x / iQOO Z6 5g', 'Vivo', 'Villanueva', 1),
('Y51 / V3', 'Vivo', 'Villanueva', 1),
('Y91 / Y91i / Y93 / Y95', 'Vivo', 'Villanueva', 1),
('Wiko T10', 'Wiko', 'Villanueva', 1);

-- ============================================================
-- JASAAN BRANCH LCD STOCKS
-- ============================================================
INSERT INTO lcd_inventory (lcd_name, brand, branch, quantity) VALUES
('Smart 10', 'Infinix / Tecno / Itel', 'Jasaan', 0),
('Smart 7', 'Infinix / Tecno / Itel', 'Jasaan', 6),
('Hot 50i', 'Infinix / Tecno / Itel', 'Jasaan', 4),
('Smart 9', 'Infinix / Tecno / Itel', 'Jasaan', 1),
('Hot 30i', 'Infinix / Tecno / Itel', 'Jasaan', 1),
('Hot 10', 'Infinix / Tecno / Itel', 'Jasaan', 1),
('Spark Go 1/2', 'Infinix / Tecno / Itel', 'Jasaan', 1),
('Spark 8P', 'Infinix / Tecno / Itel', 'Jasaan', 1),
('C35', 'Realme / Oppo', 'Jasaan', 3),
('C11 (2021)', 'Realme / Oppo', 'Jasaan', 5),
('C21Y', 'Realme / Oppo', 'Jasaan', 3),
('C11 (2020)', 'Realme / Oppo', 'Jasaan', 5),
('C55', 'Realme / Oppo', 'Jasaan', 1),
('C65', 'Realme / Oppo', 'Jasaan', 2),
('7i', 'Realme / Oppo', 'Jasaan', 1),
('C3', 'Realme / Oppo', 'Jasaan', 1),
('Note 50', 'Realme / Oppo', 'Jasaan', 1),
('C61', 'Realme / Oppo', 'Jasaan', 1),
('C51', 'Realme / Oppo', 'Jasaan', 1),
('A57 4G', 'Realme / Oppo', 'Jasaan', 2),
('A3X', 'Realme / Oppo', 'Jasaan', 1),
('F9', 'Realme / Oppo', 'Jasaan', 1),
('A12', 'Realme / Oppo', 'Jasaan', 1),
('A16', 'Realme / Oppo', 'Jasaan', 1),
('A02S', 'Samsung', 'Jasaan', 1),
('A03S', 'Samsung', 'Jasaan', 1),
('A06 4G', 'Samsung', 'Jasaan', 1),
('A24', 'Samsung', 'Jasaan', 1),
('A04', 'Samsung', 'Jasaan', 1),
('A11', 'Samsung', 'Jasaan', 1),
('A10', 'Samsung', 'Jasaan', 4),
('A23 4G', 'Samsung', 'Jasaan', 1),
('A06 5G', 'Samsung', 'Jasaan', 1),
('Y20', 'Vivo', 'Jasaan', 1),
('Y17', 'Vivo', 'Jasaan', 1),
('Y33S', 'Vivo', 'Jasaan', 1),
('Honor 90 Lite', 'Huawei / Honor', 'Jasaan', 1),
('Poco X4 Pro 5G', 'Redmi / Poco', 'Jasaan', 1),
('Poco M3', 'Redmi / Poco', 'Jasaan', 1),
('Redmi Note 10 Pro', 'Redmi / Poco', 'Jasaan', 1),
('Redmi 8', 'Redmi / Poco', 'Jasaan', 1),
('Redmi 15C', 'Redmi / Poco', 'Jasaan', 1),
('Redmi 13C', 'Redmi / Poco', 'Jasaan', 1),
('Wiko T10', 'Wiko', 'Jasaan', 1),
('iPhone 11 LCD', 'iPhone', 'Jasaan', 2),
('iPhone 11 Battery', 'iPhone', 'Jasaan', 1);
