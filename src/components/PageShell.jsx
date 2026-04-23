export function PageShell({ title, subtitle, action, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">{title}</h1>
          {subtitle && <p className="text-sm text-base-content/50 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="alert alert-error max-w-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  )
}

export function EmptyState({ message = 'No data found' }) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body items-center py-16 text-base-content/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  )
}
