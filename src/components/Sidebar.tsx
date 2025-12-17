import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Bell,
  TrendingUp,
  Target,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Receipt, label: 'Transacoes', path: '/transactions' },
  { icon: PieChart, label: 'Categorias', path: '/categories' },
  { icon: Bell, label: 'Lembretes', path: '/reminders' },
  { icon: TrendingUp, label: 'Historico', path: '/history' },
  { icon: Target, label: 'Orcamentos', path: '/budgets' },
  { icon: Settings, label: 'Configuracoes', path: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-700 transition-transform duration-300 ease-in-out',
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'w-64',
          'md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="p-6 border-b border-slate-700">
            {isCollapsed ? (
              <div className="flex justify-center">
                <LayoutDashboard className="h-6 w-6 text-blue-500" />
              </div>
            ) : (
              <h2 className="text-xl font-bold text-slate-100">
                Assessor
              </h2>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-500/20 text-blue-500'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Toggle button for desktop */}
          <div className="hidden md:block p-4 border-t border-slate-700">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">Recolher</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
