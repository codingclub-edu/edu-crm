import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_HOME = {
  admin:   '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  staff:   '/staff/dashboard',
}

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
  const { login, loading, error, isAuthenticated, initialized, user } = useAuth()
  const navigate = useNavigate()
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/student/dashboard'} replace />
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
      navigate(ROLE_HOME[loggedUser.role] ?? '/student/dashboard', { replace: true })
    } catch { /* error shown via context */ }
  }

  return (
    <div className="min-h-screen flex bg-base-100">

      {/* ── Left: Brand panel ───────────────────── */}
      <div className="hidden lg:flex relative w-[480px] shrink-0 flex-col justify-between overflow-hidden bg-primary p-12">

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            <svg viewBox="0 0 400 400" fill="none" className="w-full h-full opacity-10">
              <circle cx="200" cy="200" r="180" stroke="white" strokeWidth="0.5" strokeDasharray="6 6" />
              <circle cx="200" cy="200" r="120" stroke="white" strokeWidth="0.5" />
              <circle cx="200" cy="200" r="60"  stroke="white" strokeWidth="0.5" strokeDasharray="3 3" />
            </svg>
          </div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">CRM Portal</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-white/10 ring-1 ring-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-white/80 text-xs font-medium">All systems operational</span>
          </div>
          <h2 className="text-white text-3xl font-bold leading-snug">
            Manage your<br />learning journey<br />in one place.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Track groups, payments, grades and attendance — all from a single unified dashboard.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 flex flex-col gap-4">
          {[
            'Real-time payment tracking',
            'Group & course management',
            'Grades & attendance overview',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/70 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ───────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-base-200/30">
        <div className="w-full max-w-[400px] flex flex-col gap-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-content" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <span className="font-bold text-lg">CRM Portal</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-base-content">Sign in</h1>
            <p className="text-sm text-base-content/50 mt-1">Enter your credentials to access your account</p>
          </div>

          {/* Card */}
          <div className="bg-base-100 rounded-2xl shadow-sm ring-1 ring-base-content/8 p-7 flex flex-col gap-6">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-error/8 border border-error/15 text-error text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Phone field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                  Phone number
                </label>
                <div className="relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="(90) 123-45-67"
                    className="input input-bordered w-full pl-10 h-11 text-sm focus:input-primary transition-all"
                    value={phoneDisplay}
                    onChange={handlePhoneChange}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 pr-11 h-11 text-sm focus:input-primary transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/25 hover:text-base-content/60 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-11 text-sm font-semibold tracking-wide mt-1"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    Continue
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-base-content/30">
            © 2026 CRM Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
