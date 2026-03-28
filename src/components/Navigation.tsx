import { useState } from 'react'
import { Plus, LogOut, Settings, Menu, X, Home, ShoppingCart } from 'lucide-react'

interface NavigationProps {
  onCreateClick: () => void
  onDashboardClick: () => void
  user?: any
  onLogout?: () => void
  onAdminClick?: () => void
  onOrdersClick?: () => void
}

export default function Navigation({ onCreateClick, onDashboardClick, user, onLogout, onAdminClick, onOrdersClick }: NavigationProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <nav className="bg-slate-900 border-b border-white/5 sticky top-0 z-50 shadow-lg backdrop-blur-md bg-slate-900/95">
        <div className="container mx-auto px-4 sm:px-6 py-3 max-w-7xl flex justify-between items-center">
          {/* Logo and Title - clickable to go home */}
          <button
            onClick={onDashboardClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/graphix-logo.png" alt="Graphix" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
            <div className="flex flex-col text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Graphix</h1>
              <p className="text-[10px] text-maroon-400 font-black tracking-[0.2em] -mt-1 uppercase">Phone Repair</p>
            </div>
          </button>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onDashboardClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white/80 border border-white/5"
            >
              <Home size={16} />
              Dashboard
            </button>

            <button
              onClick={onCreateClick}
              className="btn btn-primary group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              New Ticket
            </button>

            {user && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-maroon-600 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white/90 hidden lg:inline">{user.name}</span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-200">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
                          user.role === 'technician'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'worker'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-maroon-100 text-maroon-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' : user.role === 'worker' ? 'Worker' : 'Technician'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onAdminClick?.()
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Settings size={16} />
                        Parts & Pricing
                      </button>

                      <button
                        onClick={() => {
                          onOrdersClick?.()
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Parts Orders
                      </button>

                      <button
                        onClick={() => {
                          onLogout?.()
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-200"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={24} className="text-white/80" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)} />
          <div className="mobile-menu-panel">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/graphix-logo.png" alt="Graphix" className="w-8 h-8 object-contain" />
                <span className="font-bold text-navy-600">Graphix</span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {user && (
              <div className="p-4 bg-maroon-600 border-b border-maroon-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border border-white/30">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{user.name}</p>
                    <p className="text-xs text-maroon-100">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                  user.role === 'technician' ? 'bg-blue-500/20 text-blue-50' : user.role === 'worker' ? 'bg-emerald-500/20 text-emerald-50' : 'bg-white/20 text-white'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : user.role === 'worker' ? 'Worker' : 'Technician'}
                </span>
              </div>
            )}

            <div className="p-4 space-y-2">
              <button
                onClick={() => { onDashboardClick(); setShowMobileMenu(false) }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <Home size={18} />
                Dashboard
              </button>
              <button
                onClick={() => { onCreateClick(); setShowMobileMenu(false) }}
                className="w-full text-left px-4 py-3 rounded-lg bg-maroon-600 text-white flex items-center gap-3 text-sm font-medium"
              >
                <Plus size={18} />
                New Ticket
              </button>
              <button
                onClick={() => { onAdminClick?.(); setShowMobileMenu(false) }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <Settings size={18} />
                Parts & Pricing
              </button>
              <button
                onClick={() => { onOrdersClick?.(); setShowMobileMenu(false) }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <ShoppingCart size={18} />
                Parts Orders
              </button>
              <div className="divider my-2" />
              <button
                onClick={() => { onLogout?.(); setShowMobileMenu(false) }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-rose-50 flex items-center gap-3 text-sm font-medium text-rose-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
