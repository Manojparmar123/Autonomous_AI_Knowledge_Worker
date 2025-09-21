'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../../src/components/Sidebar'
import RequireAuth from '../../../src/components/RequireAuth'
import { getAuth } from '../../../src/components/auth'
import GroupedLogs from '../../../src/components/GroupedLogs'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type Log = {
  id: number
  job_type: string
  status: string
  created_at: string
}

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'News Report', value: 'news_report' },
  { label: 'Stock Report', value: 'stock_report' },
  { label: 'Search Report', value: 'search_report' },
]

export default function LogsPage() {
  const auth = getAuth()
  const role = auth?.role || 'analyst'
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [filter, setFilter] = useState('all')

  // Fetch logs from API
  useEffect(() => {
    if (!auth?.token) return

    async function loadLogs() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_URL}/dashboard/logs?limit=100&offset=0`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        )
        if (!res.ok) throw new Error('Failed to fetch logs')
        const data = await res.json()
        const normalizedLogs: Log[] = data?.items || []

        const filtered =
          filter === 'all'
            ? normalizedLogs
            : normalizedLogs.filter((log) => log.job_type === filter)

        setLogs(filtered)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [auth?.token, filter, API_URL])

  // WebSocket real-time updates
  useEffect(() => {
    if (!auth?.token) return

    const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws/logs?token=${auth.token}`)

    ws.onmessage = (event) => {
      try {
        const newLog: Log = JSON.parse(event.data)
        if (filter === 'all' || newLog.job_type === filter) {
          setLogs((prev) => {
            const exists = prev.find((l) => l.id === newLog.id)
            if (exists) return prev
            return [newLog, ...prev]
          })
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err)
      }
    }

    ws.onerror = (err) => console.error('WebSocket error', err)

    return () => ws.close()
  }, [auth?.token, filter, API_URL])

  // Pagination
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedLogs = logs.slice(start, end)
  const totalPages = Math.ceil(logs.length / limit)

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value)
    setPage(1)
  }

  return (
    <RequireAuth>
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r z-10">
          <Sidebar role={role} />
        </div>

        <main className="flex-1 p-6 ml-64">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Logs</h1>
            <select
              value={filter}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array(limit)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} height={40} />
                ))}
            </div>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : paginatedLogs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            <GroupedLogs logs={paginatedLogs} />
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
