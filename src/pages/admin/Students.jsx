import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../api/students'
import { addStudentToGroup, removeStudentFromGroup, getAllGroups } from '../../api/groups'
import { getAllTeachers } from '../../api/teacher'
import { getAllCourses } from '../../api/courses'
import { useDebounce } from '../../hooks/useDebounce'

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n ?? 0).toLocaleString('ru-RU')

function BalanceCell({ value }) {
  const n = Number(value ?? 0)
  return (
    <span className={`font-bold text-sm tabular-nums ${n < 0 ? 'text-error' : 'text-success'}`}>
      {fmt(n)}
    </span>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'sm' }) {
  const initials = name
    ?.split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() ?? '?'

  const colors = [
    'bg-primary text-primary-content',
    'bg-secondary text-secondary-content',
    'bg-accent text-accent-content',
    'bg-info text-info-content',
    'bg-success text-success-content',
  ]
  const color = colors[name?.charCodeAt(0) % colors.length] ?? colors[0]
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs'

  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Modal wrapper ───────────────────────────────────────────────────────────

function Modal({ onClose, title, children, wide }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className={`modal-box ${wide ? 'max-w-2xl' : 'max-w-md'} p-0 overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h3 className="font-bold text-base text-base-content">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose} />
    </div>
  )
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function DetailModal({ student, onClose }) {
  return (
    <Modal onClose={onClose} title="O'quvchi ma'lumotlari" wide>
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-200">
        <Avatar name={student.name} size="lg" />
        <div>
          <p className="font-bold text-lg text-base-content">{student.name}</p>
          <p className="text-sm text-base-content/50 font-mono">{student.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Balans', value: `${fmt(student.balance?.balance ?? student.balance)} UZS`, cls: Number(student.balance?.balance ?? student.balance) < 0 ? 'text-error' : 'text-success' },
          { label: 'Guruh', value: student.group?.name ?? student.groupName ?? '—', cls: '' },
          { label: 'O\'qituvchi', value: student.teacher?.name ?? student.teacherName ?? '—', cls: '' },
          { label: 'Kurs', value: student.course?.name ?? student.courseName ?? '—', cls: '' },
          { label: 'Rol', value: student.role ?? 'student', cls: '' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-base-200/60 rounded-xl px-4 py-3">
            <p className="text-xs text-base-content/40 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-sm font-semibold ${cls}`}>{value}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}

// ─── Create Modal ────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    specialization: '',
    email: '',
  })
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    getAllGroups()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.groups ?? data.data ?? []
        setGroups(list)
      })
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // 1 — student yaratish
      const { data: student } = await createStudent({
        name: form.name,
        phone: form.phone,
        password: form.password,
        specialization: form.specialization || undefined,
        email: form.email || undefined,
        courseIds: [],
      })

      // 2 — guruhga biriktirish
      if (groupId) {
        await addStudentToGroup(groupId, student.id)
      }

      onCreated(student)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Yangi o'quvchi qo'shish">
      {error && (
        <div className="alert alert-error py-2.5 text-sm mb-4 rounded-xl">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="To'liq ism" required>
          <input className="input input-bordered w-full" value={form.name} onChange={set('name')} required placeholder="Ali Karimov" autoFocus />
        </FormField>

        <FormField label="Telefon" required>
          <input className="input input-bordered w-full" value={form.phone} onChange={set('phone')} required placeholder="+998901234567" />
        </FormField>

        <FormField label="Parol" required>
          <input type="password" className="input input-bordered w-full" value={form.password} onChange={set('password')} required placeholder="••••••••" minLength={6} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email">
            <input type="email" className="input input-bordered w-full" value={form.email} onChange={set('email')} placeholder="ali@example.com" />
          </FormField>
          <FormField label="Mutaxassislik">
            <input className="input input-bordered w-full" value={form.specialization} onChange={set('specialization')} placeholder="Frontend" />
          </FormField>
        </div>

        <FormField label="Guruh (ixtiyoriy)">
          {loadingGroups ? (
            <div className="flex items-center gap-2 text-sm text-base-content/40 py-2">
              <span className="loading loading-spinner loading-xs" />
              Guruhlar yuklanmoqda...
            </div>
          ) : (
            <select className="select select-bordered w-full" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">— Guruh tanlang —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.teacher?.name ? ` · ${g.teacher.name}` : ''}
                  {g.currentStudents != null ? ` · ${g.currentStudents}/${g.maxStudents}` : ''}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Bekor</button>
          <button type="submit" className={`btn btn-primary btn-sm min-w-24 ${loading ? 'loading' : ''}`} disabled={loading}>
            Qo'shish
          </button>
        </div>
      </form>
    </Modal>
  )
}
// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ student, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: student.name ?? '',
    phone: student.phone ?? '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const updateData = { name: form.name, phone: form.phone }
      if (form.password) {
        updateData.password = form.password
      }
      const { data } = await updateStudent(student.id, updateData)
      onUpdated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? "Yangilashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={`Tahrirlash — ${student.name}`}>
      {error && (
        <div className="alert alert-error py-2.5 text-sm mb-4 rounded-xl">
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="To'liq ism">
          <input
            className="input input-bordered w-full focus:input-primary"
            value={form.name}
            onChange={set('name')}
            placeholder="Ali Karimov"
          />
        </FormField>
        <FormField label="Telefon">
          <input
            className="input input-bordered w-full focus:input-primary"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+998901234567"
          />
        </FormField>
        <FormField label="Yangi parol (ixtiyoriy)">
          <input
            type="password"
            className="input input-bordered w-full focus:input-primary"
            value={form.password}
            onChange={set('password')}
            placeholder="O'zgartirmoqchi bo'lsangiz kiriting"
            minLength={6}
          />
        </FormField>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Bekor</button>
          <button
            type="submit"
            className={`btn btn-primary btn-sm min-w-24 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Assign Group Modal ──────────────────────────────────────────────────────

function AssignGroupModal({ student, onClose, onAssigned }) {
  const [groups, setGroups] = useState([])
  const [groupId, setGroupId] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])

  // Get student's current group
  const studentGroups = student.groups ?? []
  const currentGroupId = studentGroups.length > 0
    ? (studentGroups[0]?._id ?? studentGroups[0]?.id ?? studentGroups[0])
    : null

  useEffect(() => {
    Promise.all([
      getAllGroups(),
      getAllTeachers(),
      getAllCourses()
    ])
      .then(([{ data: groupsData }, { data: teachersData }, { data: coursesData }]) => {
        const groupsList = Array.isArray(groupsData) ? groupsData : groupsData.groups ?? groupsData.data ?? []
        const teachersList = teachersData.data ?? teachersData.teachers ?? (Array.isArray(teachersData) ? teachersData : [])
        const coursesList = coursesData.data ?? coursesData.courses ?? (Array.isArray(coursesData) ? coursesData : [])
        setGroups(groupsList)
        setTeachers(teachersList)
        setCourses(coursesList)
        // Set current group ID if student has a group
        if (currentGroupId) {
          setGroupId(currentGroupId)
        }
      })
      .catch(() => {
        setGroups([])
        setTeachers([])
        setCourses([])
      })
      .finally(() => setFetching(false))
  }, [currentGroupId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!groupId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await addStudentToGroup(groupId, student.id)
      onAssigned(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? "Guruhga qo'shishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromGroup = async () => {
    if (!currentGroupId) return
    setLoading(true)
    setError(null)
    try {
      await removeStudentFromGroup(currentGroupId, student.id)
      onAssigned({})
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? "Guruhdan chiqarishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const selectedGroup = groups.find(g => g.id === groupId || g._id === groupId)
  const currentGroup = groups.find(g => g.id === currentGroupId || g._id === currentGroupId)

  return (
    <Modal onClose={onClose} title={`Guruh ma'lumotlari — ${student.name}`}>
      {error && (
        <div className="alert alert-error py-2.5 text-sm mb-4 rounded-xl">
          <span>{error}</span>
        </div>
      )}

      {/* Current Group Info */}
      {currentGroup && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Hozirgi guruh</p>
              <p className="font-semibold text-blue-900">{currentGroup.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">O'qituvchi</p>
              <p className="text-sm text-blue-800">
                {currentGroup.teacher?.name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Kurs</p>
              <p className="text-sm text-blue-800">
                {currentGroup.course?.name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Xona</p>
              <p className="text-sm text-blue-800">
                {currentGroup.room?.name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Talabalar</p>
              <p className="text-sm text-blue-800">
                {currentGroup.currentStudents ?? 0}/{currentGroup.maxStudents}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Oylik to'lov</p>
              <p className="text-sm text-blue-800 font-semibold">
                {fmt(currentGroup.monthlyFeePerStudent)} UZS
              </p>
            </div>
            {currentGroup.schedule?.days && (
              <div className="col-span-2">
                <p className="text-xs text-blue-600 font-medium mb-1">Dars jadvali</p>
                <p className="text-sm text-blue-800">
                  {currentGroup.schedule.days.join(', ')} · {currentGroup.schedule.fromHour}-{currentGroup.schedule.toHour}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemoveFromGroup}
            disabled={loading}
            className="w-full mt-3 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4 4m4-4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
            Guruhdan chiqarish
          </button>
        </div>
      )}

      {/* Select New Group */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-center mb-4">
          <p className="text-xs text-base-content/50 mb-2">YANGI GURUHGA BIRIKTIRISH</p>
          <p className="text-sm text-base-content">
            {currentGroup
              ? `O'quvchi hozir "<strong className="text-blue-600">{currentGroup.name}</strong>" guruhida. Boshqa guruhga biriktirish uchun quyidagidan tanlang.`
              : 'O\'quvchi hozir hech qismda emas. Guruh tanlang.'}
          </p>
        </div>

        <FormField label="Guruhni tanlang" required>
          {fetching ? (
            <div className="flex items-center gap-2 text-sm text-base-content/40 py-2">
              <span className="loading loading-spinner loading-xs" />
              Guruhlar yuklanmoqda...
            </div>
          ) : (
            <select
              className="select select-bordered w-full focus:select-primary"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
            >
              <option value="">— Guruh tanlang —</option>
              {groups.map((g) => {
                const teacherName = teachers.find(t => t._id === g.teacherId || t.id === g.teacherId)?.name
                const courseName = courses.find(c => c._id === g.courseId || c.id === g.courseId)?.name
                return (
                  <option key={g.id} value={g.id}>
                    {g.name}
                    {teacherName ? ` · ${teacherName}` : ''}
                    {g.currentStudents != null ? ` · ${g.currentStudents}/${g.maxStudents}` : ''}
                  </option>
                )
              })}
            </select>
          )}
        </FormField>

        {groupId && selectedGroup && (
          <div className="bg-base-200/60 rounded-xl px-4 py-3 text-sm">
            {(() => {
              const teacherName = teachers.find(t => t._id === selectedGroup.teacherId || t.id === selectedGroup.teacherId)?.name
              const courseName = courses.find(c => c._id === selectedGroup.courseId || c.id === selectedGroup.courseId)?.name
              return (
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-base-content">{selectedGroup.name}</p>
                  {teacherName && <p className="text-base-content/50">O'qituvchi: {teacherName}</p>}
                  {courseName && <p className="text-base-content/50">Kurs: {courseName}</p>}
                  {selectedGroup.monthlyFeePerStudent && (
                    <p className="text-base-content/50">Oylik: {fmt(selectedGroup.monthlyFeePerStudent)} UZS</p>
                  )}
                  {selectedGroup.schedule?.days && (
                    <p className="text-base-content/50">
                      Dars: {selectedGroup.schedule.days.slice(0, 3).join(', ')}{selectedGroup.schedule.days.length > 3 ? '...' : ''} · {selectedGroup.schedule.fromHour}-{selectedGroup.schedule.toHour}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Bekor</button>
          <button
            type="submit"
            className={`btn btn-primary btn-sm min-w-28 ${loading ? 'loading' : ''}`}
            disabled={loading || !groupId}
          >
            Biriktirish
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteConfirmModal({ student, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteStudent(student.id)
      onDeleted(student.id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? "O'chirishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="O'quvchini o'chirish">
      {error && (
        <div className="alert alert-error py-2.5 text-sm mb-4 rounded-xl">
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 bg-error/10 rounded-xl p-4 mb-5">
        <div className="w-10 h-10 bg-error/20 rounded-full flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-base-content">
            {student.name} o'chirilsinmi?
          </p>
          <p className="text-xs text-base-content/50 mt-0.5">
            Bu amal qaytarib bo'lmaydi
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Bekor</button>
        <button
          className={`btn btn-error btn-sm min-w-24 ${loading ? 'loading' : ''}`}
          onClick={handleDelete}
          disabled={loading}
        >
          O'chirish
        </button>
      </div>
    </Modal>
  )
}

// ─── FormField ───────────────────────────────────────────────────────────────

function FormField({ label, children, required }) {
  return (
    <div className="form-control w-full">
      <label className="label pb-1.5">
        <span className="label-text font-medium text-sm">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </span>
      </label>
      {children}
    </div>
  )
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`card bg-base-100 border border-base-200 shadow-sm`}>
      <div className="card-body p-4 flex-row items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-base-content/40 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-base-content tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)
  return (
    <div className="join">
      <button
        className="join-item btn btn-sm btn-ghost"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        «
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`join-item btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {totalPages > 7 && page < totalPages && (
        <>
          <button className="join-item btn btn-sm btn-ghost btn-disabled">…</button>
          <button className="join-item btn btn-sm btn-ghost" onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      <button
        className="join-item btn btn-sm btn-ghost"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        »
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)

  const debouncedSearch = useDebounce(search, 400)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await getStudents(params)
      // Backend { data: [], pagination: {} } yoki { students: [], total: N }
      const list = data.data ?? data.students ?? (Array.isArray(data) ? data : [])
      const pag = data.pagination ?? {
        page,
        limit: 10,
        total: data.total ?? list.length,
        totalPages: Math.ceil((data.total ?? list.length) / 10),
      }
      setStudents(list)
      setPagination(pag)
    } catch (err) {
      setError(err.response?.data?.error ?? "O'quvchilar yuklanmadi")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await getAllGroups()
      const list = Array.isArray(data) ? data : data.groups ?? data.data ?? []
      setGroups(list)
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err)
    }
  }, [])

  const fetchTeachers = useCallback(async () => {
    try {
      const { data } = await getAllTeachers()
      const list = data.data ?? data.teachers ?? (Array.isArray(data) ? data : [])
      setTeachers(list)
    } catch (err) {
      console.error('O\'qituvchilarni yuklashda xatolik:', err)
    }
  }, [])

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await getAllCourses()
      const list = data.data ?? data.courses ?? (Array.isArray(data) ? data : [])
      setCourses(list)
    } catch (err) {
      console.error('Kurslarni yuklashda xatolik:', err)
    }
  }, [])

  useEffect(() => { setPage(1) }, [debouncedSearch])
  useEffect(() => { fetchStudents() }, [fetchStudents])
  useEffect(() => { fetchGroups() }, [fetchGroups])
  useEffect(() => { fetchTeachers() }, [fetchTeachers])
  useEffect(() => { fetchCourses() }, [fetchCourses])

  const handleCreated  = (s)   => setStudents((p) => [s, ...p])
  const handleUpdated  = (s)   => setStudents((p) => p.map((x) => x.id === s.id ? { ...x, ...s } : x))
  const handleDeleted  = (id)  => setStudents((p) => p.filter((x) => x.id !== id))
  const handleAssigned = (s)   => setStudents((p) => p.map((x) => x.id === s.id ? { ...x, ...s } : x))

  const open  = (type, student = null) => {
    if (type === 'detail' && student) {
      const { groupName, teacherName, courseName } = getStudentGroupInfo(student)
      setModal({ type, student: { ...student, groupName, teacherName, courseName } })
    } else {
      setModal({ type, student })
    }
  }
  const close = () => setModal(null)

  // Stats from current page data
  const activeCount  = students.filter((s) => s.status === 'active').length
  const debtorCount  = students.filter((s) => Number(s.balance?.balance ?? s.balance) < 0).length

  // Get student's group info - match with teachers and courses
  const getStudentGroupInfo = (student) => {
    const studentGroups = student.groups ?? []
    if (studentGroups.length > 0) {
      const groupId = studentGroups[0]?._id ?? studentGroups[0]?.id ?? studentGroups[0]
      const group = groups.find(g => g._id === groupId || g.id === groupId)

      if (group) {
        // Find teacher and course by ID
        const teacher = teachers.find(t => t._id === group.teacherId || t.id === group.teacherId)
        const course = courses.find(c => c._id === group.courseId || c.id === group.courseId)

        return {
          groupName: group.name ?? 'yangialr',
          teacherName: teacher?.name ?? 'yangialr',
          courseName: course?.name ?? 'yangialr',
        }
      }
    }
    return { groupName: 'yangialr', teacherName: 'yangialr', courseName: 'yangialr' }
  }

  return (
    <div className="flex flex-col gap-6 p-1">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">O'quvchilar</h1>
          <p className="text-sm text-base-content/40 mt-0.5">
            Jami <span className="font-semibold text-base-content">{pagination.total}</span> ta o'quvchi
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary btn-sm gap-2 self-start sm:self-auto"
            onClick={() => open('create')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Qo'shish
          </button>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Jami"
          value={pagination.total}
          color="bg-primary/10 text-primary"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>}
        />
        <StatCard
          label="Faol"
          value={activeCount}
          color="bg-success/10 text-success"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Qarzdor"
          value={debtorCount}
          color="bg-error/10 text-error"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
        <StatCard
          label="Sahifa"
          value={`${page}/${pagination.totalPages}`}
          color="bg-info/10 text-info"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
      </div>

      {/* ── Search ── */}
      <label className="input input-bordered flex items-center gap-2 w-full max-w-sm focus-within:input-primary transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Ism yoki telefon bo'yicha qidirish…"
          className="grow bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="btn btn-ghost btn-xs btn-circle text-base-content/30"
          >
            ✕
          </button>
        )}
      </label>

      {/* ── Table ── */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        {error && (
          <div className="alert alert-error m-4 py-2.5 text-sm rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button className="btn btn-ghost btn-xs ml-auto" onClick={fetchStudents}>Qayta urinish</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/60 text-xs text-base-content/40 uppercase tracking-wider">
                <th className="w-10">#</th>
                <th>O'quvchi</th>
                <th>Telefon</th>
                <th>Balans</th>
                <th>Guruh</th>
                <th>O'qituvchi</th>
                <th>Kurs</th>
                {isAdmin && <th className="text-right">Amallar</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-base-content/30">
                      <span className="loading loading-spinner loading-md text-primary" />
                      <span className="text-sm">Yuklanmoqda…</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-base-content/25">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                      </svg>
                      <p className="text-sm font-medium">O'quvchi topilmadi</p>
                      {search && <p className="text-xs">"{search}" bo'yicha natija yo'q</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const balance = s.balance?.balance ?? s.balance
                  const { groupName, teacherName, courseName } = getStudentGroupInfo(s)

                  return (
                    <tr
                      key={s.id}
                      className="hover cursor-pointer transition-colors"
                      onClick={() => open('detail', s)}
                    >
                      <td className="text-xs text-base-content/30 font-mono">
                        {(page - 1) * 10 + idx + 1}
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.name} />
                          <span className="font-medium text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="text-xs text-base-content/50 font-mono">{s.phone}</td>
                      <td className="text-right">
                        <BalanceCell value={balance} />
                      </td>
                      <td className="text-xs text-base-content/70">{groupName}</td>
                      <td className="text-xs text-base-content/70">{teacherName}</td>
                      <td className="text-xs text-base-content/70">{courseName}</td>
                      {isAdmin && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="btn btn-ghost btn-xs hover:btn-info"
                              onClick={() => open('edit', s)}
                              title="Tahrirlash"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="btn btn-ghost btn-xs hover:btn-success"
                              onClick={() => open('assign', s)}
                              title="Guruhga biriktirish"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            <button
                              className="btn btn-ghost btn-xs hover:btn-error hover:text-error"
                              onClick={() => open('delete', s)}
                              title="O'chirish"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && students.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-base-200 bg-base-50">
            <span className="text-xs text-base-content/35">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} / {pagination.total} ta
            </span>
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === 'create' && (
        <CreateModal onClose={close} onCreated={handleCreated} />
      )}
      {modal?.type === 'detail' && (
        <DetailModal student={modal.student} onClose={close} />
      )}
      {modal?.type === 'edit' && (
        <EditModal student={modal.student} onClose={close} onUpdated={handleUpdated} />
      )}
      {modal?.type === 'assign' && (
        <AssignGroupModal student={modal.student} onClose={close} onAssigned={handleAssigned} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal student={modal.student} onClose={close} onDeleted={handleDeleted} />
      )}
    </div>
  )
}