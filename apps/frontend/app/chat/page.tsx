// 'use client'

// import RequireAuth from '../../src/components/RequireAuth'
// import ChatWindow from '../../src/components/ChatWindow'
// import { useState, useEffect, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import { ArrowLeft } from 'lucide-react'

// interface Chat {
//   messages: { id: number; text: string; sender: string; time: string }[]
//   title?: string
// }

// interface Report {
//   id: number
//   title: string
//   summary: string
// }

// export default function ChatPage() {
//   const router = useRouter()
//   const chatRef = useRef<any>(null)

//   const [role, setRole] = useState<string>('user')
//   const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
//   const [selectedReport, setSelectedReport] = useState<Report | null>(null)

//   const reports: Report[] = [
//     { id: 1, title: 'Monthly Sales', summary: 'Sales increased by 20% in August.' },
//     { id: 2, title: 'Server Uptime', summary: 'Uptime 99.9% for the last month.' },
//     { id: 3, title: 'User Engagement', summary: 'Active users increased by 15%.' },
//   ]

//   useEffect(() => {
//     setRole('user')
//     const savedHistory: Chat[] = JSON.parse(localStorage.getItem('chatHistory') || '[]')
//     if (savedHistory.length > 0) {
//       setSelectedChat(savedHistory[savedHistory.length - 1])
//     }
//   }, [])

//   const handleBack = () => {
//     router.push('/dashboard') // Navigate back to dashboard
//   }

//   const handleReportClick = (report: Report) => {
//     setSelectedReport(report)
//     if (chatRef.current?.injectMessage) {
//       chatRef.current.injectMessage(
//         `Selected Report: ${report.title}\nSummary: ${report.summary}`
//       )
//     }
//   }

//   return (
//     <RequireAuth>
//       <div className="flex h-screen bg-gray-100">
//         {/* Chat Section */}
//         <div className="flex-1 flex flex-col">
//           {/* Back button at the top */}
//           <div className="p-3 bg-white shadow flex items-center border-b border-gray-200">
//             <button
//               onClick={handleBack}
//               className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
//             >
//               <ArrowLeft className="w-4 h-4" /> Back
//             </button>
//           </div>

//           <ChatWindow ref={chatRef} selectedChat={selectedChat} onBack={handleBack} />
//         </div>

//         {/* Reports Section */}
//         <div className="w-80 bg-gray-50 p-4 flex flex-col overflow-y-auto border-l border-gray-200">
//           <h2 className="font-bold text-lg mb-4 text-gray-800">Reports</h2>

//           <div className="space-y-2">
//             {reports.map((report) => (
//               <button
//                 key={report.id}
//                 onClick={() => handleReportClick(report)}
//                 className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition truncate ${
//                   selectedReport?.id === report.id ? 'bg-gray-200 font-medium' : 'bg-white shadow-sm'
//                 }`}
//               >
//                 {report.title}
//               </button>
//             ))}
//           </div>

//           {selectedReport && (
//             <div className="mt-4 p-3 border rounded bg-white text-gray-800 shadow-sm">
//               <h3 className="font-semibold">{selectedReport.title}</h3>
//               <p className="text-sm mt-1">{selectedReport.summary}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </RequireAuth>
//   )
// }


'use client'

import RequireAuth from '../../src/components/RequireAuth'
import ChatWindow from '../../src/components/ChatWindow'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// Update the Chat interface to match ChatWindow's expectations
interface Chat {
  title: string  // Make title required, not optional
  messages: Array<{
    id: number
    text: string
    sender: 'user' | 'bot'  // Match the exact type from ChatWindow
    type: 'text' | 'file'   // Add the type field
    time: string
    filename?: string        // Add optional filename for file messages
  }>
}

interface Report {
  id: number
  title: string
  summary: string
}

// Define the ref type to match ChatWindow
interface ChatWindowRef {
  injectMessage: (text: string) => void
}

export default function ChatPage() {
  const router = useRouter()
  const chatRef = useRef<ChatWindowRef | null>(null)

  const [role, setRole] = useState<string>('user')
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const reports: Report[] = [
    { id: 1, title: 'Monthly Sales', summary: 'Sales increased by 20% in August.' },
    { id: 2, title: 'Server Uptime', summary: 'Uptime 99.9% for the last month.' },
    { id: 3, title: 'User Engagement', summary: 'Active users increased by 15%.' },
  ]

  useEffect(() => {
    setRole('user')
    const savedHistory: Chat[] = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    if (savedHistory.length > 0) {
      // Ensure the loaded chat has all required properties
      const lastChat = savedHistory[savedHistory.length - 1]
      // Provide a default title if missing
      if (!lastChat.title) {
        lastChat.title = `Chat ${savedHistory.length}`
      }
      // Ensure messages have correct types
      lastChat.messages = lastChat.messages.map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'bot',
        type: msg.type || 'text' as 'text' | 'file'
      }))
      setSelectedChat(lastChat)
    }
  }, [])

  const handleBack = () => {
    router.push('/dashboard') // Navigate back to dashboard
  }

  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    if (chatRef.current?.injectMessage) {
      chatRef.current.injectMessage(
        `Selected Report: ${report.title}\nSummary: ${report.summary}`
      )
    }
  }

  return (
    <RequireAuth>
      <div className="flex h-screen bg-gray-100">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Back button at the top */}
          <div className="p-3 bg-white shadow flex items-center border-b border-gray-200">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <ChatWindow ref={chatRef} selectedChat={selectedChat} onBack={handleBack} />
        </div>

        {/* Reports Section */}
        <div className="w-80 bg-gray-50 p-4 flex flex-col overflow-y-auto border-l border-gray-200">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Reports</h2>

          <div className="space-y-2">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleReportClick(report)}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition truncate ${
                  selectedReport?.id === report.id ? 'bg-gray-200 font-medium' : 'bg-white shadow-sm'
                }`}
              >
                {report.title}
              </button>
            ))}
          </div>

          {selectedReport && (
            <div className="mt-4 p-3 border rounded bg-white text-gray-800 shadow-sm">
              <h3 className="font-semibold">{selectedReport.title}</h3>
              <p className="text-sm mt-1">{selectedReport.summary}</p>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}