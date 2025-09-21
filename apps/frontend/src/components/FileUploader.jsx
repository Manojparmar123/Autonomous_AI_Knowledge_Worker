'use client'

import React, { useState } from 'react'

export default function FileUploader() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setMessage('')
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file before uploading.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/rag/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setUploadedFiles((prev) => [...prev, data])
        setMessage('File uploaded successfully!')
        setFile(null)
      } else {
        setMessage(data.detail || 'Upload failed.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Something went wrong during upload.')
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-center">File Uploader</h2>

      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
          file:border file:border-gray-300 file:rounded file:text-sm file:font-semibold
          file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded shadow"
      >
        Upload File
      </button>

      {message && <p className="text-sm text-center text-red-500">{message}</p>}

      <div>
        <h3 className="font-medium mb-2">Uploaded Files</h3>
        {uploadedFiles.length === 0 ? (
          <p className="text-sm text-gray-500">No files uploaded yet.</p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file.filename}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
