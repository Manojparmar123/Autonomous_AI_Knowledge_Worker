'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from './auth'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    if (!auth?.token) {
      // If no token, redirect to login
      router.push('/login')
    } else {
      // Token exists, set ready to true
      setReady(true)
    }
  }, [router])

  if (!ready) {
    // Optionally render a loading spinner or message
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    )
  }

  return <>{children}</>
}
