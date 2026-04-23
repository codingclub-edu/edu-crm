import { useFetch } from '../../hooks/useFetch'
import { getMyPayments } from '../../api/payments'
import { PageShell, LoadingState, ErrorState, EmptyState } from '../../components/PageShell'

const fmt = (n) => Number(n ?? 0).toLocaleString('ru-RU')

const DK_STYLE = {
  credit: { text: 'text-success', sign: '+', label: 'Credit' },
  debit:  { text: 'text-error',   sign: '−', label: 'Debit' },
}

export default function Payments() {
  const { data, loading, error } = useFetch(getMyPayments)
  const records = Array.isArray(data) ? data : []

  const totalCredit = records.filter((r) => r.dk === 'credit').reduce((s, r) => s + Number(r.amount ?? 0), 0)
  const totalDebit  = records.filter((r) => r.dk === 'debit').reduce((s, r) => s + Number(r.amount ?? 0), 0)

  return (
    <PageShell title="My Payments" subtitle={loading ? '' : `${records.length} transaction${records.length !== 1 ? 's' : ''}`}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {/* Summary */}
          {records.length > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm p-4">
                <p className="text-xs text-base-content/40 uppercase tracking-wider mb-1">Total Paid</p>
                <p className="text-xl font-bold text-success tabular-nums">
                  {fmt(totalCredit)} <span className="text-xs font-normal text-base-content/30">UZS</span>
                </p>
              </div>
              <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm p-4">
                <p className="text-xs text-base-content/40 uppercase tracking-wider mb-1">Total Debit</p>
                <p className="text-xl font-bold text-error tabular-nums">
                  {fmt(totalDebit)} <span className="text-xs font-normal text-base-content/30">UZS</span>
                </p>
              </div>
            </div>
          )}

          {records.length === 0 ? (
            <EmptyState message="No payment records found" />
          ) : (
            <div className="rounded-2xl bg-base-100 border border-base-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-2.5 bg-base-200/40 border-b border-base-200">
                <span className="hidden sm:block text-xs font-semibold text-base-content/40 uppercase tracking-wider">Date</span>
                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Type</span>
                <span className="hidden sm:block text-xs font-semibold text-base-content/40 uppercase tracking-wider">Month</span>
                <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider text-right">Amount</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-base-200">
                {records.map((r) => {
                  const dk = DK_STYLE[r.dk] ?? DK_STYLE.credit
                  const date = r.date
                    ? new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'

                  return (
                    <div
                      key={r.id}
                      className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-base-200/40 transition-colors"
                    >
                      {/* Date */}
                      <p className="hidden sm:block text-sm text-base-content/50 tabular-nums whitespace-nowrap">{date}</p>

                      {/* Type + mobile date */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${r.dk === 'credit' ? 'bg-success' : 'bg-error'} shrink-0`} />
                          <p className="text-sm font-medium text-base-content capitalize truncate">
                            {r.type?.name ?? r.dk}
                          </p>
                        </div>
                        {/* Show date on mobile */}
                        <p className="sm:hidden text-xs text-base-content/40 mt-0.5">{date}</p>
                      </div>

                      {/* Month */}
                      <span className="hidden sm:block text-xs text-base-content/40 font-mono">{r.month ?? '—'}</span>

                      {/* Amount */}
                      <p className={`text-sm font-bold tabular-nums text-right ${dk.text}`}>
                        {dk.sign}{fmt(r.amount)}
                        <span className="text-xs font-normal text-base-content/30 ml-0.5">UZS</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
