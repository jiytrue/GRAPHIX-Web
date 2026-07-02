import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Search, Plus, Minus, Monitor, Package, TrendingDown, TrendingUp, AlertTriangle, Wrench, ChevronDown, ChevronUp, Clock, Trash2, Edit2 } from 'lucide-react'
import { LCD_BRANDS, LCD_BRANCHES } from '../lib/constants'
import type { LcdInventoryItem, LcdStockLog } from '../lib/constants'

interface LcdInventoryProps {
  onBack?: () => void
  user?: any
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export default function LcdInventory({ onBack, user, showToast }: LcdInventoryProps) {
  const isAdmin = user?.role === 'admin' || user?.role === 'worker'

  // State
  const [inventory, setInventory] = useState<LcdInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState<string>('Villanueva')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({ lcd_name: '', brand: LCD_BRANDS[0], branch: 'Villanueva', quantity: 1 })

  // Use for repair modal
  const [repairModal, setRepairModal] = useState<{ show: boolean; item: LcdInventoryItem | null }>({ show: false, item: null })
  const [repairTicketId, setRepairTicketId] = useState('')
  const [repairNotes, setRepairNotes] = useState('')

  // Stock history
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [stockLogs, setStockLogs] = useState<Record<string, LcdStockLog[]>>({})
  const [logsLoading, setLogsLoading] = useState<string | null>(null)

  // Edit modal
  const [editModal, setEditModal] = useState<{ show: boolean; item: LcdInventoryItem | null }>({ show: false, item: null })
  const [editFormData, setEditFormData] = useState({ lcd_name: '', brand: '', quantity: 0 })

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; item: LcdInventoryItem | null }>({ show: false, item: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Saving state
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lcd_inventory')
        .select('*')
        .order('brand', { ascending: true })
        .order('lcd_name', { ascending: true })

      if (error) throw error
      setInventory(data || [])
    } catch (error) {
      console.error('Error fetching LCD inventory:', error)
      showToast?.('Error loading inventory', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStockLogs = async (inventoryId: string) => {
    try {
      setLogsLoading(inventoryId)
      const { data, error } = await supabase
        .from('lcd_stock_logs')
        .select('*')
        .eq('lcd_inventory_id', inventoryId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setStockLogs(prev => ({ ...prev, [inventoryId]: data || [] }))
    } catch (error) {
      console.error('Error fetching stock logs:', error)
    } finally {
      setLogsLoading(null)
    }
  }

  const handleToggleHistory = (itemId: string) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null)
    } else {
      setExpandedItemId(itemId)
      if (!stockLogs[itemId]) {
        fetchStockLogs(itemId)
      }
    }
  }

  const handleStockAdjust = async (item: LcdInventoryItem, delta: number) => {
    const newQty = item.quantity + delta
    if (newQty < 0) return

    try {
      setSavingId(item.id)

      // Update inventory
      const { error: updateError } = await supabase
        .from('lcd_inventory')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', item.id)

      if (updateError) throw updateError

      // Log the change
      const { error: logError } = await supabase
        .from('lcd_stock_logs')
        .insert([{
          lcd_inventory_id: item.id,
          change_type: delta > 0 ? 'stock_in' : 'stock_out',
          quantity_change: delta,
          previous_quantity: item.quantity,
          new_quantity: newQty,
          changed_by: user?.name || 'Unknown',
          notes: delta > 0 ? 'Stock added' : 'Stock removed',
        }])

      if (logError) console.error('Error logging stock change:', logError)

      // Update local state
      setInventory(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty, updated_at: new Date().toISOString() } : i))

      // Refresh logs if expanded
      if (expandedItemId === item.id) {
        fetchStockLogs(item.id)
      }

      showToast?.(`${item.lcd_name}: ${newQty} units`, 'success')
    } catch (error) {
      console.error('Error adjusting stock:', error)
      showToast?.('Error adjusting stock', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const handleUseForRepair = async () => {
    if (!repairModal.item) return
    const item = repairModal.item
    if (item.quantity <= 0) {
      showToast?.('No stock available!', 'error')
      return
    }

    const newQty = item.quantity - 1
    try {
      setSavingId(item.id)

      const { error: updateError } = await supabase
        .from('lcd_inventory')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', item.id)

      if (updateError) throw updateError

      const { error: logError } = await supabase
        .from('lcd_stock_logs')
        .insert([{
          lcd_inventory_id: item.id,
          change_type: 'used_for_repair',
          quantity_change: -1,
          previous_quantity: item.quantity,
          new_quantity: newQty,
          ticket_id: repairTicketId || null,
          notes: repairNotes || `Used for repair${repairTicketId ? ` (Ticket #${repairTicketId})` : ''}`,
          changed_by: user?.name || 'Unknown',
        }])

      if (logError) console.error('Error logging repair use:', logError)

      setInventory(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty, updated_at: new Date().toISOString() } : i))

      if (expandedItemId === item.id) {
        fetchStockLogs(item.id)
      }

      showToast?.(`${item.lcd_name} used for repair${repairTicketId ? ` (Ticket #${repairTicketId})` : ''}. ${newQty} remaining.`, 'success')
      setRepairModal({ show: false, item: null })
      setRepairTicketId('')
      setRepairNotes('')
    } catch (error) {
      console.error('Error using for repair:', error)
      showToast?.('Error processing repair use', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const handleAddLcd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFormData.lcd_name.trim()) {
      showToast?.('Please enter an LCD name', 'error')
      return
    }

    try {
      setSavingId('new')
      const { data, error } = await supabase
        .from('lcd_inventory')
        .insert([{
          lcd_name: addFormData.lcd_name.trim(),
          brand: addFormData.brand,
          branch: addFormData.branch,
          quantity: addFormData.quantity,
        }])
        .select()
        .single()

      if (error) throw error

      // Log initial stock
      if (data) {
        await supabase.from('lcd_stock_logs').insert([{
          lcd_inventory_id: data.id,
          change_type: 'stock_in',
          quantity_change: addFormData.quantity,
          previous_quantity: 0,
          new_quantity: addFormData.quantity,
          changed_by: user?.name || 'Unknown',
          notes: 'Initial stock entry',
        }])
      }

      showToast?.(`${addFormData.lcd_name} added to ${addFormData.branch} inventory!`, 'success')
      setAddFormData({ lcd_name: '', brand: LCD_BRANDS[0], branch: selectedBranch, quantity: 1 })
      setShowAddForm(false)
      fetchInventory()
    } catch (error) {
      console.error('Error adding LCD:', error)
      showToast?.('Error adding LCD', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const handleEditLcd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal.item) return
    const item = editModal.item

    try {
      setSavingId(item.id)
      const quantityChanged = editFormData.quantity !== item.quantity

      const { error: updateError } = await supabase
        .from('lcd_inventory')
        .update({
          lcd_name: editFormData.lcd_name.trim(),
          brand: editFormData.brand,
          quantity: editFormData.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (updateError) throw updateError

      // Log quantity change if it changed
      if (quantityChanged) {
        await supabase.from('lcd_stock_logs').insert([{
          lcd_inventory_id: item.id,
          change_type: 'adjustment',
          quantity_change: editFormData.quantity - item.quantity,
          previous_quantity: item.quantity,
          new_quantity: editFormData.quantity,
          changed_by: user?.name || 'Unknown',
          notes: `Manual adjustment from ${item.quantity} to ${editFormData.quantity}`,
        }])
      }

      showToast?.('LCD updated successfully!', 'success')
      setEditModal({ show: false, item: null })
      fetchInventory()
    } catch (error) {
      console.error('Error editing LCD:', error)
      showToast?.('Error updating LCD', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteLcd = async () => {
    if (!deleteConfirm.item) return
    try {
      setDeleteLoading(true)
      const { error } = await supabase
        .from('lcd_inventory')
        .delete()
        .eq('id', deleteConfirm.item.id)

      if (error) throw error

      setInventory(prev => prev.filter(i => i.id !== deleteConfirm.item!.id))
      showToast?.(`${deleteConfirm.item.lcd_name} deleted.`, 'success')
      setDeleteConfirm({ show: false, item: null })
    } catch (error) {
      console.error('Error deleting LCD:', error)
      showToast?.('Error deleting LCD', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesBranch = item.branch === selectedBranch
    const matchesBrand = selectedBrand === 'all' || item.brand === selectedBrand
    const matchesSearch = searchTerm === '' || item.lcd_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesBranch && matchesBrand && matchesSearch
  })

  // Stats
  const branchItems = inventory.filter(i => i.branch === selectedBranch)
  const totalUniqueLcds = branchItems.length
  const totalUnitsInStock = branchItems.reduce((sum, i) => sum + i.quantity, 0)
  const outOfStockCount = branchItems.filter(i => i.quantity === 0).length
  const lowStockCount = branchItems.filter(i => i.quantity > 0 && i.quantity <= 2).length

  // Get available brands for the selected branch
  const availableBrands = [...new Set(branchItems.map(i => i.brand))].sort()

  const getStockColor = (qty: number) => {
    if (qty === 0) return 'text-rose-600 bg-rose-50 border-rose-200'
    if (qty <= 2) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  }

  const getStockBadge = (qty: number) => {
    if (qty === 0) return 'bg-rose-100 text-rose-700'
    if (qty <= 2) return 'bg-amber-100 text-amber-700'
    return 'bg-emerald-100 text-emerald-700'
  }

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'stock_in': return { label: 'Stock In', color: 'text-emerald-600', icon: <TrendingUp size={12} /> }
      case 'stock_out': return { label: 'Stock Out', color: 'text-rose-600', icon: <TrendingDown size={12} /> }
      case 'adjustment': return { label: 'Adjustment', color: 'text-blue-600', icon: <Edit2 size={12} /> }
      case 'used_for_repair': return { label: 'Used for Repair', color: 'text-purple-600', icon: <Wrench size={12} /> }
      default: return { label: type, color: 'text-slate-600', icon: null }
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-slide-in">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-navy-600 hover:text-navy-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-maroon-500 to-maroon-700 rounded-xl shadow-lg">
              <Monitor size={24} className="text-white" />
            </div>
            LCD Inventory
          </h1>
          <p className="text-slate-600 mt-1">Track and manage LCD stocks across branches</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              if (!showAddForm) {
                setAddFormData({ ...addFormData, branch: selectedBranch })
              }
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            {showAddForm ? 'Cancel' : 'Add LCD'}
          </button>
        )}
      </div>

      {/* Branch Tabs */}
      <div className="flex gap-2 mb-6">
        {LCD_BRANCHES.map(branch => (
          <button
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              selectedBranch === branch
                ? 'bg-maroon-600 text-white shadow-lg shadow-maroon-600/20 scale-[1.02]'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${selectedBranch === branch ? 'bg-white' : 'bg-slate-300'}`} />
              {branch}
            </span>
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-blue-500" />
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Unique LCDs</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalUniqueLcds}</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-500" />
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Total Units</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalUnitsInStock}</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Low Stock</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lowStockCount}</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-rose-50 to-white border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-rose-500" />
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Out of Stock</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{outOfStockCount}</p>
        </div>
      </div>

      {/* Add LCD Form */}
      {isAdmin && showAddForm && (
        <div className="card p-6 mb-6 border-2 border-dashed border-maroon-200 bg-maroon-50/30">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
            <Plus size={20} className="text-maroon-600" />
            Add New LCD to Inventory
          </h3>
          <form onSubmit={handleAddLcd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">LCD Name / Models *</label>
              <input
                type="text"
                value={addFormData.lcd_name}
                onChange={e => setAddFormData({ ...addFormData, lcd_name: e.target.value })}
                placeholder="e.g., A3s / A7 / A11k"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Brand *</label>
              <select
                value={addFormData.brand}
                onChange={e => setAddFormData({ ...addFormData, brand: e.target.value })}
                className="w-full"
              >
                {LCD_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Branch *</label>
              <select
                value={addFormData.branch}
                onChange={e => setAddFormData({ ...addFormData, branch: e.target.value })}
                className="w-full"
              >
                {LCD_BRANCHES.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={addFormData.quantity}
                onChange={e => setAddFormData({ ...addFormData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <button type="submit" disabled={savingId === 'new'} className="btn btn-primary w-full">
                {savingId === 'new' ? 'Adding...' : 'Add LCD to Inventory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Brand Filter */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 w-full">
          <Search className="text-slate-400 flex-shrink-0" size={20} />
          <input
            type="text"
            placeholder="Search LCDs by model name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
              selectedBrand === 'all'
                ? 'bg-maroon-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Brands
          </button>
          {availableBrands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                selectedBrand === brand
                  ? 'bg-maroon-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Monitor className="text-slate-300" size={40} />
            <p className="text-slate-500 font-medium">Loading inventory...</p>
          </div>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="card p-8 text-center">
          <Monitor className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">No LCDs found</p>
          <p className="text-slate-400 text-sm mt-1">
            {searchTerm ? 'Try a different search term' : 'No inventory for this branch/brand filter'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-3 font-medium">
            Showing {filteredInventory.length} LCD{filteredInventory.length !== 1 ? 's' : ''} 
            {selectedBrand !== 'all' && ` · ${selectedBrand}`}
          </p>
          <div className="space-y-3 mb-8">
            {filteredInventory.map(item => (
              <div key={item.id} className="card overflow-hidden transition-all hover:shadow-md">
                {/* Main Row */}
                <div className="p-4 flex items-center gap-4 flex-wrap">
                  {/* Stock Badge */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border-2 flex-shrink-0 ${getStockColor(item.quantity)}`}>
                    {item.quantity}
                  </div>

                  {/* LCD Info */}
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.lcd_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStockBadge(item.quantity)}`}>
                        {item.quantity === 0 ? 'Out of Stock' : item.quantity <= 2 ? 'Low Stock' : 'In Stock'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.brand}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isAdmin && (
                      <>
                        {/* Quick -1 */}
                        <button
                          onClick={() => handleStockAdjust(item, -1)}
                          disabled={item.quantity <= 0 || savingId === item.id}
                          className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed border border-rose-100"
                          title="Remove 1"
                        >
                          <Minus size={16} />
                        </button>

                        {/* Quick +1 */}
                        <button
                          onClick={() => handleStockAdjust(item, 1)}
                          disabled={savingId === item.id}
                          className="w-9 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 border border-emerald-100"
                          title="Add 1"
                        >
                          <Plus size={16} />
                        </button>

                        <div className="w-px h-8 bg-slate-200 mx-1" />

                        {/* Use for Repair */}
                        <button
                          onClick={() => setRepairModal({ show: true, item })}
                          disabled={item.quantity <= 0}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-purple-100"
                          title="Use for repair"
                        >
                          <Wrench size={14} />
                          <span className="hidden sm:inline">Use for Repair</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditFormData({ lcd_name: item.lcd_name, brand: item.brand, quantity: item.quantity })
                            setEditModal({ show: true, item })
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit LCD"
                        >
                          <Edit2 size={14} className="text-slate-400" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm({ show: true, item })}
                          className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete LCD"
                        >
                          <Trash2 size={14} className="text-rose-400" />
                        </button>
                      </>
                    )}

                    {/* History Toggle */}
                    <button
                      onClick={() => handleToggleHistory(item.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View stock history"
                    >
                      {expandedItemId === item.id ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded History */}
                {expandedItemId === item.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock size={12} />
                      Recent Stock History
                    </p>
                    {logsLoading === item.id ? (
                      <p className="text-xs text-slate-400 animate-pulse">Loading history...</p>
                    ) : (stockLogs[item.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No stock changes recorded yet</p>
                    ) : (
                      <div className="space-y-2">
                        {(stockLogs[item.id] || []).map(log => {
                          const changeInfo = getChangeTypeLabel(log.change_type)
                          return (
                            <div key={log.id} className="flex items-center gap-3 text-xs bg-white rounded-lg px-3 py-2 border border-slate-100">
                              <span className={`flex items-center gap-1 font-bold ${changeInfo.color} min-w-[120px]`}>
                                {changeInfo.icon}
                                {changeInfo.label}
                              </span>
                              <span className={`font-mono font-bold ${log.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                              </span>
                              <span className="text-slate-400">
                                {log.previous_quantity} → {log.new_quantity}
                              </span>
                              {log.ticket_id && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-bold">
                                  #{log.ticket_id}
                                </span>
                              )}
                              {log.changed_by && (
                                <span className="text-slate-400 ml-auto hidden sm:inline">by {log.changed_by}</span>
                              )}
                              <span className="text-slate-300 ml-auto sm:ml-0">
                                {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Use for Repair Modal */}
      {repairModal.show && repairModal.item && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRepairModal({ show: false, item: null })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Wrench size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Use LCD for Repair</h3>
                  <p className="text-xs text-slate-500">{repairModal.item.lcd_name}</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-100">
                <p className="text-sm text-purple-700">
                  This will deduct <strong>1 unit</strong> from stock. 
                  Current: <strong>{repairModal.item.quantity}</strong> → New: <strong>{repairModal.item.quantity - 1}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ticket ID (optional)</label>
                  <input
                    type="text"
                    value={repairTicketId}
                    onChange={e => setRepairTicketId(e.target.value)}
                    placeholder="e.g., 123"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={repairNotes}
                    onChange={e => setRepairNotes(e.target.value)}
                    placeholder="e.g., Customer walk-in"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 flex gap-3 justify-end">
              <button
                onClick={() => { setRepairModal({ show: false, item: null }); setRepairTicketId(''); setRepairNotes('') }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUseForRepair}
                disabled={savingId === repairModal.item.id}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingId === repairModal.item.id ? 'Processing...' : 'Confirm Use'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit LCD Modal */}
      {editModal.show && editModal.item && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditModal({ show: false, item: null })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Edit2 size={18} className="text-maroon-600" />
                Edit LCD
              </h3>
              <form onSubmit={handleEditLcd} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">LCD Name *</label>
                  <input
                    type="text"
                    value={editFormData.lcd_name}
                    onChange={e => setEditFormData({ ...editFormData, lcd_name: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                  <select
                    value={editFormData.brand}
                    onChange={e => setEditFormData({ ...editFormData, brand: e.target.value })}
                    className="w-full"
                  >
                    {LCD_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.quantity}
                    onChange={e => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModal({ show: false, item: null })}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingId === editModal.item.id}
                    className="flex-1 px-6 py-2 bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-maroon-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {savingId === editModal.item.id ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && deleteConfirm.item && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirm({ show: false, item: null })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete LCD</h3>
              <p className="text-slate-600 text-sm text-center">
                Are you sure you want to delete <strong>{deleteConfirm.item.lcd_name}</strong>? This will also remove all its stock history.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, item: null })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLcd}
                disabled={deleteLoading}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
