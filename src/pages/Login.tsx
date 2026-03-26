import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface LoginProps {
  onLoginSuccess: (user: any) => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('active', true)
        .single()

      if (fetchError || !data) {
        setError('Invalid email or password')
        return
      }

      // Store user in localStorage
      localStorage.setItem('graphix_user', JSON.stringify(data))
      onLoginSuccess(data)
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role: 'admin' | 'technician') => {
    const demoEmail = role === 'admin' ? 'admin@graphix.com' : 'jefford@graphix.com'
    setEmail(demoEmail)
    setPassword(role === 'admin' ? 'admin@graphix2026' : 'tech123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 space-y-8">
          {/* Header with Logo */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/graphix-logo.png" 
                alt="Graphix" 
                className="w-28 h-28 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-maroon-600">Graphix</h1>
            <p className="text-slate-600 text-sm">Phone Repair System</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 text-center">Demo Accounts:</p>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="btn btn-secondary w-full text-sm"
            >
              Login as Admin
            </button>
            <button
              onClick={() => handleDemoLogin('technician')}
              className="btn btn-secondary w-full text-sm"
            >
              Login as Technician
            </button>
          </div>

          {/* Info */}
          <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-700">Demo Credentials:</p>
            <p><strong>Admin:</strong> admin@graphix.com</p>
            <p><strong>Tech:</strong> jefford@graphix.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
