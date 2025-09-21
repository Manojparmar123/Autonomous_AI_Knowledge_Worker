'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  BarChart2,
  Activity,
  Settings,
  MessageCircle,
  Shield,
} from 'lucide-react';

export default function Sidebar({ role }: { role?: string }) {
  const isAdmin = role === 'admin';
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/dashboard/logs', label: 'Logs', icon: <Activity className="w-5 h-5" /> },
    { href: '/dashboard/insights', label: 'Insights', icon: <BarChart2 className="w-5 h-5" /> },
    { href: '/reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { href: '/task-runner', label: 'Scheduler', icon: <Settings className="w-5 h-5" /> },
    { href: '/chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
  ];

  if (isAdmin) {
    links.push({ href: '/admin', label: 'Admin', icon: <Shield className="w-5 h-5" /> });
  }

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white flex flex-col p-4 shadow-lg">
      {/* Logo / Title */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide text-purple-100">AI Worker</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-purple-700 ${
                isActive ? 'bg-gradient-to-r from-purple-700 to-indigo-700 font-semibold shadow-inner' : ''
              }`}
            >
              {link.icon}
              <span className="text-sm text-purple-50">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / optional user info */}
      <div className="mt-auto p-4 border-t border-purple-700 text-sm opacity-80 text-purple-200">
        Logged in as: <span className="font-semibold">{role || 'Analyst'}</span>
      </div>
    </aside>
  );
}
