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

  const fetchInsights = async () => {
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/rag/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(`Failed to fetch insights: ${res.status}`)

      const data = await res.json()
      console.log('Fetched insights:', data) // debug

      // Map backend data to frontend cards
      const items: Insight[] = (data.insights || []).map((i: any, idx: number) => ({
        id: idx + 1,
        title: `Insight for ${i.date}`,
        summary: `Value: ${i.value}`,
        trend: i.value > 0 ? 'up' : 'neutral'
      }))

      setInsights(items)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [token])

  return (
    <RequireAuth>
      <div className="flex">
        <div className="w-64 fixed h-screen">
          <Sidebar role={role} />
        </div>

        <main className="flex-1 ml-64 p-6">
          <h1 className="text-2xl font-bold mb-4">Insights</h1>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} height={100} />
              ))}
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
        </main>
      </div>
    </RequireAuth>
  )
}
