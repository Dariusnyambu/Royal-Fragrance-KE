import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.5c0-.93.26-1.56 1.6-1.56h1.7V3.1C15.98 3.03 15.03 3 13.9 3c-2.35 0-3.96 1.44-3.96 4.08v2.52H7.18v3.2h2.76V21h3.56z" />
    </svg>
  )
}

function TikTokIcon(props) {
  // lucide-react has no TikTok glyph; a minimal inline mark keeps the icon set consistent.
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M16.6 5.82a4.9 4.9 0 0 1-1.06-3.05h-3.05v13.4a2.9 2.9 0 1 1-2.06-2.78v-3.1a5.98 5.98 0 1 0 5.11 5.92V9.4a7.9 7.9 0 0 0 4.06 1.12V7.47a4.86 4.86 0 0 1-3-1.65z" />
    </svg>
  )
}

export default function Footer() {
  const { settings } = useSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-emerald-950 text-ivory/90">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <span className="font-display text-2xl text-gold-300">{settings.business_name}</span>
          <p className="mt-3 text-sm text-ivory/60 max-w-xs">{settings.about_text}</p>
          <div className="flex items-center gap-4 mt-5">
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-ivory/60 hover:text-gold-300"
              >
                <InstagramIcon />
              </a>
            )}
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-ivory/60 hover:text-gold-300"
              >
                <FacebookIcon />
              </a>
            )}
            {settings.tiktok && (
              <a
                href={settings.tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="text-ivory/60 hover:text-gold-300"
              >
                <TikTokIcon />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-widest text-gold-300/90 mb-4">Shop</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/shop" className="hover:text-ivory">All Perfumes</Link></li>
            <li><Link to="/shop?tag=bestseller" className="hover:text-ivory">Best Sellers</Link></li>
            <li><Link to="/shop?tag=new" className="hover:text-ivory">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-widest text-gold-300/90 mb-4">Categories</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/shop?gender=men" className="hover:text-ivory">Men's Perfumes</Link></li>
            <li><Link to="/shop?gender=women" className="hover:text-ivory">Women's Perfumes</Link></li>
            <li><Link to="/shop?gender=unisex" className="hover:text-ivory">Unisex Perfumes</Link></li>
            <li><Link to="/shop?category=gift-sets" className="hover:text-ivory">Gift Sets</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-widest text-gold-300/90 mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-ivory/70">
            {settings.phone && (
              <li className="flex items-center gap-2"><Phone size={14} /> {settings.phone}</li>
            )}
            <li className="flex items-center gap-2"><Mail size={14} /> {settings.email}</li>
            {settings.location && (
              <li className="flex items-center gap-2"><MapPin size={14} /> {settings.location}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 text-xs text-ivory/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>&copy; {year} {settings.business_name}. All rights reserved.</span>
          <span>{settings.delivery_information}</span>
        </div>
      </div>
    </footer>
  )
}
