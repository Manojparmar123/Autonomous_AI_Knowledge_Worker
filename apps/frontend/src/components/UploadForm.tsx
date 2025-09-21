'use client'
import { useState } from 'react'
import axios from 'axios'

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const data = res.data as { document_id: string }
      setStatus(`Uploaded successfully: ${data.document_id}`)
    } catch (err: any) {
      setStatus('Upload failed: ' + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold text-blue-700">Upload Document</h2>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      {status && <div className="text-gray-700">{status}</div>}
    </div>
  )
}


