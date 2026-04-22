const myDeals = [
  { title: 'Acme Corp renewal', stage: 'Proposal', value: '$9,000', due: 'Apr 30' },
  { title: 'Globex new seat', stage: 'Qualification', value: '$3,200', due: 'May 5' },
  { title: 'Initech expansion', stage: 'Negotiation', value: '$14,000', due: 'May 12' },
]

const stageBadge = {
  Prospecting: 'badge-ghost',
  Qualification: 'badge-info',
  Proposal: 'badge-warning',
  Negotiation: 'badge-accent',
  'Closed Won': 'badge-success',
}

export default function UserDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">My Dashboard</h1>
        <p className="text-sm text-base-content/60 mt-0.5">Your deals and tasks for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-1">
            <p className="text-xs text-base-content/50 uppercase tracking-wider">My Contacts</p>
            <p className="text-3xl font-bold">47</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-1">
            <p className="text-xs text-base-content/50 uppercase tracking-wider">Open Deals</p>
            <p className="text-3xl font-bold">3</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 gap-1">
            <p className="text-xs text-base-content/50 uppercase tracking-wider">Tasks Due Today</p>
            <p className="text-3xl font-bold text-warning">5</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">My Deals</h2>
            <button className="btn btn-primary btn-sm">+ New Deal</button>
          </div>
          <div className="flex flex-col gap-3">
            {myDeals.map((d) => (
              <div key={d.title} className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                <div>
                  <p className="font-medium text-sm">{d.title}</p>
                  <p className="text-xs text-base-content/50">Due {d.due}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge badge-sm ${stageBadge[d.stage] ?? 'badge-ghost'}`}>{d.stage}</span>
                  <span className="font-semibold text-sm">{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
