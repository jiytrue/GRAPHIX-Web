import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Edit2, Search, ArrowLeft, DollarSign, Package } from 'lucide-react'
import { DEVICE_TYPES } from '../lib/constants'
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

  // Custom UI State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type })
  }

  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, show: false }))

  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    device_type: 'iOS',
    description: '',
    price: '',
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

    if (!formData.name || !formData.device_type) {
      alert('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('graphix_user') || '{}')
      
      const partData = {
        name: formData.name,
        category: 'other', // hardcoded to bypass DB constraint
        device_type: formData.device_type,
        description: formData.description
      }

      if (editingPartId) {
        // Update existing part
        const { error: partError } = await supabase
          .from('parts')
          .update(partData)
          .eq('id', editingPartId)

        if (partError) throw partError

        // Process price if provided
        if (formData.price && parseFloat(formData.price) > 0) {
          const existingPrices = parts.find(p => p.id === editingPartId)?.prices || []
          const existingDevicePrice = existingPrices.find((p: any) => p.device_type === formData.device_type)

          if (existingDevicePrice) {
             await supabase.from('parts_pricing').update({ price: parseFloat(formData.price) }).eq('id', existingDevicePrice.id)
          } else {
             await supabase.from('parts_pricing').insert([{
               part_id: editingPartId,
               price: parseFloat(formData.price),
               device_type: formData.device_type,
               created_by: user.id || null
             }])
          }
        }
        showNotification('Part updated successfully!')
      } else {
        // Insert new part
        const { data: newPart, error: partError } = await supabase
          .from('parts')
          .insert([partData])
          .select()
          .single()

        if (partError) throw partError

        // Insert new price if provided
        if (formData.price && parseFloat(formData.price) > 0 && newPart) {
           await supabase.from('parts_pricing').insert([{
             part_id: newPart.id,
             price: parseFloat(formData.price),
             device_type: formData.device_type,
             created_by: user.id || null
           }])
        }
        showNotification('Part added successfully!')
      }

      setFormData({ name: '', category: 'other', device_type: 'iOS', description: '', price: '' })
      setEditingPartId(null)
      setShowPartForm(false)
      fetchPartsWithPricing()
    } catch (error) {
      console.error('Error saving part:', error)
      showNotification('Error saving part', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePart = async (id: string, name: string) => {
    setConfirmDialog({
      show: true,
      title: 'Delete Part',
      message: `Are you sure you want to delete "${name}"? This will also remove all its pricing history.`,
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }))
          const { error } = await supabase.from('parts').delete().eq('id', id)
          
          if (error) throw error
          
          setParts(prev => prev.filter(p => p.id !== id))
          showNotification('Part deleted successfully!')
          closeConfirm()
        } catch (error) {
          console.error('Error deleting part:', error)
          showNotification('Failed to delete part. Please try again.', 'error')
          closeConfirm()
        }
      }
    })
  }

  const handleEditPart = (part: any) => {
    const partPrice = part.prices?.find((p: any) => p.device_type === part.device_type)?.price || ''
    setFormData({
      name: part.name,
      category: 'other',
      device_type: part.device_type,
      description: part.description || '',
      price: partPrice.toString()
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
      showNotification('Price updated!')
    } catch (error) {
      console.error('Error setting price:', error)
      showNotification('Error setting price', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePrice = async (priceId: string) => {
    setConfirmDialog({
      show: true,
      title: 'Remove Price',
      message: 'Are you sure you want to remove this specific price entry?',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }))
          const { error } = await supabase.from('parts_pricing').delete().eq('id', priceId)
          if (error) throw error
          fetchPartsWithPricing()
          showNotification('Price removed!')
          closeConfirm()
        } catch (error) {
          console.error('Error deleting price:', error)
          showNotification('Error deleting price', 'error')
          closeConfirm()
        }
      }
    })
  }

  const deviceTypes = ['all', ...Object.keys(DEVICE_TYPES)]

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDevice = selectedDeviceType === 'all' || part.device_type === selectedDeviceType
    return matchesSearch && matchesDevice
  })

  // No longer grouping by category
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
                setFormData({ name: '', category: 'other', device_type: 'iOS', description: '', price: '' })
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Price (₱)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
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
            placeholder="Search parts by name..."
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
                  ? 'bg-maroon-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Devices' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-slate-600">Loading parts...</p>
        </div>
      ) : filteredParts.length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="mx-auto text-slate-400 mb-3" size={40} />
          <p className="text-slate-600">No parts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredParts.map((part: any) => (
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
                      onClick={() => handleDeletePart(part.id, part.name)}
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
                      className="text-xs text-maroon-600 font-medium hover:text-maroon-700 flex items-center gap-1"
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
                          <span className="font-bold text-sm text-maroon-600">{formatPeso(price.price)}</span>
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
                      className="px-3 py-2 bg-maroon-600 text-white rounded-lg text-xs font-medium hover:bg-maroon-700 disabled:opacity-50"
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
      )}
      {/* Custom Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={confirmDialog.isLoading}
                className="px-6 py-2 bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-maroon-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {confirmDialog.isLoading ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
            notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' : 
            notification.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-700' :
            'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}>
            <span className="text-sm font-bold">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
