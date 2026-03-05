import { Bell, Search, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard':        'Dashboard',
  '/artists':          'Artists',
  '/concerts':         'Concerts',
  '/demographics':     'Demographics',
  '/map':              'Map View',
  '/admin/users':      'Admin — Users',
  '/admin/ingestion':  'Admin — Ingestion',
}

function Topbar() {
  const { pathname } = useLocation()

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] || 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shadow-sm">
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-brand-navy flex-1">{title}</h2>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search artists, concerts..."
          className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
        <Bell size={20} className="text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full"></span>
      </button>

      {/* Logout */}
      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <LogOut size={16} />
        Logout
      </button>
    </header>
  )
}

export default Topbar