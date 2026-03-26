import { Ticket } from '../lib/supabase'
import { Clock, CheckCircle, AlertCircle, Pause, XCircle, Smartphone, Play, CheckCircle2 } from 'lucide-react'
import { STATUS_COLORS, PAYMENT_COLORS, formatPeso, formatRelativeTime } from '../lib/utils'

interface TicketCardProps {
  ticket: Ticket
  onClick: () => void
  onQuickAction?: (ticketId: string, newStatus: string) => void
}

export default function TicketCard({ ticket, onClick, onQuickAction }: TicketCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-amber-600" size={18} />
      case 'in-progress':
        return <AlertCircle className="text-blue-600" size={18} />
      case 'completed':
        return <CheckCircle className="text-emerald-600" size={18} />
      case 'on-hold':
        return <Pause className="text-rose-600" size={18} />
      case 'cancelled':
        return <XCircle className="text-slate-500" size={18} />
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
      className="card card-hover group space-y-4 p-5 animate-slide-in"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-lg truncate">#{ticket.ticket_id}</p>
          <p className="text-sm text-slate-600 truncate mt-1">{ticket.customer_name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon(ticket.status)}
          <span className={`badge ${STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]?.badge || 'bg-slate-100 text-slate-800'} text-xs`}>
            {ticket.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="divider" />

      <div className="space-y-2">
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

      {/* Quick Action Buttons */}
      {onQuickAction && ticket.status !== 'completed' && ticket.status !== 'cancelled' && (
        <div className="flex gap-2 pt-1">
          {ticket.status === 'pending' && (
            <button
              onClick={(e) => handleQuickClick(e, 'in-progress')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <Play size={12} />
              Start
            </button>
          )}
          {ticket.status === 'in-progress' && (
            <>
              <button
                onClick={(e) => handleQuickClick(e, 'completed')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle2 size={12} />
                Complete
              </button>
              <button
                onClick={(e) => handleQuickClick(e, 'on-hold')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <Pause size={12} />
                Hold
              </button>
            </>
          )}
          {ticket.status === 'on-hold' && (
            <button
              onClick={(e) => handleQuickClick(e, 'in-progress')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <Play size={12} />
              Resume
            </button>
          )}
        </div>
      )}

      {/* Payment Info */}
      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
        <p className="text-xs text-slate-600">Payment Status</p>
        <div className="flex justify-between items-center">
          <span className={`badge ${PAYMENT_COLORS[ticket.payment_status as keyof typeof PAYMENT_COLORS]?.badge || 'bg-rose-100 text-rose-800'} text-xs`}>
            {ticket.payment_status?.replace('-', ' ') || 'unpaid'}
          </span>
          {ticket.amount_paid ? (
            <span className="text-sm font-medium text-slate-900">{formatPeso(ticket.amount_paid)}</span>
          ) : (
            <span className="text-sm text-slate-500">No payment</span>
          )}
        </div>
        {ticket.payment_method && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-600">Method: <span className="font-medium text-slate-900">{ticket.payment_method.replace('_', ' ').toUpperCase()}</span></p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
        <span className="truncate">
          {ticket.assigned_technician || 'Unassigned'}
        </span>
        <span className="flex-shrink-0 ml-2" title={new Date(ticket.created_at).toLocaleString()}>
          {formatRelativeTime(ticket.created_at)}
        </span>
      </div>

      {/* Hover indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-maroon-600 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
