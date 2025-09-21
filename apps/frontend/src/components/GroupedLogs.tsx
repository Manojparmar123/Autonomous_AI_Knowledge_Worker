type Log = {
  id: number
  job_type: string
  status: string
  created_at: string
}

export default function GroupedLogs({ logs }: { logs: Log[] | any }) {
  // Ensure logs is always an array
  const safeLogs: Log[] = Array.isArray(logs) ? logs : []

  return (
    <div className="space-y-3">
      {safeLogs.length === 0 ? (
        <p className="text-gray-500">No logs found.</p>
      ) : (
        safeLogs.map((log) => (
          <div key={log.id} className="p-4 bg-white rounded shadow">
            <p className="font-medium">{log.job_type}</p>
            <p className="text-sm text-gray-600">Status: {log.status}</p>
            <p className="text-xs text-gray-400">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
