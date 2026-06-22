import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Calculator, Briefcase, User, Trophy,
  AlertTriangle, FileText, Upload, Moon, Sun, LogOut, Menu, X, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useData } from '@/context/DataContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Commission Calculator', icon: Calculator },
  { to: '/deals', label: 'Deal Tracker', icon: Briefcase },
  { to: '/employee', label: 'My Dashboard', icon: User },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/clawback', label: 'Clawback', icon: AlertTriangle },
  { to: '/audit', label: 'Audit Report', icon: FileText },
  { to: '/import', label: 'File Import', icon: Upload },
]

export function Layout() {
  const { user, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const { refetch, isLoading } = useData()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-[#0F4C81] text-white transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#0F4C81] font-bold text-sm">SC</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sm leading-tight">Sales Commission<br />Dashboard</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        {sidebarOpen && user && (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/60 truncate capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(s => !s)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading} title="Refresh data">
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
