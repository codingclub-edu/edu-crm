import { useState, useEffect } from 'react'

export function useFetch(apiFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiFn()
      .then(({ data: res }) => { if (!cancelled) setData(res) })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error ?? 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
