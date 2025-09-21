'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')

      if (!token) {
        router.replace('/login')
        return
      }

      try {
        // verify token with backend
        const res = await fetch('http://localhost:8000/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (res.ok) {
          router.replace('/dashboard')
        } else {
          localStorage.removeItem('authToken')
          router.replace('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  return <div className="p-6">Checking authentication...</div>
}
