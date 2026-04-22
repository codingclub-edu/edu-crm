import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  assignStudentGroup,
} from '../../api/students'
import { useDebounce } from '../../hooks/useDebounce'

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n ?? 0).toLocaleString('ru-RU')

const STATUS_BADGE = {
  active: 'badge-success',
  inactive: 'badge-warning',
  suspended: 'badge-error',
  graduated: 'badge-info',
  deleted: 'badge-ghost',
}

const STATUS_OPTIONS = ['active', 'inactive', 'suspended', 'graduated']

function BalanceCell({ value }) {
  const n = Number(value ?? 0)
  return (
    <span className={`font-semibold text-sm ${n < 0 ? 'text-error' : 'text-success'}`}>
      {fmt(n)}
    </span>
  )
}

// ─── modals ─────────────────────────────────────────────────────────────────

function Modal({ onClose, title, children, wide }) {
  return (
    <div className="modal modal-open">
      <div className={`modal-box ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

function DetailModal({ student, onClose }) {
  return (
    <Modal onClose={onClose} title="Student Details" wide>
      <div className="grid grid-cols-2 gap-3">
        <InfoRow label="Name" value={student.name} />
        <InfoRow label="Phone" value={student.phone} />
        <InfoRow label="Role" value={student.role} />
        <InfoRow
          label="Status"
          value={
            <span className={`badge badge-sm ${STATUS_BADGE[student.status] ?? 'badge-ghost'} capitalize`}>
              {student.status}
            </span>
          }
        />
        <InfoRow label="Debit" value={`${fmt(student.debit)} UZS`} />
        <InfoRow label="Credit" value={`${fmt(student.credit)} UZS`} />
        <InfoRow
          label="Balance"
          value={
            <span className={Number(student.balance) < 0 ? 'text-error font-semibold' : 'text-success font-semibold'}>
              {fmt(student.balance)} UZS
            </span>
          }
        />
        <InfoRow label="Expected Payments" value={`${fmt(student.expectedPayments)} UZS`} />
        <InfoRow label="Actual Payments" value={`${fmt(student.actualPayments)} UZS`} />
      </div>
      {student.unpaidMonths?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-base-content/50 uppercase tracking-wider mb-2">Unpaid Months</p>
          <div className="flex flex-wrap gap-1">
            {student.unpaidMonths.map((m) => (
              <span key={m} className="badge badge-error badge-outline badge-sm">{m}</span>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-base-200 rounded-lg px-3 py-2">
      <p className="text-xs text-base-content/50 mb-0.5">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

function CreateModal({ onClose, onCreated }) {
  const [mode, setMode] = useState('new') // 'new' | 'link'
  const [form, setForm] = useState({ name: '', phone: '', password: '', userId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = mode === 'link'
        ? { userId: form.userId }
        : { name: form.name, phone: form.phone, password: form.password }
      const { data } = await createStudent(payload)
      onCreated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to create student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Add Student">
      <div role="tablist" className="tabs tabs-boxed mb-4">
        <button
          role="tab"
          className={`tab ${mode === 'new' ? 'tab-active' : ''}`}
          onClick={() => setMode('new')}
          type="button"
        >
          Create New
        </button>
        <button
          role="tab"
          className={`tab ${mode === 'link' ? 'tab-active' : ''}`}
          onClick={() => setMode('link')}
          type="button"
        >
          Link Existing User
        </button>
      </div>

      {error && (
        <div className="alert alert-error py-2 text-sm mb-3">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'new' ? (
          <>
            <FormField label="Full Name" required>
              <input className="input input-bordered w-full" value={form.name} onChange={set('name')} required placeholder="Ali Karimov" />
            </FormField>
            <FormField label="Phone" required>
              <input className="input input-bordered w-full" value={form.phone} onChange={set('phone')} required placeholder="+998901234567" />
            </FormField>
            <FormField label="Password" required>
              <input type="password" className="input input-bordered w-full" value={form.password} onChange={set('password')} required placeholder="••••••••" />
            </FormField>
          </>
        ) : (
          <FormField label="User ID" required>
            <input className="input input-bordered w-full font-mono text-sm" value={form.userId} onChange={set('userId')} required placeholder="64f3a2b1c9e77e001f3a4d12" />
          </FormField>
        )}
        <div className="modal-action mt-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`} disabled={loading}>
            Add Student
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EditModal({ student, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: student.name ?? '',
    phone: student.phone ?? '',
    status: student.status ?? 'active',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await updateStudent(student.id, form)
      onUpdated(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Edit Student">
      {error && (
        <div className="alert alert-error py-2 text-sm mb-3"><span>{error}</span></div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Full Name">
          <input className="input input-bordered w-full" value={form.name} onChange={set('name')} placeholder="Ali Karimov" />
        </FormField>
        <FormField label="Phone">
          <input className="input input-bordered w-full" value={form.phone} onChange={set('phone')} placeholder="+998901234567" />
        </FormField>
        <FormField label="Status">
          <select className="select select-bordered w-full" value={form.status} onChange={set('status')}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </FormField>
        <div className="modal-action mt-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`} disabled={loading}>
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

function AssignGroupModal({ student, onClose, onAssigned }) {
  const [groupId, setGroupId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await assignStudentGroup(student.id, groupId)
      onAssigned(data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to assign group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={`Assign Group — ${student.name}`}>
      {error && (
        <div className="alert alert-error py-2 text-sm mb-3"><span>{error}</span></div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label="Group ID" required>
          <input
            className="input input-bordered w-full font-mono text-sm"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            placeholder="64f3a2b1c9e77e001f3a4d99"
          />
        </FormField>
        <div className="modal-action mt-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`} disabled={loading}>
            Assign
          </button>
        </div>
      </form>
    </Modal>
  )
}

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
      setError(err.response?.data?.error ?? 'Failed to delete student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title="Delete Student">
      {error && (
        <div className="alert alert-error py-2 text-sm mb-3"><span>{error}</span></div>
      )}
      <p className="text-sm text-base-content/70 mb-1">
        Are you sure you want to delete <span className="font-semibold text-base-content">{student.name}</span>?
      </p>
      <p className="text-xs text-base-content/40 mb-4">
        This is a soft delete — the student will be excluded from all future queries.
      </p>
      <div className="modal-action">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button
          className={`btn btn-error btn-sm ${loading ? 'loading' : ''}`}
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}

function FormField({ label, children, required }) {
  return (
    <div className="form-control">
      <label className="label pb-1">
        <span className="label-text font-medium">
          {label}{required && <span className="text-error ml-0.5">*</span>}
        </span>
      </label>
      {children}
    </div>
  )
}

// ─── pagination ──────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="join">
      <button className="join-item btn btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>«</button>
      {pages.map((p) => (
        <button
          key={p}
          className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button className="join-item btn btn-sm" disabled={page === totalPages} onClick={() => onChange(page + 1)}>»</button>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null) // { type, student? }

  const debouncedSearch = useDebounce(search, 400)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit: 10 }
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await getStudents(params)
      setStudents(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleCreated = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev])
  }

  const handleUpdated = (updated) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
  }

  const handleDeleted = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }

  const handleAssigned = (updated) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
  }

  const open = (type, student = null) => setModal({ type, student })
  const closeModal = () => setModal(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Students</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            {pagination.total} total students
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm gap-2" onClick={() => open('create')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
        )}
      </div>

      {/* Search */}
      <label className="input input-bordered flex items-center gap-2 w-full max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or phone…"
          className="grow bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-base-content/30 hover:text-base-content">
            ✕
          </button>
        )}
      </label>

      {/* Table card */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-0">
          {error && (
            <div className="alert alert-error m-4 py-2 text-sm"><span>{error}</span></div>
          )}

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/50 uppercase bg-base-200/50">
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-right">Balance</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                  <th>Unpaid</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-base-content/30">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover">
                      <td>
                        <div className="font-medium text-sm">{s.name}</div>
                      </td>
                      <td className="text-base-content/60 text-xs font-mono">{s.phone}</td>
                      <td>
                        <span className={`badge badge-sm capitalize ${STATUS_BADGE[s.status] ?? 'badge-ghost'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="text-right"><BalanceCell value={s.balance} /></td>
                      <td className="text-right text-sm">{fmt(s.debit)}</td>
                      <td className="text-right text-sm">{fmt(s.credit)}</td>
                      <td>
                        {s.unpaidMonths?.length > 0 ? (
                          <div className="tooltip" data-tip={s.unpaidMonths.join(', ')}>
                            <span className="badge badge-error badge-sm">{s.unpaidMonths.length} mo</span>
                          </div>
                        ) : (
                          <span className="text-base-content/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => open('detail', s)}
                          >
                            View
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => open('edit', s)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => open('assign', s)}
                              >
                                Group
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                                onClick={() => open('delete', s)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && students.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-base-200">
              <span className="text-xs text-base-content/40">
                Page {pagination.page} of {pagination.totalPages} — {pagination.total} records
              </span>
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'create' && (
        <CreateModal onClose={closeModal} onCreated={handleCreated} />
      )}
      {modal?.type === 'detail' && (
        <DetailModal student={modal.student} onClose={closeModal} />
      )}
      {modal?.type === 'edit' && (
        <EditModal student={modal.student} onClose={closeModal} onUpdated={handleUpdated} />
      )}
      {modal?.type === 'assign' && (
        <AssignGroupModal student={modal.student} onClose={closeModal} onAssigned={handleAssigned} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal student={modal.student} onClose={closeModal} onDeleted={handleDeleted} />
      )}
    </div>
  )
}
