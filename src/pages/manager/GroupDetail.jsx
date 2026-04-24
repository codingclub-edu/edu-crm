import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { getGroupById } from '../../api/groups'
import { getGroupAttendance, updateDayAttendance } from '../../api/attendance'
import { getGroupRatings, updateDayRatings } from '../../api/ratings'
import { LoadingState, ErrorState } from '../../components/PageShell'

const today = () => new Date().toISOString().split('T')[0]

const STATUSES = ['present', 'absent', 'late']
const STATUS_STYLE = {
  present: { bg: 'bg-success/15 border-success/30 text-success',       active: 'bg-success text-success-content border-success',      label: 'Present' },
  absent:  { bg: 'bg-error/15 border-error/30 text-error',             active: 'bg-error text-error-content border-error',            label: 'Absent' },
  late:    { bg: 'bg-warning/15 border-warning/30 text-warning',       active: 'bg-warning text-warning-content border-warning',      label: 'Late' },
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────

function AttendanceTab({ groupId, students, selectedDate }) {
  const [map, setMap] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const fetchFn = useCallback(() => getGroupAttendance(groupId), [groupId])
  const { data: attendanceData, loading } = useFetch(fetchFn, [groupId])

  // Build map from fetched data filtered by date
  useEffect(() => {
    const defaultMap = {}
    students.forEach((s) => { defaultMap[s.id] = 'present' })

    if (!attendanceData) { setMap(defaultMap); return }

    const records = Array.isArray(attendanceData) ? attendanceData : []
    // Find the day record matching selected date
    const dayRecord = records.find((r) => r.date?.slice(0, 10) === selectedDate)

    if (dayRecord?.records?.length) {
      const m = { ...defaultMap }
      dayRecord.records.forEach((r) => {
        if (r.studentId) m[r.studentId] = r.status ?? 'present'
      })
      setMap(m)
    } else {
      setMap(defaultMap)
    }
  }, [attendanceData, selectedDate, students])

  const toggle = (studentId, status) => {
    setMap((prev) => ({ ...prev, [studentId]: status }))
  }

  const save = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      await updateDayAttendance(groupId, {
        date: selectedDate,
        records: students.map((s) => ({ studentId: s.id, status: map[s.id] ?? 'present' })),
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const presentCount = Object.values(map).filter((v) => v === 'present').length
  const absentCount  = Object.values(map).filter((v) => v === 'absent').length
  const lateCount    = Object.values(map).filter((v) => v === 'late').length

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-4">
      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Present', count: presentCount, color: 'text-success bg-success/10 border-success/20' },
          { label: 'Absent',  count: absentCount,  color: 'text-error bg-error/10 border-error/20' },
          { label: 'Late',    count: lateCount,    color: 'text-warning bg-warning/10 border-warning/20' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${color}`}>
            {label}: {count}
          </div>
        ))}
      </div>

      {/* Student rows */}
      <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="py-12 text-center text-base-content/30 text-sm">No students in this group</div>
        ) : (
          <div className="divide-y divide-base-200">
            {students.map((student, idx) => {
              const current = map[student.id] ?? 'present'
              return (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Index + name */}
                  <span className="text-xs text-base-content/30 tabular-nums w-5 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{student.name}</p>
                    {student.phone && (
                      <p className="text-xs text-base-content/40">{student.phone}</p>
                    )}
                  </div>
                  {/* Status buttons */}
                  <div className="flex gap-1.5 shrink-0">
                    {STATUSES.map((st) => {
                      const style = STATUS_STYLE[st]
                      const isActive = current === st
                      return (
                        <button
                          key={st}
                          onClick={() => toggle(student.id, st)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                            isActive ? style.active : `${style.bg} hover:opacity-80`
                          }`}
                        >
                          {style.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4">
        {saveStatus === 'success' && (
          <span className="text-sm text-success font-medium flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved successfully
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-error font-medium">Failed to save. Try again.</span>
        )}
        {!saveStatus && <span />}
        <button
          onClick={save}
          disabled={saving || students.length === 0}
          className="btn btn-primary btn-sm px-6"
        >
          {saving ? <span className="loading loading-spinner loading-xs" /> : 'Save Attendance'}
        </button>
      </div>
    </div>
  )
}

// ─── Ratings Tab ──────────────────────────────────────────────────────────────

function RatingsTab({ groupId, students, selectedDate }) {
  const [map, setMap] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const fetchFn = useCallback(() => getGroupRatings(groupId), [groupId])
  const { data: ratingsData, loading } = useFetch(fetchFn, [groupId])

  useEffect(() => {
    if (!ratingsData) return
    const records = Array.isArray(ratingsData) ? ratingsData : []
    const dayRecords = records.filter((r) => r.date?.slice(0, 10) === selectedDate)
    const m = {}
    dayRecords.forEach((r) => { if (r.studentId) m[r.studentId] = String(r.score ?? '') })
    setMap(m)
  }, [ratingsData, selectedDate])

  const setScore = (studentId, val) => {
    const num = val.replace(/[^0-9]/g, '').slice(0, 3)
    if (num !== '' && Number(num) > 100) return
    setMap((prev) => ({ ...prev, [studentId]: num }))
  }

  const save = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      const ratings = students
        .filter((s) => map[s.id] !== undefined && map[s.id] !== '')
        .map((s) => ({ studentId: s.id, score: Number(map[s.id]) }))
      await updateDayRatings(groupId, { date: selectedDate, ratings })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const scored = Object.values(map).filter((v) => v !== '').length
  const avg = scored > 0
    ? Math.round(Object.values(map).filter((v) => v !== '').reduce((a, b) => a + Number(b), 0) / scored)
    : null

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
          Scored: {scored} / {students.length}
        </div>
        {avg !== null && (
          <div className="px-3 py-1.5 rounded-xl border border-base-200 bg-base-100 text-base-content/60 text-xs font-semibold">
            Class avg: {avg}
          </div>
        )}
      </div>

      {/* Student rows */}
      <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="py-12 text-center text-base-content/30 text-sm">No students in this group</div>
        ) : (
          <div className="divide-y divide-base-200">
            {students.map((student, idx) => {
              const score = map[student.id] ?? ''
              const num = score !== '' ? Number(score) : null
              const scoreColor = num === null ? '' : num >= 80 ? 'text-success' : num >= 50 ? 'text-warning' : 'text-error'

              return (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-xs text-base-content/30 tabular-nums w-5 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">{student.name}</p>
                    {student.phone && (
                      <p className="text-xs text-base-content/40">{student.phone}</p>
                    )}
                  </div>
                  {/* Score input */}
                  <div className="flex items-center gap-2 shrink-0">
                    {num !== null && (
                      <span className={`text-sm font-bold tabular-nums w-8 text-right ${scoreColor}`}>{num}</span>
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="—"
                      value={score}
                      onChange={(e) => setScore(student.id, e.target.value)}
                      className="input input-bordered input-sm w-16 text-center text-sm"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4">
        {saveStatus === 'success' && (
          <span className="text-sm text-success font-medium flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved successfully
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-error font-medium">Failed to save. Try again.</span>
        )}
        {!saveStatus && <span />}
        <button
          onClick={save}
          disabled={saving || students.length === 0}
          className="btn btn-primary btn-sm px-6"
        >
          {saving ? <span className="loading loading-spinner loading-xs" /> : 'Save Ratings'}
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('attendance')
  const [selectedDate, setSelectedDate] = useState(today())

  const fetchGroup = useCallback(() => getGroupById(id), [id])
  const { data: group, loading, error } = useFetch(fetchGroup, [id])

  const students = group?.students ?? []

  if (loading) return (
    <div className="flex flex-col gap-6">
      <LoadingState />
    </div>
  )
  if (error) return (
    <div className="flex flex-col gap-6">
      <ErrorState message={error} />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/teacher/groups')}
          className="btn btn-ghost btn-sm btn-square mt-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-base-content">{group?.name ?? 'Group'}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            {group?.course && (
              <span className="text-sm text-base-content/50">
                {group.course.title ?? group.course.name}
              </span>
            )}
            {group?.schedule && (
              <>
                <span className="text-base-content/20">·</span>
                <span className="text-sm text-base-content/40">{group.schedule}</span>
              </>
            )}
            <span className="text-base-content/20">·</span>
            <span className="text-sm text-base-content/40">{students.length} students</span>
          </div>
        </div>
      </div>

      {/* Controls: date + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-base-200/60 rounded-xl w-fit">
          {[
            { key: 'attendance', label: 'Attendance' },
            { key: 'ratings',    label: 'Ratings' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-base-100 text-base-content shadow-sm'
                  : 'text-base-content/50 hover:text-base-content'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            max={today()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input input-bordered input-sm h-9 text-sm"
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'attendance' && (
        <AttendanceTab groupId={id} students={students} selectedDate={selectedDate} />
      )}
      {activeTab === 'ratings' && (
        <RatingsTab groupId={id} students={students} selectedDate={selectedDate} />
      )}
    </div>
  )
}
