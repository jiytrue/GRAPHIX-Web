import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import CreateTicket from './pages/CreateTicket'
import TicketDetail from './pages/TicketDetail'
import Login from './pages/Login'
import AdminPartsManagement from './pages/AdminPartsManagement'
import Navigation from './components/Navigation'

type PageType = 'dashboard' | 'create' | 'detail' | 'admin-parts'

// Toast notification system
type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: number
  message: string
  type: ToastType
  exiting?: boolean
}

let toastId = 0

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 250)
    }, 3000)
  }

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('graphix_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem('graphix_user')
      }
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    localStorage.setItem('graphix_user', JSON.stringify(userData))
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('graphix_user')
    setCurrentPage('dashboard')
  }

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setCurrentPage('detail')
  }

  const handleCreateTicket = () => {
    setCurrentPage('create')
  }

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard')
    setSelectedTicketId(null)
  }

  const handleAdminParts = () => {
    if (user?.role === 'admin') {
      setCurrentPage('admin-parts')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-900">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation 
        onCreateClick={handleCreateTicket} 
        onDashboardClick={handleBackToDashboard}
        user={user}
        onLogout={handleLogout}
        onAdminClick={handleAdminParts}
      />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {currentPage === 'dashboard' && (
          <Dashboard onSelectTicket={handleSelectTicket} showToast={showToast} />
        )}
        {currentPage === 'create' && (
          <CreateTicket onBack={handleBackToDashboard} onSuccess={handleBackToDashboard} />
        )}
        {currentPage === 'detail' && selectedTicketId && (
          <TicketDetail 
            ticketId={selectedTicketId} 
            onBack={handleBackToDashboard} 
            user={user}
            showToast={showToast}
          />
        )}
        {currentPage === 'admin-parts' && (
          <AdminPartsManagement onBack={handleBackToDashboard} />
        )}
      </main>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
            >
              <span>
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'info' && 'ℹ'}
              </span>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
