const stats = [
  { label: 'Total Contacts', value: '4,285', change: '+12%', up: true },
  { label: 'Open Deals', value: '138', change: '+5%', up: true },
  { label: 'Revenue (MTD)', value: '$84,200', change: '-3%', up: false },
  { label: 'Tasks Due', value: '27', change: '+8', up: false },
]

const recentContacts = [
  { name: 'Alice Johnson', email: 'alice@acme.com', status: 'Active', deal: '$12,000' },
  { name: 'Bob Martinez', email: 'bob@globex.com', status: 'Lead', deal: '$8,500' },
  { name: 'Carol White', email: 'carol@initech.com', status: 'Prospect', deal: '$21,000' },
  { name: 'Dan Brown', email: 'dan@hooli.com', status: 'Active', deal: '$5,200' },
  { name: 'Eva Green', email: 'eva@piedpiper.com', status: 'Churned', deal: '$0' },
]

const statusBadge = {
  Active: 'badge-success',
  Lead: 'badge-info',
  Prospect: 'badge-warning',
  Churned: 'badge-error',
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Admin Dashboard</h1>
        <p className="text-sm text-base-content/60 mt-0.5">Overview of all CRM activity</p>
      </div>

      {/* Stat cards */}
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

      {/* Recent Contacts table */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base-content">Recent Contacts</h2>
            <button className="btn btn-primary btn-sm">+ Add Contact</button>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/50 uppercase">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Deal Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((c) => (
                  <tr key={c.email} className="hover">
                    <td className="font-medium">{c.name}</td>
                    <td className="text-base-content/60 text-xs">{c.email}</td>
                    <td>
                      <span className={`badge badge-sm ${statusBadge[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="font-semibold">{c.deal}</td>
                    <td>
                      <button className="btn btn-ghost btn-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4 gap-3">
          <h2 className="font-semibold text-base-content">Recent Activity</h2>
          <ul className="timeline timeline-vertical timeline-compact">
            <li>
              <div className="timeline-middle"><div className="w-2 h-2 rounded-full bg-primary" /></div>
              <div className="timeline-end mb-4">
                <p className="text-sm font-medium">New deal created — Acme Corp $15k</p>
                <p className="text-xs text-base-content/50">2 hours ago</p>
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div className="timeline-middle"><div className="w-2 h-2 rounded-full bg-success" /></div>
              <div className="timeline-end mb-4">
                <p className="text-sm font-medium">Contact Alice Johnson moved to Active</p>
                <p className="text-xs text-base-content/50">4 hours ago</p>
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div className="timeline-middle"><div className="w-2 h-2 rounded-full bg-warning" /></div>
              <div className="timeline-end">
                <p className="text-sm font-medium">Task overdue — Follow up with Globex</p>
                <p className="text-xs text-base-content/50">Yesterday</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
