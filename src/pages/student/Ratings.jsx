import { useFetch } from '../../hooks/useFetch'
import { getMyRatings } from '../../api/ratings'
import { PageShell, LoadingState, ErrorState, EmptyState } from '../../components/PageShell'

function gradeColor(score, max) {
  if (!max || score == null) return 'text-base-content'
  const pct = (score / max) * 100
  if (pct >= 85) return 'text-success'
  if (pct >= 60) return 'text-warning'
  return 'text-error'
}

export default function Ratings() {
  const { data, loading, error } = useFetch(getMyRatings)
  const records = Array.isArray(data) ? data : []

  const avgScore = records.length
    ? (records.reduce((s, r) => s + Number(r.score ?? r.grade ?? 0), 0) / records.length).toFixed(1)
    : null

  return (
    <PageShell title="My Grades" subtitle={loading ? '' : `${records.length} ratings`}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {avgScore && (
            <div className="card bg-base-100 border border-base-200 shadow-sm w-fit">
              <div className="card-body p-4 gap-0.5">
                <p className="text-xs text-base-content/50 uppercase tracking-wider">Average Score</p>
                <p className="text-3xl font-bold text-primary">{avgScore}</p>
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <EmptyState message="No grades recorded yet" />
          ) : (
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="text-xs text-base-content/50 uppercase bg-base-200/50">
                      <th>Lesson / Task</th>
                      <th>Group</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => {
                      const score = r.score ?? r.grade
                      const max = r.maxScore ?? r.maxGrade
                      return (
                        <tr key={r.id ?? r._id} className="hover">
                          <td className="font-medium text-sm">{r.lesson?.title ?? r.title ?? r.task ?? '—'}</td>
                          <td className="text-sm text-base-content/60">{r.group?.name ?? r.group ?? '—'}</td>
                          <td className="text-sm text-base-content/60">
                            {r.date || r.createdAt
                              ? new Date(r.date ?? r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '—'}
                          </td>
                          <td>
                            {score != null ? (
                              <span className={`font-bold text-sm ${gradeColor(score, max)}`}>
                                {score}{max ? `/${max}` : ''}
                              </span>
                            ) : (
                              <span className="text-base-content/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="text-xs text-base-content/40 max-w-xs truncate">{r.comment ?? '—'}</td>
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
