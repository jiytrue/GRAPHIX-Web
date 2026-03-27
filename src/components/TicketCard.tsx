import { Ticket } from '../lib/supabase'
import { Search, Wrench, CheckCircle, PackageCheck, XCircle, Smartphone, Play, CheckCircle2, Calendar, User } from 'lucide-react'
import { STATUS_COLORS, formatRelativeTime } from '../lib/utils'

interface TicketCardProps {
  ticket: Ticket
  onClick: () => void
  onQuickAction?: (ticketId: string, newStatus: string) => void
}

export default function TicketCard({ ticket, onClick, onQuickAction }: TicketCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'diagnosing':
        return <Search className="text-amber-600" size={16} />
      case 'repairing':
        return <Wrench className="text-blue-600" size={16} />
      case 'repaired':
        return <CheckCircle className="text-emerald-600" size={16} />
      case 'received':
        return <PackageCheck className="text-purple-600" size={16} />
      case 'cancelled':
        return <XCircle className="text-slate-500" size={16} />
      default:
        return null
    }
  }

  const handleQuickClick = (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation()
    onQuickAction?.(ticket.id, newStatus)
  }

  return (
    <div
      onClick={onClick}
      className="card card-hover group space-y-3 p-5 animate-slide-in"
    >
      {/* Header: Ticket ID + Status */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-lg truncate">#{ticket.ticket_id}</p>
          <p className="text-sm font-medium text-slate-800 truncate mt-1">{ticket.customer_name}</p>
          <p className="text-xs text-slate-500">{ticket.customer_phone}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {getStatusIcon(ticket.status)}
          <span className={`badge ${STATUS_COLORS[ticket.status]?.badge || 'bg-slate-100 text-slate-800'} text-xs`}>
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="divider" />

      {/* Device + Issue */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Smartphone size={14} className="text-slate-400 flex-shrink-0" />
          <p className="text-sm text-slate-700 font-medium truncate">
            {ticket.device_type} {ticket.device_model ? `• ${ticket.device_model}` : ''}
          </p>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {ticket.issue_description}
        </p>
      </div>

      {/* Info Row: Date Received + Received by + Target Date */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>Received: <strong className="text-slate-700">{new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
        </div>
        {ticket.received_by && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>By: <strong className="text-slate-700">{ticket.received_by}</strong></span>
          </div>
        )}
        {ticket.target_completion_date && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Target: <strong className="text-slate-700">{new Date(ticket.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      {onQuickAction && ticket.status !== 'repaired' && ticket.status !== 'received' && ticket.status !== 'cancelled' && (
        <div className="flex gap-2 pt-1">
          {ticket.status === 'diagnosing' && (
            <button
              onClick={(e) => handleQuickClick(e, 'repairing')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <Play size={12} />
              Start Repair
            </button>
          )}
          {ticket.status === 'repairing' && (
            <button
              onClick={(e) => handleQuickClick(e, 'repaired')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 size={12} />
              Mark Repaired
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
        <span className="truncate">
          {ticket.assigned_technician || 'Unassigned'}
        </span>
        <span className="flex-shrink-0 ml-2" title={new Date(ticket.created_at).toLocaleString()}>
          {formatRelativeTime(ticket.created_at)}
        </span>
      </div>

      {/* Hover indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-navy-600 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
