const stats = [
  { label: 'My Contacts', value: '312', change: '+7%', up: true },
  { label: 'Open Deals', value: '24', change: '+2', up: true },
  { label: 'Pipeline Value', value: '$48,500', change: '+11%', up: true },
  { label: 'Tasks Due', value: '9', change: '-3', up: true },
]

export default function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Manager Dashboard</h1>
        <p className="text-sm text-base-content/60 mt-0.5">Your team's pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 gap-1">
              <p className="text-xs text-base-content/50 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-bold text-base-content">{s.value}</p>
              <p className={`text-xs font-medium ${s.up ? 'text-success' : 'text-error'}`}>
                {s.change} vs last month
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <h2 className="font-semibold mb-3">Pipeline by Stage</h2>
          <div className="flex flex-col gap-3">
            {[
              { stage: 'Prospecting', count: 8, pct: 33 },
              { stage: 'Qualification', count: 6, pct: 25 },
              { stage: 'Proposal', count: 5, pct: 21 },
              { stage: 'Negotiation', count: 3, pct: 13 },
              { stage: 'Closed Won', count: 2, pct: 8 },
            ].map((row) => (
              <div key={row.stage} className="flex items-center gap-3">
                <span className="text-sm w-28 shrink-0">{row.stage}</span>
                <progress className="progress progress-primary flex-1" value={row.pct} max="100" />
                <span className="text-sm font-semibold w-6 text-right">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
