"use client";
import Link from "next/link";

export default function Sidebar({ role }: { role?: string }) {
  const isAdmin = role === "admin";
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-6">AI Worker</h1>
      <nav className="flex flex-col gap-2">
        <Link href="/" className="hover:bg-gray-800 p-2 rounded">Dashboard</Link>
        <Link href="/dashboard/logs" className="hover:bg-gray-800 p-2 rounded">Logs</Link>
        <Link href="/dashboard/insights" className="hover:bg-gray-800 p-2 rounded">Insights</Link>
        <Link href="/reports" className="hover:bg-gray-800 p-2 rounded">Reports</Link>
        <Link href="/data-sources" className="hover:bg-gray-800 p-2 rounded">Data Sources</Link>
        {isAdmin && <Link href="/task-runner" className="hover:bg-gray-800 p-2 rounded">Scheduler</Link>}
        {isAdmin && <Link href="/admin" className="hover:bg-gray-800 p-2 rounded">Admin</Link>}
      </nav>
    </aside>
);
}
