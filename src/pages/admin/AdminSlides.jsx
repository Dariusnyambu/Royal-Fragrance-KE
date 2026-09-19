import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import {
  adminFetchSlides,
  adminCreateSlide,
  adminUpdateSlide,
  adminDeleteSlide,
  adminReorderSlides,
  fetchCategories,
  fetchProductOptions,
} from '@/lib/api'
import { BUCKETS } from '@/lib/supabase'
import ImageUploader from '@/components/admin/ImageUploader'

const EMPTY = {
  image_url: '',
  title: '',
  description: '',
  cta_text: '',
  link_type: 'custom',
  cta_url: '',
  product_id: '',
  category_id: '',
  is_active: true,
  starts_at: '',
  ends_at: '',
}

const TABS = [
  { key: 'hero', label: 'Hero Slider', hint: 'Rotates at the very top of the homepage.' },
  { key: 'promo', label: 'Promo Slider', hint: 'A second slider further down the homepage for collections, brands and offers.' },
]

function toDatetimeLocal(value) {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminSlides() {
  const [tab, setTab] = useState('hero')
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setSlides(await adminFetchSlides(tab))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  useEffect(() => {
    fetchProductOptions().then(setProducts).catch(console.error)
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  function openNew() {
    setForm(EMPTY)
    setEditing({})
  }

  function openEdit(slide) {
    setForm({
      image_url: slide.image_url || '',
      title: slide.title || '',
      description: slide.description || '',
      cta_text: slide.cta_text || '',
      link_type: slide.link_type || 'custom',
      cta_url: slide.cta_url || '',
      product_id: slide.product_id || '',
      category_id: slide.category_id || '',
      is_active: slide.is_active,
      starts_at: toDatetimeLocal(slide.starts_at),
      ends_at: toDatetimeLocal(slide.ends_at),
    })
    setEditing(slide)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.image_url) {
      alert('Please upload an image for this slide.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        section: tab,
        image_url: form.image_url,
        title: form.title || null,
        description: form.description || null,
        cta_text: form.cta_text || null,
        link_type: form.link_type,
        cta_url: form.link_type === 'custom' ? form.cta_url || null : null,
        product_id: form.link_type === 'product' ? form.product_id || null : null,
        category_id: form.link_type === 'category' ? form.category_id || null : null,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      }
      if (editing?.id) {
        await adminUpdateSlide(editing.id, payload)
      } else {
        payload.display_order = slides.length
        await adminCreateSlide(payload)
      }
      setEditing(null)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(slide) {
    if (!confirm('Delete this slide?')) return
    await adminDeleteSlide(slide.id)
    load()
  }

  async function toggleActive(slide) {
    await adminUpdateSlide(slide.id, { is_active: !slide.is_active })
    load()
  }

  async function move(index, direction) {
    const next = [...slides]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setSlides(next)
    await adminReorderSlides(next.map((s) => s.id))
  }

  const activeTab = TABS.find((t) => t.key === tab)

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Homepage Sliders</h1>
      <p className="text-sm text-charcoal/50 mb-6">{activeTab.hint}</p>

      <div className="flex items-center gap-2 mb-6 border-b border-charcoal/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === t.key ? 'border-gold-500 text-emerald-900' : 'border-transparent text-charcoal/50 hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button onClick={openNew} className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-ivory text-sm">
        <Plus size={15} /> Add Slide
      </button>

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading...</p>
      ) : slides.length === 0 ? (
        <p className="text-sm text-charcoal/40">No slides yet in this slider.</p>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className="flex items-center gap-4 bg-ivory border border-charcoal/10 p-4">
              <div className="h-16 w-24 bg-cream flex-shrink-0 overflow-hidden">
                <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{slide.title || <span className="text-charcoal/40">Untitled slide</span>}</p>
                <p className="text-xs text-charcoal/45 truncate">{slide.description}</p>
                {(slide.starts_at || slide.ends_at) && (
                  <p className="text-xs text-gold-600 mt-1">
                    Scheduled: {slide.starts_at ? new Date(slide.starts_at).toLocaleDateString() : 'now'} –{' '}
                    {slide.ends_at ? new Date(slide.ends_at).toLocaleDateString() : 'no end'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="disabled:opacity-20">
                  <ArrowUp size={15} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down" className="disabled:opacity-20">
                  <ArrowDown size={15} />
                </button>
              </div>
              <button onClick={() => toggleActive(slide)} aria-label="Toggle active">
                {slide.is_active ? <Eye size={16} /> : <EyeOff size={16} className="text-charcoal/30" />}
              </button>
              <button onClick={() => openEdit(slide)} aria-label="Edit slide"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(slide)} aria-label="Delete slide"><Trash2 size={16} className="text-red-700/70" /></button>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-ivory p-6 w-full max-w-lg space-y-4 my-8">
            <h2 className="font-display text-xl">{editing?.id ? 'Edit Slide' : 'Add Slide'}</h2>

            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Image</label>
              <ImageUploader
                bucket={BUCKETS.slides}
                images={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                multiple={false}
              />
            </div>

            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
            </div>

            <div>
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">CTA Button Text</label>
                <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input" placeholder="Shop Now" />
              </div>
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Link Type</label>
                <select value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value })} className="input">
                  <option value="none">No link</option>
                  <option value="custom">Custom URL / path</option>
                  <option value="product">Specific perfume</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </div>

            {form.link_type === 'custom' && (
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">URL or path</label>
                <input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} className="input" placeholder="/shop?tag=new or https://..." />
              </div>
            )}
            {form.link_type === 'product' && (
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Perfume</label>
                <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="input">
                  <option value="">Select a perfume</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            {form.link_type === 'category' && (
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Starts (optional)</label>
                <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="input" />
              </div>
              <div>
                <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Ends (optional)</label>
                <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="input" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-emerald-800" />
              Active
            </label>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-emerald-900 text-ivory text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Slide'}
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
