import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic2,
  Music2,
  Users,
  Map,
  Upload,
  UserCog,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    path: '/dashboard',         icon: LayoutDashboard },
  { label: 'Artists',      path: '/artists',            icon: Mic2 },
  { label: 'Concerts',     path: '/concerts',           icon: Music2 },
  { label: 'Demographics', path: '/demographics',       icon: Users },
  { label: 'Map View',     path: '/map',                icon: Map },
]

const adminItems = [
  { label: 'Users',        path: '/admin/users',        icon: UserCog },
  { label: 'Ingestion',    path: '/admin/ingestion',    icon: Upload },
]

function Sidebar() {
  return (
    <aside className="w-64 bg-brand-navy flex flex-col h-full shadow-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-white font-bold text-xl tracking-tight">🎵 ArtistIQ</h1>
        <p className="text-white/40 text-xs mt-0.5">Concert & Artist Analytics</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-xs font-semibold uppercase px-3 mb-2">Main</p>
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}

        {/* Admin Nav */}
        <p className="text-white/30 text-xs font-semibold uppercase px-3 mt-6 mb-2">Admin</p>
        {adminItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom user section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-white text-sm font-medium">Admin User</p>
            <p className="text-white/40 text-xs">admin@k2s2.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar