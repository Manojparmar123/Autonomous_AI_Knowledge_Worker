'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../src/components/Sidebar';
import RequireAuth from '../../src/components/RequireAuth';
import InsightsChart from '../../src/components/InsightsChart';
import { getAuth } from '../../src/components/auth';
import { Activity, FileText, BarChart2, AlertTriangle } from 'lucide-react';
import CountUp from 'react-countup';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type Run = { id: number; status: string; name?: string; [key: string]: any };
type Report = { id: number; name?: string; created_at?: string; [key: string]: any };
type Insight = { date: string; revenue?: number; users?: number; [key: string]: any };

export default function DashboardPage() {
  const auth = getAuth();
  const role = auth?.role || 'analyst';
  const token = auth?.token;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [totalRuns, setTotalRuns] = useState<number>(0);
  const [runningJobs, setRunningJobs] = useState<number>(0);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [chartData, setChartData] = useState<Insight[]>([]);
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [apiHealth, setApiHealth] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError('');

      try {
        // API Health Check
        const healthRes = await fetch(`${API_URL}/health`);
        setApiHealth(healthRes.ok);

        // Fetch Runs
        const runsRes = await fetch(`${API_URL}/runs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!runsRes.ok) throw new Error('Failed to fetch runs');
        const runsData: Run[] = await runsRes.json();
        setTotalRuns(runsData.length);
        setRunningJobs(runsData.filter((r) => r.status === 'running').length);
        setRecentRuns(runsData.slice(-5).reverse());

        // Fetch Reports
        const reportsRes = await fetch(`${API_URL}/reports`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!reportsRes.ok) throw new Error('Failed to fetch reports');
        const reportsData: Report[] = await reportsRes.json();
        setTotalReports(reportsData.length);
        setRecentReports(reportsData.slice(-5).reverse());

        // Fetch Insights
        const insightsRes = await fetch(`${API_URL}/rag/insights`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!insightsRes.ok) throw new Error('Failed to fetch insights');
        const insightsJson = await insightsRes.json();
        setChartData(insightsJson?.insights || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [API_URL, token]);

  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-gray-100">
        <div className="fixed top-0 left-0 h-screen z-50">
          <Sidebar role={role} />
        </div>

        <main className="flex-1 ml-64 p-4 md:p-6 overflow-y-auto h-screen">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded mb-6 text-center font-medium">{error}</p>
          )}
          {!apiHealth && (
            <div className="flex items-center justify-center bg-yellow-100 text-yellow-800 p-3 rounded mb-6 font-medium">
              <AlertTriangle className="w-5 h-5 mr-2" /> Backend API seems down
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <Card icon={<Activity />} label="Total Runs" value={totalRuns} loading={loading} />
            <Card icon={<BarChart2 />} label="Running Jobs" value={runningJobs} loading={loading} />
            <Card icon={<FileText />} label="Reports Generated" value={totalReports} loading={loading} />
          </section>

          <section className="mb-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Daily Insights</h2>
            {loading ? <Skeleton height={250} /> : (
              <InsightsChart
                data={chartData}
                lines={[
                  { key: 'revenue', color: '#6b21a8', name: 'Revenue' },
                  { key: 'users', color: '#ea580c', name: 'Users' },
                ]}
                title=""
              />
            )}
          </section>

          <DataTable title="Recent Runs" data={recentRuns} columns={['id','name','status']} loading={loading} type="run" />
          <DataTable title="Recent Reports" data={recentReports} columns={['id','name','created_at']} loading={loading} type="report" />
        </main>
      </div>
    </RequireAuth>
  );
}

// -------------------- Card Component --------------------
function Card({ icon, label, value, loading }: { icon: JSX.Element; label: string; value: number; loading: boolean }) {
  return (
    <div className="flex items-center p-5 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm uppercase opacity-80">{label}</p>
        <p className="text-2xl font-bold">
          {loading ? <Skeleton width={60} /> : <CountUp end={value} duration={1.5} />}
        </p>
      </div>
    </div>
  );
}

// -------------------- Data Table Component --------------------
function DataTable({ title, data, columns, loading, type }: { title: string; data: any[]; columns: string[]; loading: boolean; type: 'run' | 'report' }) {
  return (
    <section className="mb-6 bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {loading ? <Skeleton count={5} height={30} /> : (
        <table className="min-w-full table-auto border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600 uppercase text-sm">
              {columns.map((col) => <th key={col} className="px-4 py-2">{col.replace('_',' ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-2 text-gray-500 text-center">No data found</td></tr>
            ) : data.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-gray-700">
                    {col === 'status' ? (
                      <span className={`px-2 py-1 rounded-full text-white text-xs ${
                        item.status === 'running' ? 'bg-yellow-500' :
                        item.status === 'completed' ? 'bg-green-600' : 'bg-gray-400'
                      }`}>{item.status}</span>
                    ) : item[col] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

