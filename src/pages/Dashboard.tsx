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
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [technicianFilter, setTechnicianFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [technicians, setTechnicians] = useState<string[]>([])

  useEffect(() => {
    fetchTickets()
    fetchTechnicians()
  }, [])

  const fetchTickets = async (status?: string, tech?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (tech && tech !== 'all') {
        query = query.eq('assigned_technician', tech)
      }

      const { data, error } = await query

      if (error) throw error
      setTickets(data || [])
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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    fetchTickets(status, technicianFilter)
  }

  const handleTechnicianFilterChange = (tech: string) => {
    setTechnicianFilter(tech)
    fetchTickets(statusFilter, tech)
  }

  const filteredTickets = tickets.filter(ticket => {
    const search = searchTerm.toLowerCase()
    return (
      ticket.ticket_id.toLowerCase().includes(search) ||
      ticket.customer_name.toLowerCase().includes(search) ||
      ticket.customer_phone.toLowerCase().includes(search) ||
      (ticket.device_model?.toLowerCase().includes(search) ?? false)
    )
  })

  const getStats = () => {
    return {
      total: tickets.length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      inProgress: tickets.filter((t) => t.status === 'in-progress').length,
      completed: tickets.filter((t) => t.status === 'completed').length,
      onHold: tickets.filter((t) => t.status === 'on-hold').length,
      cancelled: tickets.filter((t) => t.status === 'cancelled').length,
    }
  }

  const stats = getStats()

  const handleQuickAction = async (ticketId: string, newStatus: string) => {
    try {
      const updateData: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }
      if (newStatus === 'completed') {
        updateData.completion_date = new Date().toISOString()
      }
      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId)
      if (error) throw error
      const labels: Record<string, string> = {
        'in-progress': 'Repair started!',
        'completed': 'Marked as complete!',
        'on-hold': 'Put on hold.',
      }
      showToast?.(labels[newStatus] || 'Status updated!', 'success')
      fetchTickets(statusFilter, technicianFilter)
    } catch (error) {
      showToast?.('Error updating status', 'error')
    }
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          label="Total" 
          value={stats.total} 
          color="bg-slate-100 text-slate-900"
          icon="📊"
        />
        <StatCard 
          label="Pending" 
          value={stats.pending} 
          color="bg-amber-100 text-amber-900"
          icon="⏳"
        />
        <StatCard 
          label="In Progress" 
          value={stats.inProgress} 
          color="bg-blue-100 text-blue-900"
          icon="⚙️"
        />
        <StatCard 
          label="On Hold" 
          value={stats.onHold} 
          color="bg-rose-100 text-rose-900"
          icon="⏸️"
        />
        <StatCard 
          label="Completed" 
          value={stats.completed} 
          color="bg-emerald-100 text-emerald-900"
          icon="✓"
        />
        <StatCard 
          label="Cancelled" 
          value={stats.cancelled} 
          color="bg-slate-200 text-slate-800"
          icon="✕"
        />
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <StatusFilter
            label="Status:"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="font-medium text-slate-700 text-sm whitespace-nowrap">Technician:</label>
            <select
              value={technicianFilter}
              onChange={(e) => handleTechnicianFilterChange(e.target.value)}
              className="flex-1 md:flex-initial px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Search className="text-slate-400 flex-shrink-0" size={20} />
          <input
            type="text"
            placeholder="Search by Ticket ID, Customer Name, Phone, or Device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Repair Tickets</h2>
          {searchTerm && (
            <p className="text-sm text-slate-500">
              {filteredTickets.length} result{filteredTickets.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader className="animate-spin text-maroon-600" size={36} />
              <p className="text-slate-600 text-sm font-medium">Loading tickets...</p>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600 text-lg">No tickets found</p>
            <p className="text-slate-500 text-sm mt-2">Create your first ticket to get started</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-600 text-lg">No matching tickets</p>
            <p className="text-slate-500 text-sm mt-2">Try a different search term or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTickets.map((ticket) => (
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

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon: string
}) {
  return (
    <div className={`card p-4 sm:p-5 ${color} space-y-2 transition-transform hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium opacity-75 mb-1">{label.toUpperCase()}</p>
          <p className="text-2xl sm:text-3xl font-bold">{value}</p>
        </div>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
    </div>
  )
}
