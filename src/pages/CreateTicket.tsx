import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { PHONE_BRANDS, BRAND_MODELS, REPAIR_TYPES } from '../lib/constants'
import { generateNumericTicketId } from '../lib/utils'
import { sendTechnicianEmail, sendTicketCreatedEmail } from '../lib/email'
import {
  ArrowLeft, ArrowRight, CheckCircle, Check, Camera, ImagePlus, X, Plus,
  Smartphone, Monitor, Hand, ShieldAlert, BatteryCharging, PlugZap, Plug,
  Power, Volume2, Headphones, Mic, SwitchCamera, SignalZero, Wifi,
  Bluetooth, Layers, RotateCcw, Droplets, Lock, Download, Bug,
  MoreHorizontal, Wrench, User, DollarSign, FileText, Search
} from 'lucide-react'
// Camera icon already imported above

interface CreateTicketProps {
  onBack: () => void
  onSuccess: () => void
}

const TOTAL_STEPS = 6

const STEP_LABELS = [
  'Brand',
  'Model',
  'Repair',
  'Cost & Tech',
  'Customer',
  'Photos',
]

// Icon mapping for repair types
const ICON_MAP: Record<string, any> = {
  Smartphone, Monitor, Hand, ShieldAlert, BatteryCharging, PlugZap, Plug,
  Power, Volume2, Headphones, Mic, SwitchCamera, SignalZero, Wifi,
  Bluetooth, Layers, RotateCcw, Droplets, Lock, Download, Bug, MoreHorizontal,
  Camera,
}

// Image compression helper
const compressImage = (base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } else {
        resolve(base64Str)
      }
    }
    img.onerror = () => {
      resolve(base64Str)
    }
  })
}

export default function CreateTicket({ onBack, onSuccess }: CreateTicketProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animKey, setAnimKey] = useState(0)

  // Step 1: Brand
  const [selectedBrand, setSelectedBrand] = useState('')

  // Step 2: Model
  const [selectedModel, setSelectedModel] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [showCustomModel, setShowCustomModel] = useState(false)
  const [modelSearch, setModelSearch] = useState('')

  // Step 3: Repair Types
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([])

  // Step 4: Cost & Technician
  const [costEstimate, setCostEstimate] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [technicians, setTechnicians] = useState<string[]>([])

  // Step 5: Customer Info
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [receivedBy, setReceivedBy] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Step 6: Photos
  const [devicePhotos, setDevicePhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Submit state
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [generatedTicketId, setGeneratedTicketId] = useState('')

  useEffect(() => {
    fetchTechnicians()
  }, [])

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

  // Navigation
  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setDirection('forward')
      setAnimKey(prev => prev + 1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setDirection('backward')
      setAnimKey(prev => prev + 1)
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return !!selectedBrand
      case 2: return !!(selectedModel || customModel)
      case 3: return selectedRepairs.length > 0
      case 4: return true // cost & tech are optional
      case 5: return !!(customerName && customerPhone)
      case 6: return true // photos optional
      default: return false
    }
  }

  // Repair toggle
  const toggleRepair = (id: string) => {
    setSelectedRepairs(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    )
  }

  // Photo handling
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const originalBase64 = ev.target.result as string
          try {
            const compressedBase64 = await compressImage(originalBase64)
            setDevicePhotos(prev => [...prev, compressedBase64])
          } catch (err) {
            console.error('Compression error, using original:', err)
            setDevicePhotos(prev => [...prev, originalBase64])
          }
        }
      }
      reader.readAsDataURL(file)
    })
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setDevicePhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Get the final model string
  const getFinalModel = (): string => {
    if (showCustomModel && customModel) return customModel
    return selectedModel || customModel
  }

  // Get device type from brand
  const getDeviceType = (): string => {
    if (selectedBrand === 'iPhone') return 'iOS'
    if (['iPad'].includes(selectedBrand)) return 'iPad'
    return 'Android'
  }

  // Get repair description string
  const getRepairDescription = (): string => {
    return selectedRepairs
      .map(id => REPAIR_TYPES.find(r => r.id === id)?.name || id)
      .join(', ')
  }

  // Submit
  const handleSubmit = async () => {
    if (!customerName || !customerPhone) {
      alert('Please fill in customer name and phone number')
      return
    }

    try {
      setLoading(true)
      const ticketId = generateNumericTicketId()
      setGeneratedTicketId(ticketId)

      const issueDescription = getRepairDescription()
      const deviceType = getDeviceType()
      const deviceModel = getFinalModel()

      const insertData: Record<string, any> = {
        ticket_id: ticketId,
        customer_name: customerName,
        customer_phone: customerPhone,
        device_type: deviceType,
        device_model: deviceModel,
        issue_description: issueDescription + (additionalNotes ? `\n\nNotes: ${additionalNotes}` : ''),
        assigned_technician: selectedTechnician || null,
        status: 'diagnosing',
        notes: '',
        cost_estimate: costEstimate ? parseFloat(costEstimate) : null,
        amount_paid: 0,
        payment_status: 'unpaid',
        device_photos: devicePhotos.length > 0 ? devicePhotos : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (receivedBy) insertData.received_by = receivedBy
      if (targetDate) insertData.target_completion_date = targetDate

      const { error } = await supabase.from('tickets').insert([insertData])
      if (error) throw error

      // Send email notification to ALL staff about new ticket
      sendTicketCreatedEmail({
        ticketId,
        customerName,
        deviceType,
        deviceModel,
        issueDescription,
        assignedTechnician: selectedTechnician || undefined,
        amountToPay: costEstimate || undefined,
      })

      // Also send individual email to assigned technician
      if (selectedTechnician) {
        sendTechnicianEmail({
          technicianName: selectedTechnician,
          ticketId,
          customerName,
          deviceType,
          deviceModel,
          issueDescription,
        })
      }

      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================
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
          
          {/* Component Container Box Reminder (Enlarged) */}
          <div className="bg-amber-50 border-l-8 border-amber-500 border-t border-r border-b border-amber-200 p-6 rounded-r-xl text-left space-y-2.5 shadow-sm">
            <h4 className="text-amber-900 font-black flex items-center gap-2 text-base uppercase tracking-wide">
              ⚠️ CRITICAL REMINDER FOR TECHNICIAN
            </h4>
            <p className="text-amber-800 text-sm font-bold leading-relaxed">
              Always safely put ALL phone parts and components (including the SIM tray, screws, and brackets) together in 1 dedicated container box. Do not separate them!
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => window.print()} className="flex-1 btn btn-primary">
              Print Label
            </button>
            <button onClick={() => onSuccess()} className="flex-1 btn btn-secondary">
              OK / Understood
            </button>
          </div>
        </div>

        {/* Hidden Thermal Receipt Print Section */}
        <div className="print:block hidden">
          <div className="thermal-receipt mx-auto">
            <div className="thermal-receipt-center">
              {/* Thermal friendly Phone Logo */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="mx-auto mb-1">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className="thermal-receipt-header">GRAPHIX</div>
              <div className="thermal-receipt-subheader">PHONE REPAIR SERVICE</div>
              <div className="thermal-receipt-divider" />
              <div className="thermal-receipt-title">REPAIR TICKET</div>
              <div className="text-xl font-bold font-mono">#{generatedTicketId}</div>
              <div className="text-[9px] text-slate-500 mt-1">
                Date: {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div className="thermal-receipt-divider" />
            
            <div className="space-y-1">
              <div className="thermal-receipt-row">
                <span className="thermal-receipt-row-label">Customer:</span>
                <span className="thermal-receipt-row-val">{customerName}</span>
              </div>
              <div className="thermal-receipt-row">
                <span className="thermal-receipt-row-label">Phone:</span>
                <span className="thermal-receipt-row-val">{customerPhone}</span>
              </div>
              <div className="thermal-receipt-row">
                <span className="thermal-receipt-row-label">Device:</span>
                <span className="thermal-receipt-row-val">{getDeviceType()} {getFinalModel()}</span>
              </div>
              <div className="thermal-receipt-row">
                <span className="thermal-receipt-row-label">Status:</span>
                <span className="thermal-receipt-row-val uppercase">diagnosing</span>
              </div>
              {selectedTechnician && (
                <div className="thermal-receipt-row">
                  <span className="thermal-receipt-row-label">Tech:</span>
                  <span className="thermal-receipt-row-val">{selectedTechnician}</span>
                </div>
              )}
              {receivedBy && (
                <div className="thermal-receipt-row">
                  <span className="thermal-receipt-row-label">Recv By:</span>
                  <span className="thermal-receipt-row-val">{receivedBy}</span>
                </div>
              )}
              {costEstimate && (
                <div className="thermal-receipt-row font-bold text-sm mt-2 pt-2 border-t border-dashed border-black">
                  <span className="thermal-receipt-row-label">TOTAL:</span>
                  <span className="thermal-receipt-row-val">
                    ₱{parseFloat(costEstimate).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
            
            <div className="thermal-receipt-divider" />
            
            <div>
              <span className="thermal-receipt-bold">Repairs Needed:</span>
              <div className="text-[10px] mt-1 italic leading-tight whitespace-pre-wrap">{getRepairDescription()}</div>
            </div>
            
            {additionalNotes && (
              <div className="thermal-receipt-notes">
                <span className="font-bold">Notes:</span>
                <p>{additionalNotes}</p>
              </div>
            )}
            
            <div className="thermal-receipt-footer">
              <div className="thermal-receipt-bold mb-1">Thank you for choosing Graphix!</div>
              <div className="text-[9px] mt-2 font-medium">
                Facebook Page:<br />
                Graphix Villanueva / Graphix Jasaan
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // PROGRESS BAR
  // ============================================================
  const renderProgressBar = () => (
    <div className="wizard-progress mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={step} className="wizard-progress-step">
            <div
              className={`wizard-progress-dot ${
                isCompleted ? 'completed' : isActive ? 'active' : 'pending'
              }`}
            >
              {isCompleted ? <Check size={14} /> : step}
            </div>
            {step < TOTAL_STEPS && (
              <div
                className={`wizard-progress-line ${
                  isCompleted ? 'completed' : isActive ? 'active' : ''
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  // ============================================================
  // STEP 1: BRAND SELECTION
  // ============================================================
  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-100 flex items-center justify-center">
            <Smartphone size={20} className="text-maroon-600" />
          </div>
          Select Brand
        </h2>
        <p className="text-slate-500 mt-2 ml-13">Choose the phone brand for this repair</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {PHONE_BRANDS.map((brand, index) => (
          <button
            key={brand.name}
            className={`brand-card ${selectedBrand === brand.name ? 'selected' : ''}`}
            onClick={() => {
              setSelectedBrand(brand.name)
              setSelectedModel('')
              setCustomModel('')
              setShowCustomModel(false)
              setModelSearch('')
            }}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div
              className="brand-logo"
              style={{ background: brand.color, color: brand.textColor }}
            >
              {brand.letter}
            </div>
            <span className="brand-name">{brand.name}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // ============================================================
  // STEP 2: MODEL SELECTION
  // ============================================================
  const renderStep2 = () => {
    const models = BRAND_MODELS[selectedBrand] || []
    const filteredModels = modelSearch
      ? models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()))
      : models

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-100 flex items-center justify-center">
              <FileText size={20} className="text-maroon-600" />
            </div>
            Select Model
          </h2>
          <p className="text-slate-500 mt-2">
            Choose or enter the model for <span className="font-semibold text-maroon-600">{selectedBrand}</span>
          </p>
        </div>

        {/* Search */}
        {models.length > 0 && (
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="pl-11"
              style={{ borderRadius: '14px' }}
            />
          </div>
        )}

        {/* Model chips */}
        {filteredModels.length > 0 && !showCustomModel && (
          <div className="flex flex-wrap gap-2 mb-5 max-h-[340px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredModels.map(model => (
              <button
                key={model}
                className={`model-chip ${selectedModel === model ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedModel(model)
                  setCustomModel('')
                  setShowCustomModel(false)
                }}
              >
                {model}
              </button>
            ))}
          </div>
        )}

        {/* Custom model toggle */}
        <div className="mt-4">
          <button
            onClick={() => {
              setShowCustomModel(!showCustomModel)
              if (!showCustomModel) {
                setSelectedModel('')
              }
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-maroon-300 text-maroon-600 font-semibold hover:bg-maroon-50 transition-all w-full justify-center"
          >
            <Plus size={18} />
            {showCustomModel ? 'Choose from list' : 'Enter Custom Model'}
          </button>

          {showCustomModel && (
            <div className="mt-4 wizard-fade-up">
              <input
                type="text"
                placeholder="e.g., Galaxy A06 4G, iPhone 16 Pro Max..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="text-lg"
                style={{ borderRadius: '14px', padding: '16px 20px' }}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Selected indicator */}
        {(selectedModel || customModel) && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 wizard-fade-up">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-emerald-600 font-medium">Selected Model</p>
              <p className="font-bold text-emerald-800">{getFinalModel()}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // STEP 3: REPAIR TYPE
  // ============================================================
  const renderStep3 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-100 flex items-center justify-center">
            <Wrench size={20} className="text-maroon-600" />
          </div>
          Repair Type
        </h2>
        <p className="text-slate-500 mt-2">Select all that apply — you can choose multiple</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {REPAIR_TYPES.map((repair, index) => {
          const IconComponent = ICON_MAP[repair.icon] || MoreHorizontal
          return (
            <button
              key={repair.id}
              className={`repair-card ${selectedRepairs.includes(repair.id) ? 'selected' : ''}`}
              onClick={() => toggleRepair(repair.id)}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <div
                className="repair-icon-wrap"
                style={{ background: `${repair.color}15` }}
              >
                <IconComponent size={22} style={{ color: repair.color }} />
              </div>
              <span className="repair-name">{repair.name}</span>
            </button>
          )
        })}
      </div>

      {selectedRepairs.length > 0 && (
        <div className="mt-5 p-4 bg-maroon-50 border border-maroon-200 rounded-xl wizard-fade-up">
          <p className="text-sm text-maroon-600 font-medium mb-2">
            Selected ({selectedRepairs.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedRepairs.map(id => {
              const repair = REPAIR_TYPES.find(r => r.id === id)
              return repair ? (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-maroon-200 text-sm font-medium text-maroon-700"
                >
                  {repair.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleRepair(id) }}
                    className="text-maroon-400 hover:text-maroon-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )

  // ============================================================
  // STEP 4: COST & TECHNICIAN
  // ============================================================
  const renderStep4 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-100 flex items-center justify-center">
            <DollarSign size={20} className="text-maroon-600" />
          </div>
          Cost & Technician
        </h2>
        <p className="text-slate-500 mt-2">Set the estimated cost and assign a technician</p>
      </div>

      {/* Cost Estimate */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Estimated Repair Cost (₱)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₱</span>
          <input
            type="number"
            value={costEstimate}
            onChange={(e) => setCostEstimate(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="text-xl font-bold pl-10"
            style={{ borderRadius: '14px', padding: '16px 20px 16px 36px' }}
          />
        </div>
      </div>

      {/* Technician Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Assign Technician
        </label>

        {/* Unassigned option */}
        <button
          className={`tech-card mb-3 ${selectedTechnician === '' ? 'selected' : ''}`}
          onClick={() => setSelectedTechnician('')}
        >
          <div className="tech-avatar" style={{ background: '#6B7280' }}>
            <User size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Unassigned</p>
            <p className="text-xs text-slate-500">Assign later</p>
          </div>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {technicians.map(tech => (
            <button
              key={tech}
              className={`tech-card ${selectedTechnician === tech ? 'selected' : ''}`}
              onClick={() => setSelectedTechnician(tech)}
            >
              <div className="tech-avatar">
                {tech.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{tech}</p>
                <p className="text-xs text-slate-500">Technician</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ============================================================
  // STEP 5: CUSTOMER INFO
  // ============================================================
  const renderStep5 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-100 flex items-center justify-center">
            <User size={20} className="text-maroon-600" />
          </div>
          Customer Information
        </h2>
        <p className="text-slate-500 mt-2">Enter the customer's details</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Full Name <span className="text-maroon-600">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Customer full name"
              style={{ borderRadius: '14px' }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Phone Number <span className="text-maroon-600">*</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              placeholder="+63 908 123 4567"
              style={{ borderRadius: '14px' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Received By
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Name of person who received"
              style={{ borderRadius: '14px' }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Target Completion
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ borderRadius: '14px' }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Additional Notes
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={4}
            placeholder="Any extra details about the device condition, passcode, accessories, etc."
            style={{ borderRadius: '14px' }}
          />
        </div>
      </div>
    </div>
  )

  // ============================================================
  // STEP 6: DEVICE PHOTOS & REVIEW
  // ============================================================
  const renderStep6 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-100 flex items-center justify-center">
            <Camera size={20} className="text-maroon-600" />
          </div>
          Device Photos & Review
        </h2>
        <p className="text-slate-500 mt-2">Take or upload photos of the device, then review</p>
      </div>

      {/* Photo Capture */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-maroon-200 bg-maroon-50 text-maroon-700 font-semibold hover:bg-maroon-100 transition-all active:scale-95"
          >
            <Camera size={20} />
            Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition-all active:scale-95"
          >
            <ImagePlus size={20} />
            Choose from Gallery
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Photo previews */}
        {devicePhotos.length > 0 && (
          <div className="photo-preview-grid wizard-fade-up">
            {devicePhotos.map((photo, index) => (
              <div key={index} className="photo-preview-item">
                <img src={photo} alt={`Device photo ${index + 1}`} />
                <button
                  className="photo-delete"
                  onClick={() => removePhoto(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {devicePhotos.length === 0 && (
          <div
            className="photo-capture-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={40} className="mx-auto text-maroon-300 mb-3" />
            <p className="text-slate-500 font-medium">No photos yet</p>
            <p className="text-sm text-slate-400 mt-1">Tap to add device photos</p>
          </div>
        )}
      </div>

      {/* Review Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-maroon-600" />
          Ticket Summary
        </h3>

        <div className="space-y-0">
          <div className="summary-row">
            <span className="summary-label">Brand</span>
            <span className="summary-value">{selectedBrand}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Model</span>
            <span className="summary-value">{getFinalModel()}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Repair Type</span>
            <span className="summary-value">{getRepairDescription()}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Estimated Cost</span>
            <span className="summary-value">
              {costEstimate ? `₱${parseFloat(costEstimate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'Not set'}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Technician</span>
            <span className="summary-value">{selectedTechnician || 'Unassigned'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Customer</span>
            <span className="summary-value">{customerName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Phone</span>
            <span className="summary-value">{customerPhone}</span>
          </div>
          {receivedBy && (
            <div className="summary-row">
              <span className="summary-label">Received By</span>
              <span className="summary-value">{receivedBy}</span>
            </div>
          )}
          {targetDate && (
            <div className="summary-row">
              <span className="summary-label">Target Date</span>
              <span className="summary-value">{targetDate}</span>
            </div>
          )}
          {devicePhotos.length > 0 && (
            <div className="summary-row">
              <span className="summary-label">Photos</span>
              <span className="summary-value">{devicePhotos.length} photo(s) attached</span>
            </div>
          )}
          {additionalNotes && (
            <div className="summary-row">
              <span className="summary-label">Notes</span>
              <span className="summary-value">{additionalNotes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ============================================================
  // RENDER CURRENT STEP
  // ============================================================
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      default: return null
    }
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="max-w-3xl mx-auto animate-slide-in">
      {/* Back to dashboard */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-maroon-600 hover:text-maroon-700 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card p-6 sm:p-8">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Repair Ticket</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Step {currentStep} of {TOTAL_STEPS} — {STEP_LABELS[currentStep - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Content with Animation */}
        <div
          key={animKey}
          className={direction === 'forward' ? 'wizard-step-forward' : 'wizard-step-backward'}
        >
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="wizard-nav">
          {currentStep > 1 && (
            <button className="btn-back" onClick={goBack}>
              <ArrowLeft size={18} />
              Back
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              className="btn-next"
              onClick={goNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="btn-next"
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              style={{
                background: loading
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #059669, #047857)',
              }}
            >
              {loading ? (
                <>Creating Ticket...</>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Create Ticket
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
