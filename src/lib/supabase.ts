import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Ticket = {
  id: string
  ticket_id: string
  customer_name: string
  customer_phone: string
  device_type: string
  device_model?: string
  issue_description: string
  assigned_technician: string
  status: 'diagnosing' | 'repairing' | 'repaired' | 'received' | 'returned' | 'cancelled'
  created_at: string
  updated_at: string
  notes: string
  cost_estimate: number | null
  completion_date: string | null
  received_by?: string
  target_completion_date?: string | null
  parts?: any
  total_parts_cost?: number | null
  payment_status?: 'unpaid' | 'partial' | 'paid'
  amount_paid?: number
  payment_method?: 'cash' | 'gcash' | 'maya' | 'bank_transfer'
  device_photos?: string[]
}

export type Technician = {
  id: string
  name: string
  active: boolean
}
