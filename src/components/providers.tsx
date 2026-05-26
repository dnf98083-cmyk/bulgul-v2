'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: '#16163a', border: '1px solid rgba(245,158,11,0.2)', color: '#e2e8f0' },
        }}
      />
    </SessionProvider>
  )
}
