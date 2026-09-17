import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { adminFetchProducts, adminUpdateProduct, adminDeleteProduct } from '@/lib/api'
import { formatKsh, stockLabel } from '@/lib/format'

const TOGGLE_FIELDS = [
  { key: 'is_featured', label: 'Featured' },
  { key: 'is_bestseller', label: 'Bestseller' },
  { key: 'is_new', label: 'New' },
]

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const data = await adminFetchProducts()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleField(product, key) {
    const updated = await adminUpdateProduct(product.id, { [key]: !product[key] })
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...updated } : p)))
  }

  async function toggleVisibility(product) {
    const updated = await adminUpdateProduct(product.id, { is_visible: !product.is_visible })
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...updated } : p)))
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await adminDeleteProduct(product.id)
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
  }

  async function cycleStock(product) {
    const order = ['in_stock', 'low_stock', 'out_of_stock']
    const next = order[(order.indexOf(product.stock_status) + 1) % order.length]
    const updated = await adminUpdateProduct(product.id, { stock_status: next })
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...updated } : p)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl mb-1">Products</h1>
          <p className="text-sm text-charcoal/50">{products.length} total</p>
        </div>
        <Link to="/admin/products/new" className="px-5 py-2.5 bg-emerald-900 text-ivory text-sm">
          Add Perfume
        </Link>
      </div>

      {loading ? (
        <p className="text-charcoal/40 text-sm">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-ivory border border-charcoal/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs text-charcoal/50">
                <th className="p-4">Perfume</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                {TOGGLE_FIELDS.map((f) => (
                  <th key={f.key} className="p-4">{f.label}</th>
                ))}
                <th className="p-4">Visible</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-cream flex-shrink-0 overflow-hidden">
                        {product.product_images?.[0] && (
                          <img src={product.product_images[0].image_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-charcoal/45">{product.brands?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{formatKsh(product.sale_price ?? product.price)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => cycleStock(product)}
                      className="text-xs px-2 py-1 border border-charcoal/15 hover:border-gold-500"
                    >
                      {stockLabel(product.stock_status)}
                    </button>
                  </td>
                  {TOGGLE_FIELDS.map((f) => (
                    <td key={f.key} className="p-4">
                      <input
                        type="checkbox"
                        checked={!!product[f.key]}
                        onChange={() => toggleField(product, f.key)}
                        className="h-4 w-4 accent-emerald-800"
                      />
                    </td>
                  ))}
                  <td className="p-4">
                    <button onClick={() => toggleVisibility(product)} aria-label="Toggle visibility">
                      {product.is_visible ? <Eye size={16} /> : <EyeOff size={16} className="text-charcoal/30" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/products/${product.id}/edit`} aria-label="Edit">
                        <Pencil size={16} className="text-charcoal/60 hover:text-emerald-900" />
                      </Link>
                      <button onClick={() => handleDelete(product)} aria-label="Delete">
                        <Trash2 size={16} className="text-charcoal/60 hover:text-red-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="p-8 text-center text-charcoal/40 text-sm">No products yet. Add your first perfume.</p>
          )}
        </div>
      )}
    </div>
  )
}
