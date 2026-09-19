import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, FolderTree, Settings, LogOut, Menu, X, Images, MessageSquareText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/slides', label: 'Sliders', icon: Images },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { signOut, profile } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-ivory transform transition-transform lg:transform-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-gold-300">Royal Fragrance</Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 space-y-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
                  isActive ? 'bg-emerald-800 text-gold-300' : 'text-ivory/70 hover:bg-emerald-900'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-ivory/10">
          {profile?.email && <p className="text-xs text-ivory/40 px-3 mb-2 truncate">{profile.email}</p>}
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-ivory/70 hover:bg-emerald-900 rounded w-full"
          >
            <LogOut size={17} strokeWidth={1.75} /> Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-charcoal/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-emerald-950 text-ivory">
          <span className="font-display text-lg text-gold-300">Royal Fragrance</span>
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </header>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
