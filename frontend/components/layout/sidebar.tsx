'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FlaskConical,
  Download,
  Settings,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'View metrics and trends',
  },
  {
    name: 'Test Suites',
    href: '/test-suites',
    icon: FlaskConical,
    description: 'Manage test cases',
  },
  {
    name: 'Results',
    href: '/results',
    icon: BarChart3,
    description: 'Execution history',
  },
  {
    name: 'Download',
    href: '/results/download',
    icon: Download,
    description: 'Export data',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Generate reports',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure platform',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="font-semibold text-sm">Navigation</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname?.startsWith(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
            {!collapsed && (
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer with download button */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          className={cn(
            'w-full',
            collapsed && 'px-2'
          )}
          asChild
        >
          <Link href="/results/download">
            <Download className={cn('h-4 w-4', !collapsed && 'mr-2')} />
            {!collapsed && 'Export Results'}
          </Link>
        </Button>
      </div>
    </aside>
  )
}
