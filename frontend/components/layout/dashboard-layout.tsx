'use client'

import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export function DashboardLayout({
  children,
  showSidebar = true,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar className="hidden md:flex" />}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
