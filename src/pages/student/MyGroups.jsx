import { useFetch } from '../../hooks/useFetch'
import { getMyGroups } from '../../api/groups'
import { PageShell, LoadingState, ErrorState, EmptyState } from '../../components/PageShell'

const STATUS_STYLE = {
  active:   { dot: 'bg-success', text: 'text-success', label: 'Active' },
  inactive: { dot: 'bg-warning', text: 'text-warning', label: 'Inactive' },
  ended:    { dot: 'bg-base-content/30', text: 'text-base-content/30', label: 'Ended' },
}

function GroupRow({ group }) {
  const status = STATUS_STYLE[group.status] ?? STATUS_STYLE.active
  const start  = group.startDate ? new Date(group.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const end    = group.endDate   ? new Date(group.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const pct    = group.maxStudents ? Math.round((group.currentStudents / group.maxStudents) * 100) : 0

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-base-200/40 transition-colors">

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-base-content">{group.name}</p>
          <span className={`flex items-center gap-1 text-xs font-medium ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* Course */}
        {group.course && (
          <p className="text-xs text-base-content/50 mt-0.5">
            Course: <span className="text-base-content/70">{group.course.title}</span>
            {group.course.duration && <span className="text-base-content/30"> · {group.course.duration} months</span>}
          </p>
        )}

        {/* Teacher */}
        {group.teacher && (
          <p className="text-xs text-base-content/50 mt-0.5">
            Teacher: <span className="text-base-content/70">{group.teacher.name}</span>
            {group.teacher.specialization && (
              <span className="text-base-content/30"> · {group.teacher.specialization}</span>
            )}
          </p>
        )}
      </div>

      {/* Dates + capacity */}
      <div className="flex sm:flex-col items-start sm:items-end gap-3 sm:gap-1 shrink-0">
        <div className="text-xs text-base-content/40 text-right">
          <p>{start} – {end}</p>
        </div>

        {/* Capacity bar */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-base-200 overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 90 ? 'bg-error' : pct >= 70 ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-base-content/40 whitespace-nowrap">
            {group.currentStudents}/{group.maxStudents}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MyGroups() {
  const { data, loading, error } = useFetch(getMyGroups)

  // API returns { role, groups: [...] }
  const groups = Array.isArray(data) ? data : (data?.groups ?? [])

  return (
    <PageShell title="My Groups" subtitle={loading ? '' : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && groups.length === 0 && <EmptyState message="You are not enrolled in any groups yet" />}

      {!loading && !error && groups.length > 0 && (
        <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm overflow-hidden divide-y divide-base-200">
          {groups.map((g) => <GroupRow key={g.id ?? g._id} group={g} />)}
        </div>
      )}
    </PageShell>
  )
}
