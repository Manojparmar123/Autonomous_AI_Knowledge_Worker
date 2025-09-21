'use client'

import { useState, useEffect } from 'react'

export default function InsightsTable() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('http://localhost:8000/insights')
        if (!res.ok) {
          throw new Error('Failed to fetch insights.')
        }
        const data = await res.json()
        setInsights(data)
      } catch (err) {
        console.error(err)
        setError('Could not load insights.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  return (
    <div className="p-4 bg-white rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Insights</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading insights...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : insights.length === 0 ? (
        <p className="text-center text-gray-500">No insights available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Title</th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((insight) => (
                <tr key={insight.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">{insight.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{insight.title || 'No title'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {new Date(insight.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
