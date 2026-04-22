import { useFetch } from '../../hooks/useFetch'
import { getMyAttendance } from '../../api/attendance'
import { PageShell, LoadingState, ErrorState, EmptyState } from '../../components/PageShell'

const STATUS_MAP = {
  present: { label: 'Present', cls: 'badge-success' },
  absent: { label: 'Absent', cls: 'badge-error' },
  late: { label: 'Late', cls: 'badge-warning' },
  excused: { label: 'Excused', cls: 'badge-info' },
}

export default function Attendance() {
  const { data, loading, error } = useFetch(getMyAttendance)
  const records = Array.isArray(data) ? data : []

  const total = records.length
  const present = records.filter((r) => r.status === 'present').length
  const absent = records.filter((r) => r.status === 'absent').length
  const late = records.filter((r) => r.status === 'late').length
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <PageShell title="My Attendance" subtitle={loading ? '' : `${total} records`}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          {total > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-4 gap-0.5">
                  <p className="text-xs text-base-content/50 uppercase tracking-wider">Attendance Rate</p>
                  <p className={`text-2xl font-bold ${rate >= 75 ? 'text-success' : 'text-error'}`}>{rate}%</p>
                </div>
              </div>
              <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-4 gap-0.5">
                  <p className="text-xs text-base-content/50 uppercase tracking-wider">Present</p>
                  <p className="text-2xl font-bold text-success">{present}</p>
                </div>
              </div>
              <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-4 gap-0.5">
                  <p className="text-xs text-base-content/50 uppercase tracking-wider">Absent</p>
                  <p className="text-2xl font-bold text-error">{absent}</p>
                </div>
              </div>
              <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-4 gap-0.5">
                  <p className="text-xs text-base-content/50 uppercase tracking-wider">Late</p>
                  <p className="text-2xl font-bold text-warning">{late}</p>
                </div>
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <EmptyState message="No attendance records found" />
          ) : (
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="text-xs text-base-content/50 uppercase bg-base-200/50">
                      <th>Date</th>
                      <th>Group</th>
                      <th>Lesson</th>
                      <th>Status</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => {
                      const s = STATUS_MAP[r.status] ?? { label: r.status, cls: 'badge-ghost' }
                      return (
                        <tr key={r.id ?? r._id} className="hover">
                          <td className="text-sm font-medium">
                            {r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="text-sm text-base-content/60">{r.group?.name ?? r.group ?? '—'}</td>
                          <td className="text-sm text-base-content/60">{r.lesson?.title ?? r.lesson ?? '—'}</td>
                          <td><span className={`badge badge-sm ${s.cls}`}>{s.label}</span></td>
                          <td className="text-xs text-base-content/40">{r.note ?? '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
