import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, CheckCircle2, XCircle, Star, Tag, FolderTree } from 'lucide-react'
import { adminFetchStats } from '@/lib/api'

const CARDS = [
  { key: 'total', label: 'Total Products', icon: Package },
  { key: 'available', label: 'Available Products', icon: CheckCircle2 },
  { key: 'outOfStock', label: 'Out of Stock', icon: XCircle },
  { key: 'featured', label: 'Featured Products', icon: Star },
  { key: 'brands', label: 'Brands', icon: Tag },
  { key: 'categories', label: 'Categories', icon: FolderTree },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminFetchStats().then(setStats).catch(console.error)
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Dashboard</h1>
      <p className="text-sm text-charcoal/50 mb-8">An overview of your store.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CARDS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-ivory border border-charcoal/10 p-5">
            <Icon size={18} strokeWidth={1.75} className="text-gold-600 mb-3" />
            <p className="text-2xl font-display">{stats ? stats[key] : '—'}</p>
            <p className="text-xs text-charcoal/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/products/new" className="px-5 py-2.5 bg-emerald-900 text-ivory text-sm">
          Add New Perfume
        </Link>
        <Link to="/admin/brands" className="px-5 py-2.5 border border-charcoal/15 text-sm">
          Manage Brands
        </Link>
        <Link to="/admin/categories" className="px-5 py-2.5 border border-charcoal/15 text-sm">
          Manage Categories
        </Link>
      </div>
    </div>
  )
}
