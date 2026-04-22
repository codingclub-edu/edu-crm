import { useFetch } from '../../hooks/useFetch'
import { getAllCourses } from '../../api/courses'
import { PageShell, LoadingState, ErrorState, EmptyState } from '../../components/PageShell'

const STATUS_STYLE = {
  active:   'text-success',
  inactive: 'text-warning',
  archived: 'text-base-content/30',
}

function CourseRow({ course, index }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-base-200/50 transition-colors group">
      {/* Index */}
      <span className="text-sm font-mono text-base-content/20 w-6 shrink-0 text-right">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-base-content truncate">{course.title ?? course.name}</p>
        {course.description && (
          <p className="text-xs text-base-content/40 truncate mt-0.5">{course.description}</p>
        )}
      </div>

      {/* Meta chips — hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        {course.duration && (
          <span className="text-xs text-base-content/40">
            {course.duration} mo
          </span>
        )}
        {course.status && (
          <span className={`text-xs font-medium capitalize ${STATUS_STYLE[course.status] ?? 'text-base-content/40'}`}>
            {course.status}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <span className={`text-sm font-semibold tabular-nums ${course.price === 0 ? 'text-success' : 'text-base-content'}`}>
          {course.price === 0 ? 'Free' : `${Number(course.price).toLocaleString('ru-RU')} UZS`}
        </span>
      </div>
    </div>
  )
}

export default function Courses() {
  const { data, loading, error } = useFetch(getAllCourses)
  const courses = Array.isArray(data) ? data : []

  return (
    <PageShell title="Courses" subtitle={loading ? '' : `${courses.length} available`}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && courses.length === 0 && <EmptyState message="No courses available" />}

      {!loading && !error && courses.length > 0 && (
        <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-base-200 bg-base-200/40">
            <span className="w-6 shrink-0" />
            <span className="w-9 shrink-0" />
            <span className="flex-1 text-xs font-semibold text-base-content/40 uppercase tracking-wider">Course</span>
            <span className="hidden sm:block text-xs font-semibold text-base-content/40 uppercase tracking-wider">Duration</span>
            <span className="hidden sm:block text-xs font-semibold text-base-content/40 uppercase tracking-wider w-16">Status</span>
            <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider shrink-0">Price</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-base-200">
            {courses.map((c, i) => (
              <CourseRow key={c.id ?? c._id} course={c} index={i} />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}
