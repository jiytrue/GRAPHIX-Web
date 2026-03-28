import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Edit2, Search, ArrowLeft, DollarSign, Package } from 'lucide-react'
import { DEVICE_TYPES, PART_CATEGORIES } from '../lib/constants'
import { formatPeso } from '../lib/utils'

interface AdminPartsManagementProps {
  onBack?: () => void
  user?: any
}

export default function AdminPartsManagement({ onBack, user }: AdminPartsManagementProps) {
  const isAdmin = user?.role === 'admin' || user?.role === 'worker'
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showPartForm, setShowPartForm] = useState(false)
  const [editingPartId, setEditingPartId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDeviceType, setSelectedDeviceType] = useState('all')

  // Price editing state
  const [editingPricePartId, setEditingPricePartId] = useState<string | null>(null)
  const [priceValue, setPriceValue] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    category: 'battery',
    device_type: 'iPhone',
    description: '',
  })

  useEffect(() => {
    fetchPartsWithPricing()
  }, [])

  const fetchPartsWithPricing = async () => {
    try {
      setLoading(true)

      // Fetch parts
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('*')
        .order('device_type', { ascending: true })

      if (partsError) throw partsError

      // Fetch all pricing
      const { data: pricingData, error: pricingError } = await supabase
        .from('parts_pricing')
        .select('*')
        .order('price', { ascending: true })

      if (pricingError) throw pricingError

      // Merge pricing into parts
      const partsWithPricing = (partsData || []).map(part => ({
        ...part,
        prices: (pricingData || []).filter(p => p.part_id === part.id)
      }))

      setParts(partsWithPricing)
    } catch (error) {
      console.error('Error fetching parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || !formData.device_type) {
      alert('Please fill all required fields')
      return
    }

    try {
      setLoading(true)

      if (editingPartId) {
        const { error } = await supabase
          .from('parts')
          .update(formData)
          .eq('id', editingPartId)

        if (error) throw error
        alert('Part updated!')
      } else {
        const { error } = await supabase
          .from('parts')
          .insert([formData])

        if (error) throw error
        alert('Part added!')
      }

      setFormData({ name: '', category: 'battery', device_type: 'iPhone', description: '' })
      setEditingPartId(null)
      setShowPartForm(false)
      fetchPartsWithPricing()
    } catch (error) {
      console.error('Error saving part:', error)
      alert('Error saving part')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePart = async (id: string) => {
    if (!confirm('Delete this part and all its prices?')) return

    try {
      setLoading(true)
      const { error } = await supabase.from('parts').delete().eq('id', id)
      if (error) throw error
      setParts(parts.filter(p => p.id !== id))
      alert('Part deleted!')
    } catch (error) {
      console.error('Error deleting part:', error)
      alert('Error deleting part')
      await fetchPartsWithPricing()
    } finally {
      setLoading(false)
    }
  }

  const handleEditPart = (part: any) => {
    setFormData({
      name: part.name,
      category: part.category,
      device_type: part.device_type,
      description: part.description || '',
    })
    setEditingPartId(part.id)
    setShowPartForm(true)
  }

  const handleSetPrice = async (partId: string, deviceType: string) => {
    if (!priceValue || parseFloat(priceValue) <= 0) {
      alert('Enter a valid price')
      return
    }

    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('graphix_user') || '{}')

      // Check if price already exists
      const existingPrices = parts.find(p => p.id === partId)?.prices || []
      const existing = existingPrices.find((pr: any) => pr.device_type === deviceType)

      if (existing) {
        // Update existing price
        const { error } = await supabase
          .from('parts_pricing')
          .update({ price: parseFloat(priceValue), updated_at: new Date().toISOString() })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        // Insert new price
        const { error } = await supabase
          .from('parts_pricing')
          .insert([{
            part_id: partId,
            device_type: deviceType,
            price: parseFloat(priceValue),
            created_by: user.id,
          }])
        if (error) throw error
      }

      setEditingPricePartId(null)
      setPriceValue('')
      fetchPartsWithPricing()
    } catch (error) {
      console.error('Error setting price:', error)
      alert('Error setting price')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm('Remove this price?')) return

    try {
      const { error } = await supabase.from('parts_pricing').delete().eq('id', priceId)
      if (error) throw error
      fetchPartsWithPricing()
    } catch (error) {
      console.error('Error deleting price:', error)
      alert('Error deleting price')
    }
  }

  const deviceTypes = ['all', ...Object.keys(DEVICE_TYPES)]

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDevice = selectedDeviceType === 'all' || part.device_type === selectedDeviceType
    return matchesSearch && matchesDevice
  })

  // Group by category for better organization
  const groupedParts = PART_CATEGORIES.reduce((groups: Record<string, any[]>, cat) => {
    const matching = filteredParts.filter(p => p.category === cat.value)
    if (matching.length > 0) {
      groups[cat.label] = matching
    }
    return groups
  }, {})

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
          <h1 className="text-3xl font-bold text-slate-900">Parts & Pricing</h1>
          <p className="text-slate-600 mt-1">{isAdmin ? 'Manage repair parts and set prices' : 'View available parts and prices'}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setShowPartForm(!showPartForm)
              if (showPartForm) {
                setFormData({ name: '', category: 'battery', device_type: 'iOS', description: '' })
                setEditingPartId(null)
              }
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            {showPartForm ? 'Cancel' : 'Add Part'}
          </button>
        )}
      </div>

      {/* Add/Edit Part Form (Admin only) */}
      {isAdmin && showPartForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package size={20} />
            {editingPartId ? 'Edit Part' : 'Add New Part'}
          </h3>
          <form onSubmit={handleAddPart} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Part Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., iPhone 15 Battery"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {PART_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Saving...' : editingPartId ? 'Update Part' : 'Add Part'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 w-full">
          <Search className="text-slate-400 flex-shrink-0" size={20} />
          <input
            type="text"
            placeholder="Search parts by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {deviceTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedDeviceType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedDeviceType === type
                  ? 'bg-navy-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Devices' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Parts grouped by category */}
      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-slate-600">Loading parts...</p>
        </div>
      ) : Object.keys(groupedParts).length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="mx-auto text-slate-400 mb-3" size={40} />
          <p className="text-slate-600">No parts found</p>
        </div>
      ) : (
        Object.entries(groupedParts).map(([category, categoryParts]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-navy-600" />
              {category}
              <span className="text-sm font-normal text-slate-400">({categoryParts.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryParts.map((part: any) => (
                <div key={part.id} className="card p-5 space-y-3">
                  {/* Part Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{part.name}</h3>
                      <p className="text-xs text-slate-500">{part.device_type}</p>
                      {part.description && (
                        <p className="text-xs text-slate-400 mt-1">{part.description}</p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditPart(part)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit part"
                        >
                          <Edit2 size={14} className="text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete part"
                        >
                          <Trash2 size={14} className="text-rose-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Prices */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Pricing</p>
                      {isAdmin && editingPricePartId !== part.id && (
                        <button
                          onClick={() => {
                            setEditingPricePartId(part.id)
                            const existingPrice = part.prices?.find((p: any) => p.device_type === part.device_type)
                            setPriceValue(existingPrice ? existingPrice.price.toString() : '')
                          }}
                          className="text-xs text-navy-600 font-medium hover:text-navy-700 flex items-center gap-1"
                        >
                          <DollarSign size={12} />
                          {part.prices?.length > 0 ? 'Edit Price' : 'Set Price'}
                        </button>
                      )}
                    </div>

                    {part.prices?.length > 0 ? (
                      <div className="space-y-1">
                        {part.prices.map((price: any) => (
                          <div key={price.id} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2">
                            <span className="text-xs text-slate-600">{price.device_type}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-navy-600">{formatPeso(price.price)}</span>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeletePrice(price.id)}
                                  className="text-rose-400 hover:text-rose-600 transition-colors"
                                  title="Remove price"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No price set</p>
                    )}

                    {/* Inline Price Editor (Admin only) */}
                    {isAdmin && editingPricePartId === part.id && (
                      <div className="mt-2 flex gap-2 items-end">
                        <div className="flex-1">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <span className="px-2 text-sm text-slate-500 bg-slate-50 py-2">₱</span>
                            <input
                              type="number"
                              value={priceValue}
                              onChange={(e) => setPriceValue(e.target.value)}
                              placeholder="0.00"
                              step="0.01"
                              className="flex-1 px-2 py-2 text-sm border-0 focus:ring-0"
                              style={{ border: 'none', outline: 'none' }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleSetPrice(part.id, part.device_type)}
                          disabled={loading}
                          className="px-3 py-2 bg-navy-600 text-white rounded-lg text-xs font-medium hover:bg-navy-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingPricePartId(null); setPriceValue('') }}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
