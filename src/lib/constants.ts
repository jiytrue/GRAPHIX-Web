// Device types with models - comprehensive list
export const DEVICE_TYPES = {
  iPhone: [
    'iPhone 6', 'iPhone 6 Plus',
    'iPhone 6s', 'iPhone 6s Plus',
    'iPhone 7', 'iPhone 7 Plus',
    'iPhone 8', 'iPhone 8 Plus',
    'iPhone X',
    'iPhone XS', 'iPhone XS Max', 'iPhone XR',
    'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
    'iPhone 12', 'iPhone 12 mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
    'iPhone 13', 'iPhone 13 mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
    'iPhone 17', 'iPhone 17 Plus', 'iPhone 17 Pro', 'iPhone 17 Pro Max'
  ],
  Samsung: [
    'Samsung Galaxy S21', 'Samsung Galaxy S21+', 'Samsung Galaxy S21 Ultra',
    'Samsung Galaxy S22', 'Samsung Galaxy S22+', 'Samsung Galaxy S22 Ultra',
    'Samsung Galaxy S23', 'Samsung Galaxy S23+', 'Samsung Galaxy S23 Ultra',
    'Samsung Galaxy S24', 'Samsung Galaxy S24+', 'Samsung Galaxy S24 Ultra',
    'Samsung Galaxy A Series', 'Samsung Galaxy M Series', 'Samsung Galaxy Note series'
  ],
  Tecno: [
    'Tecno Spark 10', 'Tecno Spark 10 Pro',
    'Tecno Phantom X2', 'Tecno Phantom X2 Pro',
    'Tecno Pova 5', 'Tecno Pova 5 Pro',
    'Tecno Camon 20', 'Tecno Camon 20 Pro',
    'Tecno Pop 7', 'Tecno Pop 8'
  ],
  Infinix: [
    'Infinix Hot 30', 'Infinix Hot 30i',
    'Infinix Note 30', 'Infinix Note 30 Pro',
    'Infinix Zero Ultra', 'Infinix Zero 30',
    'Infinix Smart 8', 'Infinix Smart 7'
  ],
  Realme: [
    'Realme 12', 'Realme 12 Pro',
    'Realme 11', 'Realme 11 Pro',
    'Realme 10', 'Realme 10 Pro',
    'Realme GT', 'Realme GT 2',
    'Realme C Series'
  ],
  Redmi: [
    'Redmi Note 13', 'Redmi Note 13 Pro',
    'Redmi Note 12', 'Redmi Note 12 Pro',
    'Redmi 13', 'Redmi 12',
    'Redmi K70', 'Redmi K60',
    'Redmi A Series'
  ],
  Vivo: [
    'Vivo X100', 'Vivo X100 Pro',
    'Vivo V29', 'Vivo V29 Pro',
    'Vivo Y100', 'Vivo Y99'
  ],
  OPPO: [
    'OPPO Find X7',
    'OPPO Reno11', 'OPPO Reno11 Pro',
    'OPPO A Series',
    'OPPO F Series'
  ],
  OnePlus: [
    'OnePlus 12', 'OnePlus 12R',
    'OnePlus 11', 'OnePlus 11 Pro',
    'OnePlus Ace Series'
  ],
  iPad: [
    'iPad Pro 12.9', 'iPad Pro 11',
    'iPad Air', 'iPad Mini',
    'iPad (Standard)', 'iPad (10th Gen)'
  ],
  Other: ['Other', 'Tablet', 'Feature Phone']
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
