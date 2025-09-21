'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// ---- Types ----
type Log = {
  id: string
  created_at: string
  status: 'completed' | 'failed' | 'running'
}

export default function ChartCard() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B']

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/dashboard/logs?limit=100`
        )
        if (!res.ok) throw new Error('Failed to fetch logs')
        const data = await res.json()
        setLogs(data.items || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const barData = getBarData(logs)
  const lineData = getLineData(logs)
  const pieData = getPieData(logs)

  return (
    <div>
      {loading && <p className="text-gray-500 text-center mb-4">Loading logs...</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {!loading && !error && logs.length === 0 && (
        <p className="text-gray-500 text-center mb-4">No logs found</p>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Tasks */}
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Daily Tasks</h4>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trends */}
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Trends</h4>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="value" stroke="#4F46E5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Status</h4>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={60}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Helpers ----
function getBarData(logs: Log[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const count: Record<string, number> = {}
  logs.forEach(log => {
    const date = new Date(log.created_at)
    const day = days[date.getDay()]
    count[day] = (count[day] || 0) + 1
  })
  return days.map(day => ({ name: day, value: count[day] || 0 }))
}

function getLineData(logs: Log[]) {
  const count: Record<string, number> = {}
  logs.forEach(log => {
    const date = new Date(log.created_at)
    const key = date.toISOString().split('T')[0]
    count[key] = (count[key] || 0) + 1
  })
  const sortedKeys = Object.keys(count).sort()
  return sortedKeys.map(key => ({ name: key, value: count[key] }))
}

function getPieData(logs: Log[]) {
  const statusCount: Record<'completed' | 'failed' | 'running', number> = {
    completed: 0,
    failed: 0,
    running: 0,
  }
  logs.forEach(log => {
    if (log.status === 'completed') statusCount.completed++
    else if (log.status === 'failed') statusCount.failed++
    else statusCount.running++
  })
  return [
    { name: 'Completed', value: statusCount.completed },
    { name: 'Failed', value: statusCount.failed },
    { name: 'Running', value: statusCount.running },
  ]
}
