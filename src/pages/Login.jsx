import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  admin: '/admin/dashboard',
  manager: '/manager/dashboard',
  user: '/user/dashboard',
}

// Formats digits into (XX) XXX-XX-XX
function formatPhone(digits) {
  const d = digits.slice(0, 9)
  let out = ''
  if (d.length > 0) out += '(' + d.slice(0, 2)
  if (d.length > 2) out += ') ' + d.slice(2, 5)
  if (d.length > 5) out += '-' + d.slice(5, 7)
  if (d.length > 7) out += '-' + d.slice(7, 9)
  return out
}

export default function Login() {
  const { login, loading, error, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/user/dashboard'} replace />
  }

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    setPhoneDisplay(formatPhone(digits))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const phone = phoneDisplay.replace(/\D/g, '')
    try {
      const loggedUser = await login({ phone, password })
      navigate(ROLE_HOME[loggedUser.role] ?? '/user/dashboard', { replace: true })
    } catch {
      // error displayed via context
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body gap-4">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center gap-1 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-primary-content" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-base-content">CRM Portal</h1>
            <p className="text-sm text-base-content/60">Sign in to your account</p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Phone number</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(XX) XXX-XX-XX"
                  className="grow bg-transparent outline-none text-sm tracking-wide"
                  value={phoneDisplay}
                  onChange={handlePhoneChange}
                  required
                  autoComplete="tel"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <label className="label pt-1">
                <a href="#" className="label-text-alt link link-primary">Forgot password?</a>
              </label>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-1 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
