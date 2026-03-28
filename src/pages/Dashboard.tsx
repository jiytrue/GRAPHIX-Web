import { useState, useEffect } from 'react'
import { supabase, Ticket } from '../lib/supabase'
import TicketCard from '../components/TicketCard'
import StatusFilter from '../components/StatusFilter'
import { Loader, Search } from 'lucide-react'

interface DashboardProps {
  onSelectTicket: (ticketId: string) => void
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function Dashboard({ onSelectTicket, showToast }: DashboardProps) {
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [technicianFilter, setTechnicianFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [technicians, setTechnicians] = useState<string[]>([])

  useEffect(() => {
    fetchAllTickets()
    fetchTechnicians()
  }, [])

  const fetchAllTickets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('name')
        .eq('active', true)
      if (error) throw error
      setTechnicians(data?.map((t) => t.name) || [])
    } catch (error) {
      console.error('Error fetching technicians:', error)
    }
  }

  // Stats always computed from ALL tickets (unfiltered)
  const stats = {
    total: allTickets.length,
    diagnosing: allTickets.filter((t) => t.status === 'diagnosing').length,
    repairing: allTickets.filter((t) => t.status === 'repairing').length,
    repaired: allTickets.filter((t) => t.status === 'repaired').length,
    received: allTickets.filter((t) => t.status === 'received').length,
    cancelled: allTickets.filter((t) => t.status === 'cancelled').length,
  }

  // Filtered tickets computed locally from allTickets
  const displayedTickets = allTickets.filter(ticket => {
    // Status filter
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
    // Technician filter
    if (technicianFilter !== 'all' && ticket.assigned_technician !== technicianFilter) return false
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        ticket.ticket_id.toLowerCase().includes(term) ||
        ticket.customer_name.toLowerCase().includes(term) ||
        ticket.customer_phone?.toLowerCase().includes(term) ||
        ticket.device_model?.toLowerCase().includes(term) ||
        ticket.device_type?.toLowerCase().includes(term)
      )
    }
    return true
  })

  const handleQuickAction = async (ticketId: string, newStatus: string) => {
    try {
      const updateData: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }
      if (newStatus === 'repaired') {
        updateData.completion_date = new Date().toISOString()
      }
      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId)
      if (error) throw error
      const labels: Record<string, string> = {
        'repairing': 'Repair started!',
        'repaired': 'Marked as repaired!',
        'received': 'Customer received!',
      }
      showToast?.(labels[newStatus] || 'Status updated!', 'success')
      fetchAllTickets()
    } catch (error) {
      showToast?.('Error updating status', 'error')
    }
  }

  const statCards = [
    { label: 'Total', value: stats.total, status: 'all', color: 'bg-slate-50 text-slate-800 border-slate-200', ring: 'ring-slate-300' },
    { label: 'Diagnosing', value: stats.diagnosing, status: 'diagnosing', color: 'bg-amber-50 text-amber-800 border-amber-200', ring: 'ring-amber-300' },
    { label: 'Repairing', value: stats.repairing, status: 'repairing', color: 'bg-blue-50 text-blue-800 border-blue-200', ring: 'ring-blue-300' },
    { label: 'Repaired', value: stats.repaired, status: 'repaired', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', ring: 'ring-emerald-300' },
    { label: 'Received', value: stats.received, status: 'received', color: 'bg-purple-50 text-purple-800 border-purple-200', ring: 'ring-purple-300' },
    { label: 'Cancelled', value: stats.cancelled, status: 'cancelled', color: 'bg-slate-100 text-slate-600 border-slate-200', ring: 'ring-slate-300' },
  ]

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {statCards.map(card => (
          <button
            key={card.status}
            onClick={() => setStatusFilter(card.status)}
            className={`p-4 rounded-xl border transition-all text-left hover:shadow-md active:scale-95 ${card.color} ${
              statusFilter === card.status ? `ring-2 ${card.ring} shadow-md` : ''
            }`}
          >
            <p className="text-2xl md:text-3xl font-bold">{card.value}</p>
            <p className="text-xs font-medium mt-1 opacity-80">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <StatusFilter
            label="Status:"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="font-medium text-slate-700 text-sm whitespace-nowrap">Technician:</label>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="flex-1 md:flex-initial px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full md:flex-1">
            <Search className="text-slate-400 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
            />
          </div>
        </div>
        {(statusFilter !== 'all' || technicianFilter !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-500">
              Showing <strong>{displayedTickets.length}</strong> of {allTickets.length} tickets
            </p>
          </div>
        )}
      </div>

      {/* Tickets Grid */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader className="animate-spin text-maroon-600" size={36} />
              <p className="text-slate-600 text-sm font-medium">Loading tickets...</p>
            </div>
          </div>
        ) : allTickets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600 text-lg">No tickets found</p>
            <p className="text-slate-500 text-sm mt-2">Create your first ticket to get started</p>
          </div>
        ) : displayedTickets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600 text-lg">No matching tickets</p>
            <p className="text-slate-500 text-sm mt-2">Try a different search term or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onSelectTicket(ticket.id)}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
