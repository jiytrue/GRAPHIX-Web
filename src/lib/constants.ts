// Device types - simplified categories
export const DEVICE_TYPES: Record<string, string> = {
  'iOS': 'iOS',
  'Android': 'Android',
  'Tab': 'Tablet',
  'iPad': 'iPad',
  'Mac': 'Mac',
}

export const PART_CATEGORIES = [
  { value: 'battery', label: 'Battery' },
  { value: 'charging_board', label: 'Charging Board/Port' },
  { value: 'charging_pin', label: 'Charging Pins' },
  { value: 'screen', label: 'Screen/Display' },
  { value: 'camera', label: 'Camera' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'other', label: 'Other' }
]

export type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'technician' | 'worker'
  active: boolean
}

export type Part = {
  id: string
  name: string
  category: string
  device_type: string
  description: string
  created_at: string
}

export type PartsPricing = {
  id: string
  part_id: string
  price: number
  device_type: string
  created_by: string
  updated_at: string
}

export type PartsOrder = {
  id: string
  part_id: string
  requested_by: string
  quantity: number
  notes: string
  status: 'pending' | 'ordered' | 'received' | 'cancelled'
  created_at: string
  updated_at: string
}

// LCD Inventory types
export type LcdInventoryItem = {
  id: string
  lcd_name: string
  brand: string
  branch: string
  quantity: number
  created_at: string
  updated_at: string
}

export type LcdStockLog = {
  id: string
  lcd_inventory_id: string
  change_type: 'stock_in' | 'stock_out' | 'adjustment' | 'used_for_repair'
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  ticket_id?: string
  notes?: string
  changed_by?: string
  created_at: string
}

export const LCD_BRANDS = [
  'Realme / Oppo',
  'Infinix / Tecno / Itel',
  'Samsung',
  'Vivo',
  'Huawei / Honor',
  'Redmi / Poco',
  'iPhone',
  'Wiko',
]

export const LCD_BRANCHES = ['Villanueva', 'Jasaan']

// ============================================================
// PHONE BRANDS for Ticket Creation Wizard
// ============================================================
export interface PhoneBrand {
  name: string
  color: string      // Background gradient color
  textColor: string  // Text/icon color
  letter: string     // Display letter/emoji for logo
}

export const PHONE_BRANDS: PhoneBrand[] = [
  { name: 'Samsung', color: '#1428A0', textColor: '#ffffff', letter: 'S' },
  { name: 'iPhone', color: '#333333', textColor: '#ffffff', letter: '' },
  { name: 'Realme', color: '#F5C900', textColor: '#000000', letter: 'R' },
  { name: 'Oppo', color: '#1D8348', textColor: '#ffffff', letter: 'O' },
  { name: 'Vivo', color: '#415FFF', textColor: '#ffffff', letter: 'V' },
  { name: 'Infinix', color: '#F47920', textColor: '#ffffff', letter: 'X' },
  { name: 'Tecno', color: '#0098DB', textColor: '#ffffff', letter: 'T' },
  { name: 'Redmi', color: '#FF6900', textColor: '#ffffff', letter: 'R' },
  { name: 'Xiaomi', color: '#FF6700', textColor: '#ffffff', letter: 'Mi' },
  { name: 'Huawei', color: '#CF0A2C', textColor: '#ffffff', letter: 'H' },
  { name: 'Poco', color: '#F5C518', textColor: '#000000', letter: 'P' },
  { name: 'Itel', color: '#E31E24', textColor: '#ffffff', letter: 'i' },
  { name: 'Honor', color: '#00A4EF', textColor: '#ffffff', letter: 'Hr' },
  { name: 'Wiko', color: '#00BCD4', textColor: '#ffffff', letter: 'W' },
  { name: 'Other', color: '#6B7280', textColor: '#ffffff', letter: '?' },
]

// ============================================================
// BRAND MODELS — Common models for each brand
// ============================================================
export const BRAND_MODELS: Record<string, string[]> = {
  'Samsung': [
    'Galaxy A01', 'Galaxy A02s', 'Galaxy A03', 'Galaxy A04', 'Galaxy A04s', 'Galaxy A05', 'Galaxy A05s',
    'Galaxy A06', 'Galaxy A07', 'Galaxy A10', 'Galaxy A10s', 'Galaxy A11', 'Galaxy A12', 'Galaxy A13',
    'Galaxy A14', 'Galaxy A15', 'Galaxy A20', 'Galaxy A20s', 'Galaxy A21s', 'Galaxy A22', 'Galaxy A23',
    'Galaxy A24', 'Galaxy A25', 'Galaxy A30', 'Galaxy A30s', 'Galaxy A31', 'Galaxy A32', 'Galaxy A33',
    'Galaxy A34', 'Galaxy A50', 'Galaxy A50s', 'Galaxy A51', 'Galaxy A52', 'Galaxy A52s', 'Galaxy A53',
    'Galaxy A54', 'Galaxy A55', 'Galaxy A71', 'Galaxy A72', 'Galaxy A73',
    'Galaxy S21', 'Galaxy S21+', 'Galaxy S21 Ultra', 'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra',
    'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra', 'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra',
    'Galaxy J2', 'Galaxy J5', 'Galaxy J6', 'Galaxy J7', 'Galaxy J7 Prime',
    'Galaxy M20', 'Galaxy M32', 'Galaxy M33',
  ],
  'iPhone': [
    'iPhone 6', 'iPhone 6 Plus', 'iPhone 6s', 'iPhone 6s Plus',
    'iPhone 7', 'iPhone 7 Plus', 'iPhone 8', 'iPhone 8 Plus',
    'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max',
    'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
    'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
    'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
    'iPhone SE (2nd Gen)', 'iPhone SE (3rd Gen)',
  ],
  'Realme': [
    'Realme C1', 'Realme C2', 'Realme C3', 'Realme C11', 'Realme C11 2021', 'Realme C12',
    'Realme C15', 'Realme C17', 'Realme C21', 'Realme C21Y', 'Realme C25', 'Realme C25s',
    'Realme C30', 'Realme C31', 'Realme C33', 'Realme C35', 'Realme C51', 'Realme C53',
    'Realme C55', 'Realme C61', 'Realme C65', 'Realme C67', 'Realme C75',
    'Realme 5', 'Realme 5 Pro', 'Realme 6', 'Realme 7', 'Realme 7 Pro', 'Realme 7i',
    'Realme 8', 'Realme 8 5G', 'Realme 8i', 'Realme 8 Pro', 'Realme 9', 'Realme 9 Pro',
    'Realme 10', 'Realme 10 Pro', 'Realme Note 50',
    'Narzo 20', 'Narzo 30A', 'Narzo 50', 'Narzo 50A',
  ],
  'Oppo': [
    'Oppo A3s', 'Oppo A5s', 'Oppo A7', 'Oppo A11k', 'Oppo A12', 'Oppo A15', 'Oppo A15s',
    'Oppo A16', 'Oppo A16k', 'Oppo A17', 'Oppo A17k', 'Oppo A18', 'Oppo A32', 'Oppo A33',
    'Oppo A38', 'Oppo A52', 'Oppo A53', 'Oppo A53s', 'Oppo A54', 'Oppo A54s', 'Oppo A55',
    'Oppo A57', 'Oppo A58', 'Oppo A72', 'Oppo A77', 'Oppo A78', 'Oppo A91', 'Oppo A92', 'Oppo A94',
    'Oppo A3X',
    'Oppo F9', 'Oppo F15', 'Oppo F19 Pro',
    'Oppo Reno 2', 'Oppo Reno 5', 'Oppo Reno 6', 'Oppo Reno 7', 'Oppo Reno 7 Pro',
    'Oppo Reno 8', 'Oppo Reno 8 5G',
  ],
  'Vivo': [
    'Vivo V5', 'Vivo V5s', 'Vivo V20', 'Vivo V20 SE', 'Vivo V23 5G', 'Vivo V23 Pro',
    'Vivo Y01', 'Vivo Y02', 'Vivo Y02s', 'Vivo Y03', 'Vivo Y11', 'Vivo Y12', 'Vivo Y15',
    'Vivo Y15s', 'Vivo Y15a', 'Vivo Y16', 'Vivo Y17', 'Vivo Y17s', 'Vivo Y18',
    'Vivo Y20', 'Vivo Y20i', 'Vivo Y20s', 'Vivo Y21', 'Vivo Y21s', 'Vivo Y21a',
    'Vivo Y28', 'Vivo Y30', 'Vivo Y33s', 'Vivo Y35', 'Vivo Y36', 'Vivo Y38',
    'Vivo Y51', 'Vivo Y55s', 'Vivo Y56', 'Vivo Y66', 'Vivo Y67',
    'Vivo Y91', 'Vivo Y91i', 'Vivo Y93', 'Vivo Y95',
    'Vivo V3',
  ],
  'Infinix': [
    'Infinix Hot 10', 'Infinix Hot 11', 'Infinix Hot 12', 'Infinix Hot 12 Play', 'Infinix Hot 12i',
    'Infinix Hot 20', 'Infinix Hot 30', 'Infinix Hot 30 5G', 'Infinix Hot 30i',
    'Infinix Hot 40', 'Infinix Hot 40 Pro', 'Infinix Hot 50', 'Infinix Hot 50 Pro+',
    'Infinix Hot 50i', 'Infinix Hot 60 Pro', 'Infinix Hot 60 5G',
    'Infinix Smart 5', 'Infinix Smart 6', 'Infinix Smart 6 HD', 'Infinix Smart 6 Plus',
    'Infinix Smart 7', 'Infinix Smart 7 HD', 'Infinix Smart 8', 'Infinix Smart 9', 'Infinix Smart 10',
    'Infinix Smart 10 Plus',
    'Infinix Note 10 Pro', 'Infinix Note 11 Pro', 'Infinix Note 12', 'Infinix Note 30',
    'Infinix Spark 20 Pro',
  ],
  'Tecno': [
    'Tecno Spark 6', 'Tecno Spark 6 Go', 'Tecno Spark 8P', 'Tecno Spark 10', 'Tecno Spark 10 Pro',
    'Tecno Spark 10c', 'Tecno Spark 20', 'Tecno Spark 20 Pro', 'Tecno Spark Go 2020',
    'Tecno Spark Go 2021', 'Tecno Spark Go 1', 'Tecno Spark Go 2',
    'Tecno Pop 5', 'Tecno Pop 6', 'Tecno Pop 6 Pro', 'Tecno Pop 7', 'Tecno Pop 7 Pro', 'Tecno Pop 8',
    'Tecno Pova 5', 'Tecno Camon 30',
  ],
  'Redmi': [
    'Redmi 8', 'Redmi 9', 'Redmi 9A', 'Redmi 9C', 'Redmi 9T', 'Redmi 10', 'Redmi 10C',
    'Redmi 12', 'Redmi 12C', 'Redmi 13C', 'Redmi 14C', 'Redmi 15C',
    'Redmi Note 8', 'Redmi Note 9', 'Redmi Note 9 Pro', 'Redmi Note 10', 'Redmi Note 10 Pro',
    'Redmi Note 10s', 'Redmi Note 11', 'Redmi Note 11 Pro', 'Redmi Note 11s',
    'Redmi Note 12', 'Redmi Note 12 Pro', 'Redmi Note 13', 'Redmi Note 13 Pro',
  ],
  'Xiaomi': [
    'Xiaomi 11T', 'Xiaomi 11T Pro', 'Xiaomi 12', 'Xiaomi 12 Pro', 'Xiaomi 13', 'Xiaomi 13 Pro',
    'Xiaomi 14', 'Xiaomi 14 Pro',
  ],
  'Huawei': [
    'Huawei Y5', 'Huawei Y6', 'Huawei Y7', 'Huawei Y7a', 'Huawei Y9', 'Huawei Y9 Prime',
    'Huawei Nova 3i', 'Huawei Nova 5T', 'Huawei Nova 7i', 'Huawei Nova 7 SE',
    'Huawei P20 Lite', 'Huawei P30 Lite', 'Huawei P30 Pro',
  ],
  'Poco': [
    'Poco M3', 'Poco M4 Pro', 'Poco M5', 'Poco M5s',
    'Poco X3', 'Poco X3 Pro', 'Poco X4 Pro 5G', 'Poco X5', 'Poco X5 Pro',
    'Poco F3', 'Poco F4', 'Poco F5',
    'Poco C40', 'Poco C55',
  ],
  'Itel': [
    'Itel A14', 'Itel A16', 'Itel A25', 'Itel A48', 'Itel A49',
    'Itel A58', 'Itel A60', 'Itel A60s', 'Itel A70',
    'Itel P40', 'Itel S23', 'Itel S24',
  ],
  'Honor': [
    'Honor 8X', 'Honor 9X', 'Honor 10 Lite', 'Honor 20', 'Honor 50',
    'Honor 70', 'Honor 90', 'Honor 90 Lite',
    'Honor X6', 'Honor X7', 'Honor X8', 'Honor X9',
  ],
  'Wiko': [
    'Wiko T10', 'Wiko T50', 'Wiko Power U10', 'Wiko Power U20',
    'Wiko View 4', 'Wiko View 5',
  ],
  'Other': [],
}

// ============================================================
// REPAIR TYPES for Ticket Creation Wizard
// ============================================================
export interface RepairType {
  id: string
  name: string
  icon: string  // Lucide icon name
  color: string // Accent color for the icon
}

export const REPAIR_TYPES: RepairType[] = [
  { id: 'screen_repair', name: 'Screen Repair', icon: 'Smartphone', color: '#3B82F6' },
  { id: 'lcd_replacement', name: 'LCD Replacement', icon: 'Monitor', color: '#8B5CF6' },
  { id: 'touchscreen_issue', name: 'Touchscreen Issue', icon: 'Hand', color: '#EC4899' },
  { id: 'cracked_screen', name: 'Cracked Screen', icon: 'ShieldAlert', color: '#EF4444' },
  { id: 'battery_replacement', name: 'Battery Replacement', icon: 'BatteryCharging', color: '#22C55E' },
  { id: 'charging_problem', name: 'Charging Problem', icon: 'PlugZap', color: '#F59E0B' },
  { id: 'charging_port', name: 'Charging Port', icon: 'Plug', color: '#F97316' },
  { id: 'not_turning_on', name: 'Not Turning On', icon: 'Power', color: '#DC2626' },
  { id: 'speaker_issue', name: 'Speaker Issue', icon: 'Volume2', color: '#6366F1' },
  { id: 'earpiece_issue', name: 'Earpiece Issue', icon: 'Headphones', color: '#8B5CF6' },
  { id: 'microphone_issue', name: 'Microphone Issue', icon: 'Mic', color: '#14B8A6' },
  { id: 'back_camera', name: 'Back Camera', icon: 'Camera', color: '#0EA5E9' },
  { id: 'front_camera', name: 'Front Camera', icon: 'SwitchCamera', color: '#06B6D4' },
  { id: 'signal_issue', name: 'Signal / No Service', icon: 'SignalZero', color: '#F43F5E' },
  { id: 'wifi_issue', name: 'WiFi Issue', icon: 'Wifi', color: '#3B82F6' },
  { id: 'bluetooth_issue', name: 'Bluetooth Issue', icon: 'Bluetooth', color: '#2563EB' },
  { id: 'back_glass', name: 'Back Glass / Housing', icon: 'Layers', color: '#78716C' },
  { id: 'dead_boot', name: 'Dead Boot / Bootloop', icon: 'RotateCcw', color: '#B91C1C' },
  { id: 'water_damage', name: 'Water Damage', icon: 'Droplets', color: '#0284C7' },
  { id: 'frp_google_lock', name: 'FRP / Google Lock', icon: 'Lock', color: '#D97706' },
  { id: 'software_update', name: 'Software Update / Fix', icon: 'Download', color: '#059669' },
  { id: 'virus_malware', name: 'Virus / Malware', icon: 'Bug', color: '#7C3AED' },
  { id: 'others', name: 'Others', icon: 'MoreHorizontal', color: '#6B7280' },
]
