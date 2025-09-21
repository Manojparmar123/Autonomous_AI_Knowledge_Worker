"use client";
export default function LogCard({ log }: { log: any }) {
  return (
    <div className="p-4 bg-white shadow-sm rounded-xl border border-gray-200 flex justify-between items-center">
      <div>
        <p className="text-base font-medium text-gray-800">
          {log.label || `Run ${log.id} — ${log.job_type || "N/A"}`}
        </p>
        <p className="text-xs text-gray-500">
          {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "No timestamp"}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        log.status === "running" ? "bg-yellow-100 text-yellow-700" :
        log.status === "completed" ? "bg-green-100 text-green-700" :
        log.status === "failed" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"
      }`}>
        {log.status}
      </span>
    </div>
  );
}
