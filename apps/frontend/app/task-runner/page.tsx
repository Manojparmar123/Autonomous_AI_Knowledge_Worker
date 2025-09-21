'use client'

import { useEffect, useState, useRef } from 'react'
import Sidebar from './../../src/components/Sidebar'
import RequireAuth from '../../src/components/RequireAuth'
import { getAuth } from '../../src/components/auth'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import toast, { Toaster } from 'react-hot-toast'

type TaskStatus = 'completed' | 'running' | 'failed'
type TaskType = 'news_report' | 'stock_report' | 'search_report'

type Task = {
  id: string
  job_type: TaskType
  status: TaskStatus
  created_at: string
  last_run?: string
  duration?: number // seconds
  error_message?: string
}

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'News Report', value: 'news_report' },
  { label: 'Stock Report', value: 'stock_report' },
  { label: 'Search Report', value: 'search_report' },
]

const REQUEST_TASK_OPTIONS = [
  { label: 'News', value: 'news' },
  { label: 'Stock', value: 'stock' },
  { label: 'Trends', value: 'trends' },
]

function TaskCard({ task }: { task: Task }) {
  const statusClasses: Record<TaskStatus, string> = {
    completed: 'bg-green-100 text-green-700',
    running: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }
  const icons: Record<TaskType, JSX.Element> = {
    news_report: <span>📰</span>,
    stock_report: <span>📈</span>,
    search_report: <span>🔍</span>,
  }

  return (
    <div className="p-4 bg-white rounded shadow flex justify-between items-center">
      <div className="flex items-center space-x-2">
        {icons[task.job_type]}
        <div>
          <h3 className="font-semibold capitalize">{task.job_type}</h3>
          <p className="text-sm text-gray-600">
            {task.created_at
              ? new Date(task.created_at).toLocaleString()
              : 'Unknown time'}
          </p>
          {task.last_run && (
            <p className="text-xs text-gray-500">
              Last Run: {new Date(task.last_run).toLocaleString()} | Duration: {task.duration ?? '-'}s
            </p>
          )}
          {task.error_message && (
            <p className="text-xs text-red-600">Error: {task.error_message}</p>
          )}
        </div>
      </div>
      <span className={`px-3 py-1 rounded text-sm ${statusClasses[task.status]}`}>
        {task.status}
      </span>
    </div>
  )
}

export default function TaskRunner() {
  const auth = getAuth()
  const role = auth?.role || 'analyst'

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [filter, setFilter] = useState('all')
  const [requesting, setRequesting] = useState(false)

  const fetchTasks = async () => {
    if (!auth?.token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/dashboard/logs?limit=100&offset=0`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      )
      if (!res.ok) throw new Error('Failed to fetch tasks')

      const data = await res.json()
      const normalizedTasks: Task[] = data.items || []

      const filteredTasks =
        filter === 'all'
          ? normalizedTasks
          : normalizedTasks.filter((t) => t.job_type === filter)

      setTasks(filteredTasks)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const requestTask = async (taskType: string) => {
    if (!auth?.token) {
      toast.error('Not authenticated')
      return
    }
    setRequesting(true)
    toast.loading('Requesting task...', { id: 'req-task' })
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/dashboard/request-task?task_type=${taskType}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      )
      if (!res.ok) throw new Error('Failed to request task')

      toast.success('Task started!', { id: 'req-task' })
      await fetchTasks()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Request failed', { id: 'req-task' })
    } finally {
      setRequesting(false)
    }
  }

  // SSE Real-time updates
  const eventSourceRef = useRef<EventSource | null>(null)
  useEffect(() => {
    if (!auth?.token) return
    fetchTasks()

    const sse = new EventSource(`http://127.0.0.1:8000/dashboard/stream-tasks?token=${auth.token}`)
    eventSourceRef.current = sse

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const filteredTasks =
        filter === 'all'
          ? data.tasks
          : data.tasks.filter((t: Task) => t.job_type === filter)
      setTasks(filteredTasks)
    }

    sse.onerror = () => sse.close()
    return () => sse.close()
  }, [auth?.token, filter])

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedTasks = tasks.slice(start, end)
  const totalPages = Math.ceil(tasks.length / pageSize)

  return (
    <RequireAuth>
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 fixed h-full">
          <Sidebar role={role} />
        </div>

        <main className="flex-1 ml-64 p-6 overflow-y-auto">
          <Toaster position="top-right" />
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Task Runner (Scheduler)</h1>
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value)
                  setPage(1)
                }}
                className="border rounded p-2"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value !== '') requestTask(e.target.value)
                  e.target.value = ''
                }}
                className="border rounded p-2"
                disabled={requesting}
                defaultValue=""
              >
                <option value="">+ Request New Task</option>
                {REQUEST_TASK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(pageSize)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white rounded shadow flex justify-between items-center"
                  >
                    <div>
                      <Skeleton width={120} height={20} className="mb-2" />
                      <Skeleton width={80} height={16} />
                    </div>
                    <Skeleton width={60} height={24} />
                  </div>
                ))}
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : paginatedTasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>

              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-2">
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
            </>
          )}
        </main>
      </div>
    </RequireAuth>
  )
}
