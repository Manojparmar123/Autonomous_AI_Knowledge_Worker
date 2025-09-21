"use client";
import LogCard from "./LogCard";

function formatDate(dateStr?: string) {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function GroupedLogs({ logs }: { logs: any[] }) {
  const groups: Record<string, any[]> = {};
  logs.forEach((log) => {
    const g = formatDate(log.created_at);
    if (!groups[g]) groups[g] = [];
    groups[g].push(log);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([day, items]) => (
        <div key={day}>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{day}</h2>
          <div className="space-y-3">
            {items.map((l) => <LogCard key={l.id + (l.job_type||'')} log={l} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
