import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { fetchCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api'
import { slugify } from '@/lib/format'
import ImageUploader from '@/components/admin/ImageUploader'

const EMPTY = { name: '', description: '', image_url: null }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setCategories(await fetchCategories())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setForm(EMPTY)
    setEditing({})
  }

  function openEdit(category) {
    setForm({ name: category.name, description: category.description || '', image_url: category.image_url })
    setEditing(category)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        image_url: form.image_url,
      }
      if (editing?.id) {
        await adminUpdateCategory(editing.id, payload)
      } else {
        await adminCreateCategory(payload)
      }
      setEditing(null)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!confirm(`Delete category "${category.name}"?`)) return
    try {
      await adminDeleteCategory(category.id)
      load()
    } catch (err) {
      alert('Could not delete — this category may still have products assigned to it.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Categories</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-ivory text-sm">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-ivory border border-charcoal/10 p-5 flex items-start gap-4">
              <div className="h-12 w-12 bg-cream flex-shrink-0 overflow-hidden">
                {category.image_url && <img src={category.image_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{category.name}</p>
                {category.description && <p className="text-xs text-charcoal/50 line-clamp-2 mt-1">{category.description}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => openEdit(category)} aria-label="Edit category"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(category)} aria-label="Delete category"><Trash2 size={15} className="text-red-700/70" /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-charcoal/40">No categories yet.</p>}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <form onSubmit={handleSave} className="bg-ivory p-6 w-full max-w-md space-y-4">
            <h2 className="font-display text-xl">{editing?.id ? 'Edit Category' : 'Add Category'}</h2>
            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Image</label>
              <ImageUploader
                images={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
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
