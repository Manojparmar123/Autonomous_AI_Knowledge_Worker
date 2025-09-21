'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../../src/components/Sidebar'
import RequireAuth from '../../../src/components/RequireAuth'
import { getAuth } from '../../../src/components/auth'
import { TrendingUp, Lightbulb } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type Insight = {
  id: number
  title: string
  summary: string
  trend?: 'up' | 'neutral'
}

export default function InsightsPage() {
  const auth = getAuth()
  const role = auth?.role || 'analyst'
  const token = auth?.token
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const fetchInsights = async () => {
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_URL}/dashboard/insights?page=${page}&page_size=10&q=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) throw new Error(`Failed to fetch insights: ${res.status}`)

      const data = await res.json()
      const items: Insight[] = Array.isArray(data) ? data : data.items || []
      const total = Array.isArray(data) ? data.length : data.total || items.length
      const page_size = Array.isArray(data) ? 10 : data.page_size || 10

      setInsights(items)
      setTotalPages(Math.ceil(total / page_size))
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchInsights()
    }, 300)
    return () => clearTimeout(debounce)
  }, [page, search, token])

  useEffect(() => {
    const interval = setInterval(() => fetchInsights(), 300_000)
    return () => clearInterval(interval)
  }, [token, page, search])

  return (
    <RequireAuth>
      <div className="flex">
        <div className="w-64 fixed h-screen">
          <Sidebar role={role} />
        </div>

        <main className="flex-1 ml-64 p-6">
          <h1 className="text-2xl font-bold mb-4">Insights</h1>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search insights..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="border rounded px-3 py-2 w-64"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} height={100} />)}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : insights.length === 0 ? (
            <p>No insights found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {insights.map((i) => (
                <div key={i.id} className="p-4 bg-white rounded shadow">
                  <div className="flex items-center gap-2 mb-2">
                    {i.trend === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                    )}
                    <h3 className="font-semibold">{i.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{i.summary}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
