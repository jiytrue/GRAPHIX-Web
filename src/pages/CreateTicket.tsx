import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DEVICE_TYPES } from '../lib/constants'
import { generateNumericTicketId } from '../lib/utils'
import { ArrowLeft, CheckCircle } from 'lucide-react'

interface CreateTicketProps {
  onBack: () => void
  onSuccess: () => void
}

export default function CreateTicket({ onBack, onSuccess }: CreateTicketProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    device_type: 'iOS',
    device_model: '',
    issue_description: '',
    assigned_technician: '',
    received_by: '',
    target_completion_date: '',
  })
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [generatedTicketId, setGeneratedTicketId] = useState<string>('')
  const [technicians, setTechnicians] = useState<string[]>([])
  const [partsTotalCost, setPartsTotalCost] = useState(0)

  useEffect(() => {
    fetchTechnicians()
    fetchParts()
  }, [])

  useEffect(() => {
    calculatePartsCost()
  }, [selectedParts])

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

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts_pricing')
        .select('parts(id, name, category), price, device_type')
        .eq('device_type', formData.device_type)
        .order('price', { ascending: true })

      if (error) throw error

      const uniqueParts = Array.from(new Map(
        (data || []).map((item: any) => [item.parts.id, item])
      ).values())

      setParts(uniqueParts || [])
    } catch (error) {
      console.error('Error fetching parts:', error)
    }
  }

  const handlePartToggle = (partId: string) => {
    setSelectedParts(prev =>
      prev.includes(partId)
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    )
  }

  const calculatePartsCost = async () => {
    if (selectedParts.length === 0) {
      setPartsTotalCost(0)
      return
    }

    try {
      const { data, error } = await supabase
        .from('parts_pricing')
        .select('price')
        .in('id', selectedParts)
        .eq('device_type', formData.device_type)

      if (error) throw error
      const total = (data || []).reduce((sum, item) => sum + item.price, 0)
      setPartsTotalCost(total)
    } catch (error) {
      console.error('Error calculating cost:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'device_type') {
      setSelectedParts([])
      fetchParts()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_name || !formData.customer_phone || !formData.issue_description || !formData.device_model) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const ticketId = generateNumericTicketId()
      setGeneratedTicketId(ticketId)

      const insertData: Record<string, any> = {
        ticket_id: ticketId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        device_type: formData.device_type,
        device_model: formData.device_model,
        issue_description: formData.issue_description,
        assigned_technician: formData.assigned_technician || null,
        status: 'diagnosing',
        notes: '',
        cost_estimate: partsTotalCost > 0 ? partsTotalCost : null,
        parts: selectedParts.length > 0 ? selectedParts : null,
        total_parts_cost: partsTotalCost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (formData.received_by) {
        insertData.received_by = formData.received_by
      }
      if (formData.target_completion_date) {
        insertData.target_completion_date = formData.target_completion_date
      }

      const { error } = await supabase.from('tickets').insert([insertData])

      if (error) throw error
      setSubmitSuccess(true)

      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center space-y-6 animate-slide-in">
          <div className="flex justify-center">
            <CheckCircle className="text-emerald-600" size={64} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Ticket Created</h2>
            <p className="text-slate-600">Your repair ticket has been created successfully</p>
          </div>
          <div className="bg-navy-50 border border-navy-200 p-6 rounded-xl space-y-2">
            <p className="text-sm text-slate-600 font-medium">TICKET ID</p>
            <p className="text-4xl font-bold text-navy-600 font-mono tracking-wider">{generatedTicketId}</p>
            <p className="text-xs text-slate-500 mt-4">
              Print this ID and attach to the back of the phone
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 btn btn-primary"
            >
              Print Label
            </button>
            <button
              onClick={() => onSuccess()}
              className="flex-1 btn btn-secondary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-slide-in">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-navy-600 hover:text-navy-700 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Repair Ticket</h1>
          <p className="text-slate-600 mt-2">Add a new device for repair</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full Name <span className="text-navy-600">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Customer full name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number <span className="text-navy-600">*</span>
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                  placeholder="+63 908 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Device Information */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Device Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Device Type</label>
                <select
                  name="device_type"
                  value={formData.device_type}
                  onChange={handleChange}
                >
                  {Object.keys(DEVICE_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Device Model <span className="text-navy-600">*</span>
                </label>
                <input
                  type="text"
                  name="device_model"
                  value={formData.device_model}
                  onChange={handleChange}
                  required
                  placeholder="e.g., iPhone 15 Pro Max, Samsung S24"
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Intake Details */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Intake Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Received By</label>
                <input
                  type="text"
                  name="received_by"
                  value={formData.received_by}
                  onChange={handleChange}
                  placeholder="Name of person who received"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Assign Technician</label>
                <select
                  name="assigned_technician"
                  value={formData.assigned_technician}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Target Completion</label>
                <input
                  type="date"
                  name="target_completion_date"
                  value={formData.target_completion_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Parts Selection */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Parts & Pricing</h2>
            {parts.length > 0 ? (
              <div className="space-y-3">
                {parts.map((item: any) => (
                  <label key={item.parts.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={selectedParts.includes(item.parts.id)}
                      onChange={() => handlePartToggle(item.parts.id)}
                      className="w-4 h-4 text-navy-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.parts.name}</p>
                      <p className="text-xs text-slate-500">{item.parts.category}</p>
                    </div>
                    <p className="font-bold text-navy-600">₱{item.price.toFixed(2)}</p>
                  </label>
                ))}
                {partsTotalCost > 0 && (
                  <div className="bg-navy-50 p-4 rounded-lg border border-navy-200">
                    <p className="text-sm text-slate-600">Parts Total Cost:</p>
                    <p className="text-2xl font-bold text-navy-600">₱{partsTotalCost.toFixed(2)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-600 text-sm">No parts available for this device type</p>
            )}
          </div>

          <div className="divider" />

          {/* Issue Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-5">Issue Details</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Describe the Issue <span className="text-navy-600">*</span>
              </label>
              <textarea
                name="issue_description"
                value={formData.issue_description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Be as detailed as possible about the device issue..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating Ticket...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
