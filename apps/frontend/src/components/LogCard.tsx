'use client'

import React from 'react'

interface Log {
  id?: number | string
  label?: string
  job_type?: string
  created_at?: string
  status?: string
}

export default function LogCard({ log }: { log: Log }) {
  return (
    <div className="p-4 bg-white rounded shadow-sm border border-gray-200 flex justify-between items-center">
      <div>
        <p className="text-base font-medium text-gray-800">
          {log.label || `Run ${log.id || 'N/A'} — ${log.job_type || 'Unknown'}`}
        </p>
        <p className="text-xs text-gray-500">
          {log.created_at ? new Date(log.created_at).toLocaleString() : 'No timestamp'}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        log.status === 'running' ? 'bg-yellow-100 text-yellow-700' :
        log.status === 'completed' ? 'bg-green-100 text-green-700' :
        log.status === 'failed' ? 'bg-red-100 text-red-700' :
        'bg-gray-200 text-gray-700'
      }`}>
        {log.status || 'unknown'}
      </span>
    </div>
  )
}
