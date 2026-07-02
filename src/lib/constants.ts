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
