import { Bell, Search, Sun, Moon, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useThemeStore from '../../store/useThemeStore'

const pageTitles = {
  '/dashboard':       'Dashboard',
  '/artists':         'Artists',
  '/concerts':        'Concerts',
  '/demographics':    'Demographics',
  '/analysis':        'Analysis',
  '/map':             'Map View',
  '/admin/users':     'Admin — Users',
  '/admin/ingestion': 'Admin — Ingestion',
}

function Topbar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme, initTheme } = useThemeStore()

  useEffect(() => { initTheme() }, [])

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] || 'Dashboard'

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
    }}
      className="h-16 flex items-center px-6 gap-4 sticky top-0 z-30">

      {/* Page Title */}
      <h2 className="font-display font-semibold text-lg flex-1"
        style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-56"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #6366F1, #818CF8)'
            : 'linear-gradient(135deg, #F59E0B, #FCD34D)',
          boxShadow: theme === 'dark' ? '0 0 16px rgba(99,102,241,0.4)' : '0 0 16px rgba(245,158,11,0.4)'
        }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center transition-all duration-300 shadow-sm"
          style={{ transform: theme === 'dark' ? 'translateX(28px)' : 'translateX(0)' }}>
          {theme === 'dark'
            ? <Moon size={11} className="text-indigo-600" />
            : <Sun  size={11} className="text-amber-500" />
          }
        </div>
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl transition-all duration-200"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <Bell size={17} style={{ color: 'var(--text-secondary)' }} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: 'var(--accent-gold)' }} />
      </button>

      {/* Logout */}
      <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all duration-200"
        style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <LogOut size={15} />
        <span className="hidden sm:block">Logout</span>
      </button>
    </header>
  )
}

export default Topbar