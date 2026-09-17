import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Search } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?gender=men', label: "Men's" },
  { to: '/shop?gender=women', label: "Women's" },
  { to: '/shop?category=gift-sets', label: 'Gift Sets' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { settings } = useSettings()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-charcoal/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-wide text-emerald-900">
              {settings.business_name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors ${
                    isActive ? 'text-gold-600' : 'text-charcoal/80 hover:text-emerald-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              aria-label="Search perfumes"
              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full border border-charcoal/15 text-charcoal/70 hover:border-gold-500 hover:text-gold-600 transition-colors"
            >
              <Search size={16} strokeWidth={1.75} />
            </Link>
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 text-charcoal"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-charcoal/10 bg-ivory">
          <nav className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-base text-charcoal/85 py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
