import { useState, useEffect } from 'react'
import { supabase, Ticket } from '../lib/supabase'
import { ArrowLeft, Printer, Save, X, Trash2, Edit3, Wrench, CheckCircle2, PackageCheck } from 'lucide-react'
import { STATUS_COLORS, PAYMENT_COLORS, formatPeso, formatRelativeTime } from '../lib/utils'

interface TicketDetailProps {
  ticketId: string
  onBack: () => void
  user?: any
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function TicketDetail({ ticketId, onBack, user, showToast }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Ticket>>({})
  const [technicians, setTechnicians] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [quickActionLoading, setQuickActionLoading] = useState(false)

  useEffect(() => {
    fetchTicket()
    fetchTechnicians()
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (error) throw error
      setTicket(data)
      setFormData(data)
    } catch (error) {
      console.error('Error fetching ticket:', error)
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

  const handleSave = async () => {
    try {
      if (!ticket) return
      setSaving(true)

      const updateData: Record<string, any> = {
        status: formData.status || ticket.status,
        assigned_technician: formData.assigned_technician || ticket.assigned_technician || null,
        notes: formData.notes ?? ticket.notes ?? '',
        cost_estimate: formData.cost_estimate !== undefined ? formData.cost_estimate : ticket.cost_estimate,
        updated_at: new Date().toISOString(),
      }

      if ('payment_status' in ticket || formData.payment_status) {
        updateData.payment_status = formData.payment_status || ticket.payment_status || 'unpaid'
      }
      if ('amount_paid' in ticket || formData.amount_paid !== undefined) {
        updateData.amount_paid = formData.amount_paid !== undefined ? formData.amount_paid : ticket.amount_paid || 0
      }
      if ('payment_method' in ticket || formData.payment_method) {
        updateData.payment_method = formData.payment_method || ticket.payment_method || null
      }
      if ('received_by' in ticket || formData.received_by) {
        updateData.received_by = formData.received_by || ticket.received_by || null
      }
      if ('target_completion_date' in ticket || formData.target_completion_date) {
        updateData.target_completion_date = formData.target_completion_date || ticket.target_completion_date || null
      }

      if (updateData.status === 'repaired' && ticket.status !== 'repaired') {
        updateData.completion_date = new Date().toISOString()
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId)

      if (error) throw error
      
      await fetchTicket()
      setEditing(false)
      showToast?.('Ticket updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating ticket:', error)
      showToast?.('Error updating ticket: ' + (error as any).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId)

      if (error) throw error
      showToast?.('Ticket deleted successfully', 'success')
      onBack()
    } catch (error) {
      console.error('Error deleting ticket:', error)
      showToast?.('Error deleting ticket: ' + (error as any).message, 'error')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleQuickStatus = async (newStatus: string) => {
    try {
      if (!ticket) return
      setQuickActionLoading(true)

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

      await fetchTicket()
      const labels: Record<string, string> = {
        'repairing': 'Repair started!',
        'repaired': 'Marked as repaired!',
        'received': 'Customer received device!',
        'cancelled': 'Ticket cancelled.',
      }
      showToast?.(labels[newStatus] || 'Status updated!', 'success')
    } catch (error) {
      console.error('Error quick-updating:', error)
      showToast?.('Error updating status', 'error')
    } finally {
      setQuickActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-slate-600 font-medium">Loading ticket...</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="card p-8 text-center">
        <p className="text-rose-600 font-medium">Ticket not found</p>
        <button onClick={onBack} className="mt-4 btn btn-primary">Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-in">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-navy-600 hover:text-navy-700 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2">TICKET</p>
            <h1 className="text-4xl font-bold text-navy-600">#{ticket.ticket_id}</h1>
            <p className="text-slate-600 mt-2">
              Created {new Date(ticket.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {ticket.updated_at && ticket.updated_at !== ticket.created_at && (
              <p className="text-xs text-slate-400 mt-1">
                Last updated: {formatRelativeTime(ticket.updated_at)}
              </p>
            )}
          </div>
          <div className="flex gap-2 no-print flex-wrap justify-end">
            <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
              <Printer size={18} />
              Print
            </button>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary flex items-center gap-2">
                <Edit3 size={18} />
                Update Ticket
              </button>
            )}
            {user?.role === 'admin' && !editing && (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger flex items-center gap-2">
                <Trash2 size={18} />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        {!editing && ticket.status !== 'received' && ticket.status !== 'cancelled' && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 no-print">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">⚡ Quick Actions</p>
            <div className="flex flex-wrap gap-3">
              {ticket.status === 'diagnosing' && (
                <button
                  onClick={() => handleQuickStatus('repairing')}
                  disabled={quickActionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  <Wrench size={16} />
                  Start Repairing
                </button>
              )}
              {ticket.status === 'repairing' && (
                <button
                  onClick={() => handleQuickStatus('repaired')}
                  disabled={quickActionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Mark Repaired
                </button>
              )}
              {ticket.status === 'repaired' && (
                <button
                  onClick={() => handleQuickStatus('received')}
                  disabled={quickActionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  <PackageCheck size={16} />
                  Customer Received
                </button>
              )}
            </div>
          </div>
        )}

        {/* Print Section */}
        <div className="print:block hidden">
          <TicketLabel ticket={ticket} />
        </div>

        {/* Customer Info */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Name</p>
              <p className="text-slate-900">{ticket.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Phone</p>
              <p className="text-slate-900">{ticket.customer_phone}</p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Device Info */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Device Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Device Type</p>
              <p className="text-slate-900">{ticket.device_type}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Device Model</p>
              <p className="text-slate-900">{ticket.device_model || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Issue</p>
              <p className="text-slate-900">{ticket.issue_description}</p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Intake & Repair Info */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Repair Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Status</p>
              {editing ? (
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Ticket['status'] })}
                  className="w-full"
                >
                  <option value="diagnosing">Diagnosing</option>
                  <option value="repairing">Repairing</option>
                  <option value="repaired">Repaired</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <span className={`badge ${STATUS_COLORS[ticket.status]?.badge || 'bg-slate-100 text-slate-800'}`}>
                  {ticket.status.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Assigned Technician</p>
              {editing ? (
                <select
                  value={formData.assigned_technician || ''}
                  onChange={(e) => setFormData({ ...formData, assigned_technician: e.target.value })}
                  className="w-full"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              ) : (
                <p className="text-slate-900">{ticket.assigned_technician || 'Unassigned'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Received By</p>
              {editing ? (
                <input
                  type="text"
                  value={formData.received_by || ''}
                  onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                  className="w-full"
                  placeholder="Name of person who received"
                />
              ) : (
                <p className="text-slate-900">{ticket.received_by || 'Not set'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Target Completion</p>
              {editing ? (
                <input
                  type="date"
                  value={formData.target_completion_date || ''}
                  onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                  className="w-full"
                />
              ) : (
                <p className="text-slate-900">
                  {ticket.target_completion_date 
                    ? new Date(ticket.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                    : 'Not set'}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-600 font-medium mb-2">Cost Estimate</p>
            {editing ? (
              <div className="flex items-center max-w-xs">
                <span className="mr-2 text-slate-900">₱</span>
                <input
                  type="number"
                  value={formData.cost_estimate !== undefined && formData.cost_estimate !== null ? formData.cost_estimate : ''}
                  onChange={(e) => setFormData({ ...formData, cost_estimate: parseFloat(e.target.value) || null })}
                  placeholder="Enter amount"
                />
              </div>
            ) : (
              <p className="text-slate-900 font-medium">{ticket.cost_estimate ? formatPeso(ticket.cost_estimate) : 'Not set'}</p>
            )}
          </div>
        </div>

        <div className="divider" />

        {/* Payment Status */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Payment Status</p>
              {editing ? (
                <select
                  value={formData.payment_status || 'unpaid'}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                  className="w-full"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              ) : (
                <span className={`badge ${PAYMENT_COLORS[ticket.payment_status as string]?.badge || 'bg-slate-100 text-slate-800'}`}>
                  {ticket.payment_status?.toUpperCase() || 'UNPAID'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Amount Paid</p>
              {editing ? (
                <div className="flex items-center">
                  <span className="mr-2 text-slate-900">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount_paid !== undefined ? formData.amount_paid : ''}
                    onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                <p className="text-slate-900 font-medium">{ticket.amount_paid ? formatPeso(ticket.amount_paid) : 'No payment'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Payment Method</p>
              {editing ? (
                <select
                  value={formData.payment_method || ''}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full"
                >
                  <option value="">Select method...</option>
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              ) : (
                <p className="text-slate-900">{ticket.payment_method ? ticket.payment_method.replace('_', ' ').toUpperCase() : 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Notes */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Internal Notes</h2>
          {editing ? (
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes about this repair..."
              rows={4}
            />
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 min-h-[100px]">
              <p className="text-slate-700 whitespace-pre-wrap">
                {ticket.notes || 'No notes added yet'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => { setEditing(false); setFormData(ticket) }}
              className="btn btn-secondary flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Ticket</h3>
              <p className="text-slate-600 text-sm">
                Are you sure you want to delete ticket <strong>#{ticket.ticket_id}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn btn-secondary">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 btn btn-danger disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketLabel({ ticket }: { ticket: Ticket }) {
  return (
    <div className="ticket-label">
      <div>
        <div className="ticket-label-big">TICKET ID</div>
        <div className="text-2xl font-bold mt-2 font-mono">{ticket.ticket_id}</div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="font-bold text-sm">Customer:</div>
          <div className="text-sm">{ticket.customer_name}</div>
          <div className="text-xs text-slate-600">{ticket.customer_phone}</div>
        </div>
        <div>
          <div className="font-bold text-sm">Device:</div>
          <div className="text-xs">{ticket.device_type} {ticket.device_model ? `- ${ticket.device_model}` : ''}</div>
        </div>
        <div>
          <div className="font-bold text-sm">Issue:</div>
          <div className="text-xs">{ticket.issue_description}</div>
        </div>
        {ticket.received_by && (
          <div>
            <div className="font-bold text-sm">Received by:</div>
            <div className="text-xs">{ticket.received_by}</div>
          </div>
        )}
      </div>
      <div>
        <div className="font-bold text-sm">Status:</div>
        <div className="text-xs uppercase font-medium">{ticket.status}</div>
      </div>
      <div className="border-t pt-2">
        <div className="text-xs text-slate-600">
          Created: {new Date(ticket.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
