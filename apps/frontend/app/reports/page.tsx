'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../src/components/Sidebar'
import RequireAuth from '../../src/components/RequireAuth'
import { getAuth } from '../../src/components/auth'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type Report = {
  id: number
  kind: string
  content?: string
  created_at?: string
}

export default function ReportsPage() {
  const auth = getAuth()
  const role = auth?.role || 'analyst'
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [filter, setFilter] = useState('all')
  const [total, setTotal] = useState(0)

  const kindLabel = (kind: string) => {
    switch (kind) {
      case 'news': return 'News Report'
      case 'stock': return 'Stock Report'
      case 'search': return 'Search Report'
      default: return kind
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  // Fetch reports
  const fetchReports = async () => {
    if (!auth?.token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      })
      if (filter !== 'all') params.append('kind', filter)

      const res = await fetch(`${API_URL}/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch reports')

      const data = await res.json()
      const items = Array.isArray(data) ? data : data.items || []
      const totalCount = Array.isArray(data) ? data.length : data.total || items.length

      setReports(items)
      setTotal(totalCount)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    // Optional: poll every 15 seconds
    const interval = setInterval(fetchReports, 15000)
    return () => clearInterval(interval)
  }, [page, filter, auth?.token, API_URL])

  const paginatedReports = reports.slice((page - 1) * pageSize, page * pageSize)

  return (
    <RequireAuth>
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 fixed h-full">
          <Sidebar role={role} />
        </div>

        <main className="flex-1 ml-64 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Reports</h1>
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1) }}
              className="border rounded p-2"
            >
              <option value="all">All</option>
              <option value="news">News Report</option>
              <option value="stock">Stock Report</option>
              <option value="search">Search Report</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(pageSize).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded shadow">
                  <Skeleton height={20} width={120} className="mb-2" />
                  <Skeleton count={3} />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : paginatedReports.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedReports.map((r) => (
                <div key={r.id} className="p-4 bg-white rounded shadow hover:shadow-lg transition">
                  <h3 className="font-semibold">{kindLabel(r.kind)}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{r.content || 'No content available'}</p>
                  <p className="text-xs text-gray-400 mt-2">{r.created_at ? new Date(r.created_at).toLocaleString() : 'Unknown date'}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
