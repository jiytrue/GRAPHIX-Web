import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Eye, ArrowLeft } from 'lucide-react'

interface PartsPriceProps {
  onBack?: () => void
}

export default function PartsPrice({ onBack }: PartsPriceProps) {
  const [pricing, setPricing] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDeviceType, setSelectedDeviceType] = useState('iPhone')
  const [loading, setLoading] = useState(true)

  const deviceTypes = ['iPhone', 'Samsung', 'Tecno', 'Infinix', 'Realme', 'Redmi', 'Vivo', 'OPPO', 'OnePlus', 'iPad', 'Other']

  useEffect(() => {
    fetchPricing()
  }, [selectedDeviceType])

  const fetchPricing = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('parts_pricing')
        .select('id, part_id, price, device_type, parts(id, name, category, device_type)')
        .eq('device_type', selectedDeviceType)
        .order('price', { ascending: true })

      if (error) throw error
      setPricing(data || [])
    } catch (error) {
      console.error('Error fetching pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPricing = pricing.filter(item => {
    const partName = item.parts?.name?.toLowerCase() || ''
    const category = item.parts?.category?.toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase()
    return partName.includes(searchLower) || category.includes(searchLower)
  })

  return (
    <div className="max-w-6xl mx-auto animate-slide-in">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-maroon-600 hover:text-maroon-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Parts Price List</h1>
        <p className="text-slate-600 mt-1">View prices for repair parts</p>
      </div>

      {/* Device Type Filter */}
      <div className="card p-4 mb-6">
        <p className="text-sm font-medium text-slate-700 mb-3">Filter by Device Type:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {deviceTypes.map(type => (
            <button
              key={type}
              onClick={() => {
                setSelectedDeviceType(type)
                setSearchTerm('')
              }}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedDeviceType === type
                  ? 'bg-maroon-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Pricing Table */}
      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-slate-600">Loading prices...</p>
        </div>
      ) : filteredPricing.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPricing.map(item => (
            <div key={item.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">{item.parts?.name}</h3>
                <p className="text-xs text-slate-500">Category: {item.parts?.category}</p>
                <p className="text-xs text-slate-500">Device: {item.device_type}</p>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-2xl font-bold text-maroon-600">
                    ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Eye className="mx-auto text-slate-400 mb-3" size={40} />
          <p className="text-slate-600">No parts found</p>
        </div>
      )}
    </div>
  )
}
