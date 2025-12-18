import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toaster } from '@/components/ui/toaster'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="md:pl-64">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
