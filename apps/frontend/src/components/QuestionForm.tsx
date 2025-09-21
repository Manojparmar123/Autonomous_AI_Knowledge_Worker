'use client'

import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

export default function LogCard({ logId }: { logId: number }) {
  const [log, setLog] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:8000/runs?limit=1&offset=${logId}`)
        const data = await res.json()
        if (data && data.length > 0) {
          setLog(data[0])
        }
      } catch (error) {
        console.error("Failed to fetch log:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLog()
  }, [logId])

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="p-4 bg-white rounded shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm">No data found</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded shadow-sm border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg">
      <div>
        <p className="text-base font-medium text-gray-800">
          {log.label || `Run ${log.id} — ${log.task_id || 'N/A'}`}
        </p>
        <p className="text-xs text-gray-500">
          {log.created_at ? new Date(log.created_at).toLocaleString() : 'No timestamp'}
        </p>
      </div>
      <span className={clsx(
        "px-3 py-1 rounded-full text-sm font-medium transition-colors duration-500",
        log.status === 'running' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
        log.status === 'completed' ? 'bg-green-100 text-green-700' :
        'bg-gray-200 text-gray-700'
      )}>
        {log.status}
      </span>
    </div>
  )
}
