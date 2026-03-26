// Utility for numeric ticket IDs - timestamp-based for uniqueness
export const generateNumericTicketId = (): string => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-1) // Last digit of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const seq = Math.floor(Math.random() * 900 + 100) // 100-999
  return `${year}${month}${day}${seq}`
}

// Status color mapping
export const STATUS_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  'pending': { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    badge: 'bg-amber-100 text-amber-800'
  },
  'in-progress': { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    badge: 'bg-blue-100 text-blue-800'
  },
  'completed': { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    badge: 'bg-emerald-100 text-emerald-800'
  },
  'on-hold': { 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    badge: 'bg-rose-100 text-rose-800'
  },
  'cancelled': { 
    bg: 'bg-slate-50', 
    text: 'text-slate-700', 
    badge: 'bg-slate-200 text-slate-800'
  }
}

export const PAYMENT_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  'unpaid': { 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    badge: 'bg-rose-100 text-rose-800'
  },
  'partial': { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    badge: 'bg-amber-100 text-amber-800'
  },
  'paid': { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    badge: 'bg-emerald-100 text-emerald-800'
  }
}

export const formatPeso = (amount: number | null): string => {
  if (!amount) return '₱0.00'
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Format relative time
export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
