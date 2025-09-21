import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'AI Worker',
  description: 'Autonomous AI Knowledge Worker UI'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
