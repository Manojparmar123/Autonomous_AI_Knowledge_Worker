// 'use client'

// import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
// import { Send, Loader2, Paperclip, ArrowLeft, Plus } from 'lucide-react'
// import ReactMarkdown from 'react-markdown'
// import rehypeHighlight from 'rehype-highlight'
// import 'highlight.js/styles/github.css'

// const ChatWindow = forwardRef(({ selectedChat, onBack }, ref) => {
//   const [messages, setMessages] = useState([])
//   const [input, setInput] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [files, setFiles] = useState([])
//   const [uploading, setUploading] = useState(false)
//   const [history, setHistory] = useState([])
//   const messagesEndRef = useRef(null)

//   // Expose injectMessage to parent via ref
//   useImperativeHandle(ref, () => ({
//     injectMessage: (text) => {
//       const botMsg = {
//         id: Date.now(),
//         text,
//         sender: 'bot',
//         type: 'text',
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       }
//       const updated = [...messages, botMsg]
//       setMessages(updated)
//       saveChat(updated)
//     }
//   }))

//   useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, files])
//   useEffect(() => { if (selectedChat) setMessages(selectedChat.messages || []) }, [selectedChat])
//   useEffect(() => {
//     const savedHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
//     setHistory(savedHistory)
//     if (!selectedChat && savedHistory.length > 0) setMessages(savedHistory[savedHistory.length - 1].messages)
//   }, [selectedChat])

//   const saveChat = (msgs) => {
//     const savedHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
//     const newEntry = { 
//       title: msgs[0]?.text?.substring(0, 20) || `Chat ${Date.now()}`, 
//       messages: msgs 
//     }
//     const filtered = savedHistory.filter(h => h.title !== newEntry.title)
//     const updated = [...filtered, newEntry]
//     localStorage.setItem("chatHistory", JSON.stringify(updated))
//     setHistory(updated)
//   }

//   const handleSend = async () => {
//     if (!input.trim()) return
//     const userMsg = {
//       id: Date.now(),
//       text: input,
//       sender: "user",
//       type: "text",
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     }
//     const updatedMessages = [...messages, userMsg]
//     setMessages(updatedMessages)
//     setInput("")
//     setLoading(true)

//     try {
//       const res = await fetch("http://localhost:8000/rag/ask", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: userMsg.text }),
//       })
//       const data = await res.json()
//       const botMsg = {
//         id: Date.now() + 1,
//         text: data.answer || "Sorry, I couldn't find an answer.",
//         sender: "bot",
//         type: "text",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       }
//       const finalMessages = [...updatedMessages, botMsg]
//       setMessages(finalMessages)
//       saveChat(finalMessages)
//     } catch (error) {
//       console.error("Chat error:", error)
//       const errorMsg = {
//         id: Date.now() + 2,
//         text: "Error: Could not fetch response. Please try again.",
//         sender: "bot",
//         type: "text",
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       }
//       setMessages(prev => [...prev, errorMsg])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     setUploading(true)
//     const formData = new FormData()
//     formData.append("file", file)
//     try {
//       const res = await fetch("http://localhost:8000/rag/upload", { method: "POST", body: formData })
//       const data = await res.json()
//       if (data.status === "success") {
//         const fileMsg = {
//           id: Date.now() + 1,
//           sender: "user",
//           type: "file",
//           filename: data.filename,
//           text: file.name,
//           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         }
//         const updatedMessages = [...messages, fileMsg]
//         setMessages(updatedMessages)
//         saveChat(updatedMessages)
//         setFiles([...files, fileMsg])

//         // Auto-ingest
//         const ingestForm = new FormData()
//         ingestForm.append("filename", data.filename)
//         await fetch("http://localhost:8000/rag/ingest", { method: "POST", body: ingestForm })
//           .catch(err => console.error("Ingest error:", err))
//       }
//     } catch (error) {
//       console.error("Upload error:", error)
//     } finally {
//       setUploading(false)
//       e.target.value = null
//     }
//   }

//   const removeFile = (msgId) => {
//     setFiles(files.filter(f => f.id !== msgId))
//     setMessages(messages.filter(m => m.id !== msgId))
//   }

//   const openChat = (chat) => setMessages(chat.messages)
//   const newChat = () => setMessages([])

//   return (
//     <div className="flex h-screen shadow-lg">
//       {/* Sidebar */}
//       <div className="w-72 bg-gradient-to-b from-purple-800 via-purple-700 to-purple-600 text-white flex flex-col">
//         <div className="p-4 flex justify-between items-center border-b border-purple-900">
//           <button onClick={newChat} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded-lg text-sm transition">
//             <Plus className="w-4 h-4" /> New Chat
//           </button>
//           {onBack && (
//             <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-gray-200 text-sm">
//               <ArrowLeft className="w-4 h-4" /> Back
//             </button>
//           )}
//         </div>

//         <div className="flex-1 overflow-y-auto p-3 space-y-2">
//           {history.map((chat, i) => (
//             <button key={i} onClick={() => openChat(chat)}
//               className="w-full text-left px-4 py-2 bg-purple-800 rounded-lg hover:bg-purple-700 truncate transition">
//               {chat.title || `Chat ${i+1}`}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className="flex flex-col flex-1 bg-gray-50">
//         <div className="p-4 bg-white shadow-md flex justify-between items-center border-b border-gray-200">
//           <span className="font-bold text-lg text-gray-800">Chat Assistant 🤖</span>
//           <span className="text-sm text-gray-500">{loading ? "Typing..." : "Online"}</span>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map(msg => (
//             <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
//               {msg.type === "text" ? (
//                 <div className={`max-w-[70%] p-4 rounded-xl shadow ${msg.sender === "user" ? "bg-purple-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"} transition whitespace-pre-wrap`}>
//                   <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.text}</ReactMarkdown>
//                   <span className="block text-xs mt-1 text-gray-400 text-right">{msg.time}</span>
//                 </div>
//               ) : (
//                 <div className={`max-w-[70%] p-3 rounded-xl border-dashed border-2 ${msg.sender === "user" ? "border-purple-600 text-purple-800 bg-purple-50 rounded-br-none" : "border-gray-300 text-gray-700 bg-gray-100 rounded-bl-none"} flex justify-between items-center`}>
//                   <span className="truncate">{msg.text}</span>
//                   <button onClick={() => removeFile(msg.id)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
//                 </div>
//               )}
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         <div className="p-3 border-t bg-white flex flex-col gap-2">
//           <div className="flex items-center gap-2">
//             <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full bg-gray-200 hover:bg-gray-300">
//               <Paperclip className="w-5 h-5" />
//             </label>
//             <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSend()}
//               placeholder="Type a message..."
//               className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
//             />
//             <button
//               onClick={handleSend}
//               disabled={loading || uploading}
//               className={`p-2 rounded-full ${loading || uploading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} text-white transition`}
//             >
//               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
//             </button>
//           </div>
//           {uploading && <div className="text-sm text-gray-500">Uploading file...</div>}
//         </div>
//       </div>
//     </div>
//   )
// })

// export default ChatWindow
'use client'

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, ChangeEvent, KeyboardEvent } from 'react'
import { Send, Loader2, Paperclip, ArrowLeft, Plus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

// Type definitions
interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  type: 'text' | 'file'
  time: string
  filename?: string
}

interface Chat {
  title: string
  messages: Message[]
}

interface ChatWindowProps {
  selectedChat?: Chat | null
  onBack?: () => void
}

export interface ChatWindowRef {
  injectMessage: (text: string) => void
}

interface ApiResponse {
  answer?: string
}

interface UploadResponse {
  status: string
  filename?: string
}

const ChatWindow = React.forwardRef<ChatWindowRef, ChatWindowProps>(
  ({ selectedChat, onBack }, ref) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [files, setFiles] = useState<Message[]>([])
    const [uploading, setUploading] = useState<boolean>(false)
    const [history, setHistory] = useState<Chat[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Expose injectMessage to parent via ref
    useImperativeHandle(ref, () => ({
      injectMessage: (text: string) => {
        const botMsg: Message = {
          id: Date.now(),
          text,
          sender: 'bot',
          type: 'text',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prevMessages => {
          const updated = [...prevMessages, botMsg]
          saveChat(updated)
          return updated
        })
      }
    }))

    useEffect(() => { 
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) 
    }, [messages, files])

    useEffect(() => { 
      if (selectedChat) setMessages(selectedChat.messages || []) 
    }, [selectedChat])

    useEffect(() => {
      const savedHistory: Chat[] = JSON.parse(localStorage.getItem("chatHistory") || "[]")
      setHistory(savedHistory)
      if (!selectedChat && savedHistory.length > 0) {
        setMessages(savedHistory[savedHistory.length - 1].messages)
      }
    }, [selectedChat])

    const saveChat = (msgs: Message[]): void => {
      const savedHistory: Chat[] = JSON.parse(localStorage.getItem("chatHistory") || "[]")
      const newEntry: Chat = { 
        title: msgs[0]?.text?.substring(0, 20) || `Chat ${Date.now()}`, 
        messages: msgs 
      }
      const filtered = savedHistory.filter(h => h.title !== newEntry.title)
      const updated = [...filtered, newEntry]
      localStorage.setItem("chatHistory", JSON.stringify(updated))
      setHistory(updated)
    }

    const handleSend = async (): Promise<void> => {
      if (!input.trim()) return
      
      const userMsg: Message = {
        id: Date.now(),
        text: input,
        sender: "user",
        type: "text",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setInput("")
      setLoading(true)

      try {
        const res = await fetch("http://localhost:8000/rag/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userMsg.text }),
        })
        const data: ApiResponse = await res.json()
        const botMsg: Message = {
          id: Date.now() + 1,
          text: data.answer || "Sorry, I couldn't find an answer.",
          sender: "bot",
          type: "text",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        const finalMessages = [...updatedMessages, botMsg]
        setMessages(finalMessages)
        saveChat(finalMessages)
      } catch (error) {
        console.error("Chat error:", error)
        const errorMsg: Message = {
          id: Date.now() + 2,
          text: "Error: Could not fetch response. Please try again.",
          sender: "bot",
          type: "text",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, errorMsg])
      } finally {
        setLoading(false)
      }
    }

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files?.[0]
      if (!file) return
      
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      
      try {
        const res = await fetch("http://localhost:8000/rag/upload", { 
          method: "POST", 
          body: formData 
        })
        const data: UploadResponse = await res.json()
        
        if (data.status === "success" && data.filename) {
          const fileMsg: Message = {
            id: Date.now() + 1,
            sender: "user",
            type: "file",
            filename: data.filename,
            text: file.name,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          const updatedMessages = [...messages, fileMsg]
          setMessages(updatedMessages)
          saveChat(updatedMessages)
          setFiles([...files, fileMsg])

          // Auto-ingest
          const ingestForm = new FormData()
          ingestForm.append("filename", data.filename)
          await fetch("http://localhost:8000/rag/ingest", { 
            method: "POST", 
            body: ingestForm 
          }).catch(err => console.error("Ingest error:", err))
        }
      } catch (error) {
        console.error("Upload error:", error)
      } finally {
        setUploading(false)
        if (e.target) {
          e.target.value = ""
        }
      }
    }

    const removeFile = (msgId: number): void => {
      setFiles(files.filter(f => f.id !== msgId))
      setMessages(messages.filter(m => m.id !== msgId))
    }

    const openChat = (chat: Chat): void => setMessages(chat.messages)
    const newChat = (): void => setMessages([])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") {
        handleSend()
      }
    }

    return (
      <div className="flex h-screen shadow-lg">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b from-purple-800 via-purple-700 to-purple-600 text-white flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-purple-900">
            <button 
              onClick={newChat} 
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
            {onBack && (
              <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-white hover:text-gray-200 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.map((chat, i) => (
              <button 
                key={i} 
                onClick={() => openChat(chat)}
                className="w-full text-left px-4 py-2 bg-purple-800 rounded-lg hover:bg-purple-700 truncate transition"
              >
                {chat.title || `Chat ${i+1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col flex-1 bg-gray-50">
          <div className="p-4 bg-white shadow-md flex justify-between items-center border-b border-gray-200">
            <span className="font-bold text-lg text-gray-800">Chat Assistant 🤖</span>
            <span className="text-sm text-gray-500">{loading ? "Typing..." : "Online"}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.type === "text" ? (
                  <div className={`max-w-[70%] p-4 rounded-xl shadow ${
                    msg.sender === "user" 
                      ? "bg-purple-600 text-white rounded-br-none" 
                      : "bg-white text-gray-800 rounded-bl-none"
                  } transition whitespace-pre-wrap`}>
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.text}</ReactMarkdown>
                    <span className="block text-xs mt-1 text-gray-400 text-right">{msg.time}</span>
                  </div>
                ) : (
                  <div className={`max-w-[70%] p-3 rounded-xl border-dashed border-2 ${
                    msg.sender === "user" 
                      ? "border-purple-600 text-purple-800 bg-purple-50 rounded-br-none" 
                      : "border-gray-300 text-gray-700 bg-gray-100 rounded-bl-none"
                  } flex justify-between items-center`}>
                    <span className="truncate">{msg.text}</span>
                    <button 
                      onClick={() => removeFile(msg.id)} 
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-white flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                <Paperclip className="w-5 h-5" />
              </label>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <input
                type="text"
                value={input}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
              <button
                onClick={handleSend}
                disabled={loading || uploading}
                className={`p-2 rounded-full ${
                  loading || uploading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white transition`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            {uploading && <div className="text-sm text-gray-500">Uploading file...</div>}
          </div>
        </div>
      </div>
    )
  }
)

ChatWindow.displayName = 'ChatWindow'

export default ChatWindow