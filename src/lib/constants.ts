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
  role: 'admin' | 'technician'
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
