import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { fetchBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from '@/lib/api'
import { slugify } from '@/lib/format'
import { BUCKETS } from '@/lib/supabase'
import ImageUploader from '@/components/admin/ImageUploader'

const EMPTY = { name: '', description: '', logo_url: null }

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, {} = new, {...brand} = edit
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setBrands(await fetchBrands())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setForm(EMPTY)
    setEditing({})
  }

  function openEdit(brand) {
    setForm({ name: brand.name, description: brand.description || '', logo_url: brand.logo_url })
    setEditing(brand)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: form.name, slug: slugify(form.name), description: form.description || null, logo_url: form.logo_url }
      if (editing?.id) {
        await adminUpdateBrand(editing.id, payload)
      } else {
        await adminCreateBrand(payload)
      }
      setEditing(null)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(brand) {
    if (!confirm(`Delete brand "${brand.name}"?`)) return
    try {
      await adminDeleteBrand(brand.id)
      load()
    } catch (err) {
      alert('Could not delete — this brand may still have products assigned to it.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Brands</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-ivory text-sm">
          <Plus size={15} /> Add Brand
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-ivory border border-charcoal/10 p-5 flex items-start gap-4">
              <div className="h-12 w-12 bg-cream flex-shrink-0 overflow-hidden">
                {brand.logo_url && <img src={brand.logo_url} alt="" className="h-full w-full object-contain" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{brand.name}</p>
                {brand.description && <p className="text-xs text-charcoal/50 line-clamp-2 mt-1">{brand.description}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => openEdit(brand)} aria-label="Edit brand"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(brand)} aria-label="Delete brand"><Trash2 size={15} className="text-red-700/70" /></button>
              </div>
            </div>
          ))}
          {brands.length === 0 && <p className="text-sm text-charcoal/40">No brands yet.</p>}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <form onSubmit={handleSave} className="bg-ivory p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-xl">{editing?.id ? 'Edit Brand' : 'Add Brand'}</h2>
            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Logo</label>
              <ImageUploader
                bucket={BUCKETS.brands}
                images={form.logo_url}
                onChange={(url) => setForm({ ...form, logo_url: url })}
                multiple={false}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-emerald-900 text-ivory text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="px-6 py-2.5 border border-charcoal/15 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
