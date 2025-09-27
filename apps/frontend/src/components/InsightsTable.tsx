'use client'

import { useState, useEffect } from 'react'

interface Insight {
  date: string
  value: number
}

export default function InsightsTable({ refreshInterval = 10000 }) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInsights = async () => {
    try {
      const res = await fetch('http://localhost:8000/rag/insights')
      if (!res.ok) throw new Error('Failed to fetch insights.')
      const data = await res.json()
      console.log('Fetched insights:', data)  // <-- check backend response
      setInsights(data.insights || [])
      setError('')
    } catch (err) {
      console.error(err)
      setError('Could not load insights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
    const interval = setInterval(fetchInsights, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Insights</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading insights...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : insights.length === 0 ? (
        <p className="text-center text-gray-500">No insights available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-white rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Insight #{index + 1}</h3>
              <p className="text-gray-600">Date: {insight.date}</p>
              <p className="text-gray-800 font-bold">Value: {insight.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
