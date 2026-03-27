import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Package, Clock, CheckCircle, XCircle, Truck, X } from 'lucide-react'
import { DEVICE_TYPES } from '../lib/constants'
import { formatRelativeTime } from '../lib/utils'

interface PartsOrdersProps {
  onBack?: () => void
  user?: any
}

type OrderStatus = 'pending' | 'ordered' | 'received' | 'cancelled'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-800', icon: Truck },
  received: { label: 'Received', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-slate-200 text-slate-700', icon: XCircle },
}

export default function PartsOrders({ onBack, user }: PartsOrdersProps) {
  const isAdmin = user?.role === 'admin'
  const [orders, setOrders] = useState<any[]>([])
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    part_name: '',
    device_type: 'iOS',
    quantity: 1,
    notes: '',
  })

  useEffect(() => {
    fetchOrders()
    fetchParts()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('parts_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('id, name, device_type')
        .order('name', { ascending: true })

      if (error) throw error
      setParts(data || [])
    } catch (error) {
      console.error('Error fetching parts:', error)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.part_name || formData.quantity < 1) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('parts_orders')
        .insert([{
          part_name: formData.part_name,
          device_type: formData.device_type,
          requested_by: user?.name || 'Unknown',
          quantity: formData.quantity,
          notes: formData.notes || null,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])

      if (error) throw error
      alert('Order request submitted!')
      setFormData({ part_name: '', device_type: 'iOS', quantity: 1, notes: '' })
      setShowForm(false)
      fetchOrders()
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Error submitting order request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('parts_orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error updating status')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Delete this order request?')) return
    try {
      const { error } = await supabase
        .from('parts_orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error deleting order')
    }
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true
    return order.status === statusFilter
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    ordered: orders.filter(o => o.status === 'ordered').length,
    received: orders.filter(o => o.status === 'received').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="max-w-6xl mx-auto animate-slide-in">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-navy-600 hover:text-navy-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      )}

      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parts Orders</h1>
          <p className="text-slate-600 mt-1">
            {isAdmin ? 'Review and manage parts order requests' : 'Request parts for repairs'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'New Order Request'}
        </button>
      </div>

      {/* New Order Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package size={20} />
            New Parts Order Request
          </h3>
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Part Name *</label>
              <input
                type="text"
                value={formData.part_name}
                onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                placeholder="e.g., iPhone 15 Pro Battery"
                required
                list="parts-suggestions"
              />
              <datalist id="parts-suggestions">
                {parts.map(part => (
                  <option key={part.id} value={`${part.name} (${part.device_type})`} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Device Type *</label>
              <select
                value={formData.device_type}
                onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
              >
                {Object.keys(DEVICE_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes (urgency, specific model, etc.)"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? 'Submitting...' : 'Submit Order Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'ordered', 'received', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              statusFilter === status
                ? 'bg-navy-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_CONFIG[status].label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === status ? 'bg-white/20' : 'bg-slate-200'
            }`}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-slate-600">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="mx-auto text-slate-400 mb-3" size={40} />
          <p className="text-slate-600">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">Submit a new order request to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusInfo = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.pending
            const StatusIcon = statusInfo.icon
            return (
              <div key={order.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg">{order.part_name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                          <span>Device: <strong>{order.device_type}</strong></span>
                          <span>Qty: <strong>{order.quantity}</strong></span>
                          <span>By: <strong>{order.requested_by}</strong></span>
                        </div>
                        {order.notes && (
                          <p className="text-sm text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                            {order.notes}
                          </p>
                        )}
                        {order.admin_notes && (
                          <p className="text-sm text-blue-600 mt-1 bg-blue-50 rounded-lg px-3 py-2">
                            <strong>Admin:</strong> {order.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </div>

                    <p className="text-xs text-slate-400" title={new Date(order.created_at).toLocaleString()}>
                      {formatRelativeTime(order.created_at)}
                    </p>

                    {/* Admin Actions: Change Status */}
                    {isAdmin && order.status !== 'received' && order.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ordered')}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <Truck size={12} />
                            Mark Ordered
                          </button>
                        )}
                        {order.status === 'ordered' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'received')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={12} />
                            Mark Received
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Admin can delete */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
