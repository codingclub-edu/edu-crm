import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { getAllHomework, getMySubmissions, submitHomework } from '../../api/homework'
import { PageShell, LoadingState, ErrorState, EmptyState } from '../../components/PageShell'

function SubmitModal({ hw, onClose, onSubmitted }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await submitHomework(hw.id ?? hw._id, { text })
      onSubmitted()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">✕</button>
        <h3 className="font-bold text-lg mb-1">Submit Homework</h3>
        <p className="text-sm text-base-content/60 mb-4">{hw.title}</p>
        {error && <div className="alert alert-error py-2 text-sm mb-3"><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label pb-1"><span className="label-text font-medium">Your Answer</span></div>
            <textarea
              className="textarea textarea-bordered w-full h-28 resize-none"
              placeholder="Write your answer here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </label>
          <div className="modal-action mt-1">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}>Submit</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

const DEADLINE_STATUS = (deadline) => {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  const diff = (d - now) / (1000 * 60 * 60 * 24)
  if (diff < 0) return { label: 'Overdue', cls: 'badge-error' }
  if (diff < 2) return { label: 'Due soon', cls: 'badge-warning' }
  return { label: `Due ${d.toLocaleDateString()}`, cls: 'badge-ghost' }
}

function HomeworkTable({ items, onSubmit }) {
  if (items.length === 0) return <EmptyState message="No homework assigned yet" />
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="text-xs text-base-content/50 uppercase bg-base-200/50">
              <th>Title</th>
              <th>Group</th>
              <th>Deadline</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((hw) => {
              const dl = DEADLINE_STATUS(hw.deadline)
              return (
                <tr key={hw.id ?? hw._id} className="hover">
                  <td>
                    <p className="font-medium text-sm">{hw.title}</p>
                    {hw.description && <p className="text-xs text-base-content/40 line-clamp-1">{hw.description}</p>}
                  </td>
                  <td className="text-sm text-base-content/60">{hw.group?.name ?? hw.group ?? '—'}</td>
                  <td>
                    {dl ? <span className={`badge badge-sm ${dl.cls}`}>{dl.label}</span> : <span className="text-base-content/30 text-xs">—</span>}
                  </td>
                  <td className="text-right">
                    <button className="btn btn-primary btn-xs" onClick={() => onSubmit(hw)}>
                      Submit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SubmissionsTable({ items }) {
  if (items.length === 0) return <EmptyState message="No submissions yet" />
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="text-xs text-base-content/50 uppercase bg-base-200/50">
              <th>Homework</th>
              <th>Submitted At</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id ?? s._id} className="hover">
                <td className="font-medium text-sm">{s.homework?.title ?? s.homeworkTitle ?? '—'}</td>
                <td className="text-sm text-base-content/60">
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}
                </td>
                <td>
                  {s.grade != null
                    ? <span className="badge badge-primary badge-sm">{s.grade}</span>
                    : <span className="text-base-content/30 text-xs">Not graded</span>}
                </td>
                <td>
                  <span className={`badge badge-sm ${s.status === 'graded' ? 'badge-success' : 'badge-ghost'}`}>
                    {s.status ?? 'submitted'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function HomeworkPage() {
  const [tab, setTab] = useState('assigned')
  const [submitTarget, setSubmitTarget] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: hwData, loading: hwLoading, error: hwError } = useFetch(getAllHomework, [refreshKey])
  const { data: subData, loading: subLoading, error: subError } = useFetch(getMySubmissions, [refreshKey])

  const homework = Array.isArray(hwData) ? hwData : []
  const submissions = Array.isArray(subData) ? subData : []

  return (
    <PageShell title="Homework" subtitle="Assignments and submissions">
      <div role="tablist" className="tabs tabs-boxed w-fit">
        <button role="tab" className={`tab ${tab === 'assigned' ? 'tab-active' : ''}`} onClick={() => setTab('assigned')}>
          Assigned
          {homework.length > 0 && <span className="badge badge-sm badge-primary ml-2">{homework.length}</span>}
        </button>
        <button role="tab" className={`tab ${tab === 'submissions' ? 'tab-active' : ''}`} onClick={() => setTab('submissions')}>
          My Submissions
          {submissions.length > 0 && <span className="badge badge-sm ml-2">{submissions.length}</span>}
        </button>
      </div>

      {tab === 'assigned' && (
        hwLoading ? <LoadingState /> :
        hwError ? <ErrorState message={hwError} /> :
        <HomeworkTable items={homework} onSubmit={setSubmitTarget} />
      )}
      {tab === 'submissions' && (
        subLoading ? <LoadingState /> :
        subError ? <ErrorState message={subError} /> :
        <SubmissionsTable items={submissions} />
      )}

      {submitTarget && (
        <SubmitModal
          hw={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmitted={() => { setRefreshKey((k) => k + 1); setTab('submissions') }}
        />
      )}
    </PageShell>
  )
}
