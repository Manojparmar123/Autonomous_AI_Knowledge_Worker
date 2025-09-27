'use client'

import { useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import ChatWindow from '@/components/ChatWindow'

export default function ReportsChatPage() {
  const chatRef = useRef(null)
  const [selectedReport, setSelectedReport] = useState(null)

  const reports = [
    { id: 1, title: 'Monthly Sales', summary: 'Sales increased by 20% in August.' },
    { id: 2, title: 'Server Uptime', summary: 'Uptime 99.9% for the last month.' },
    { id: 3, title: 'User Engagement', summary: 'Active users increased by 15%.' },
  ]

  const handleReportClick = (report) => {
    setSelectedReport(report)
    if (chatRef.current) {
      chatRef.current.injectMessage(
        `Selected Report: ${report.title}\nSummary: ${report.summary}`
      )
    }
  }

  return (
    <div className="flex h-screen">
      {/* Chat Section (Left) */}
      <div className="flex-1 flex flex-col">
        <ChatWindow ref={chatRef} />
      </div>

      {/* Reports Section (Right) */}
      <div className="w-80 bg-gray-50 p-4 flex flex-col overflow-y-auto border-l border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Reports</h2>

        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => handleReportClick(report)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition truncate bg-white shadow-sm"
            >
              {report.title}
            </button>
          ))}
        </div>

        {/* Selected Report Details */}
        {selectedReport && (
          <div className="mt-4 p-3 border rounded bg-white text-gray-800 shadow-sm">
            <h3 className="font-semibold">{selectedReport.title}</h3>
            <p className="text-sm mt-1">{selectedReport.summary}</p>
          </div>
        )}
      </div>
    </div>
  )
}
