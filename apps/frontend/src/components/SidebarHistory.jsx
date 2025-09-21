'use client'

import { useEffect, useState } from 'react'

export default function SidebarHistory({ onSelectChat }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory")
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleSelect = (chat) => {
    onSelectChat(chat)
  }

  return (
    <div className="w-64 h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Chat History</h3>
      {history.length === 0 ? (
        <p className="text-sm text-gray-400">No previous chats.</p>
      ) : (
        history.map((chat, index) => (
          <div key={index} className="mb-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
               onClick={() => handleSelect(chat)}>
            {chat.title || `Chat ${index + 1}`}
          </div>
        ))
      )}
    </div>
  )
}
