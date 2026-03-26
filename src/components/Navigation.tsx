import { useState } from 'react'
import { Plus, LogOut, Settings, Menu, X, Home } from 'lucide-react'

interface NavigationProps {
  onCreateClick: () => void
  onDashboardClick: () => void
  user?: any
  onLogout?: () => void
  onAdminClick?: () => void
}

export default function Navigation({ onCreateClick, onDashboardClick, user, onLogout, onAdminClick }: NavigationProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl flex justify-between items-center">
          {/* Logo and Title - clickable to go home */}
          <button
            onClick={onDashboardClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/graphix-logo.png" alt="Graphix" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-maroon-600">Graphix</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">PHONE REPAIR</p>
            </div>
          </button>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onDashboardClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-maroon-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-900 hidden lg:inline">{user.name}</span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-200">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
                          user.role === 'admin' 
                            ? 'bg-maroon-100 text-maroon-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' : 'Technician'}
                        </span>
                      </div>

                      {user.role === 'admin' && (
                        <>
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
                        </>
                      )}

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
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={24} className="text-slate-700" />
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
                <span className="font-bold text-maroon-600">Graphix</span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {user && (
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-maroon-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                  user.role === 'admin' ? 'bg-maroon-100 text-maroon-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'Technician'}
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
              {user?.role === 'admin' && (
                <button
                  onClick={() => { onAdminClick?.(); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3 text-sm font-medium text-slate-700"
                >
                  <Settings size={18} />
                  Parts & Pricing
                </button>
              )}
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
