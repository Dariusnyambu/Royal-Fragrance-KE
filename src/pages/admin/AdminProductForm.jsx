import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminFetchProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminAddProductImages,
  adminDeleteProductImage,
  fetchBrands,
  fetchCategories,
} from '@/lib/api'
import { slugify } from '@/lib/format'
import ImageUploader from '@/components/admin/ImageUploader'

const EMPTY = {
  name: '',
  brand_id: '',
  category_id: '',
  description: '',
  price: '',
  sale_price: '',
  sizes: '',
  gender: 'unisex',
  fragrance_family: '',
  top_notes: '',
  middle_notes: '',
  base_notes: '',
  stock_status: 'in_stock',
  is_featured: false,
  is_bestseller: false,
  is_new: false,
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [newImages, setNewImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error)
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    if (!isEdit) return
    adminFetchProduct(id).then((product) => {
      if (!product) return
      setForm({
        name: product.name || '',
        brand_id: product.brand_id || '',
        category_id: product.category_id || '',
        description: product.description || '',
        price: product.price ?? '',
        sale_price: product.sale_price ?? '',
        sizes: (product.sizes || []).join(', '),
        gender: product.gender || 'unisex',
        fragrance_family: product.fragrance_family || '',
        top_notes: product.top_notes || '',
        middle_notes: product.middle_notes || '',
        base_notes: product.base_notes || '',
        stock_status: product.stock_status || 'in_stock',
        is_featured: product.is_featured,
        is_bestseller: product.is_bestseller,
        is_new: product.is_new,
      })
      setExistingImages(product.product_images || [])
    })
  }, [id, isEdit])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleRemoveExistingImage(image) {
    await adminDeleteProductImage(image.id)
    setExistingImages((prev) => prev.filter((img) => img.id !== image.id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: slugify(form.name),
        brand_id: form.brand_id || null,
        category_id: form.category_id || null,
        description: form.description || null,
        price: Number(form.price) || 0,
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        gender: form.gender,
        fragrance_family: form.fragrance_family || null,
        top_notes: form.top_notes || null,
        middle_notes: form.middle_notes || null,
        base_notes: form.base_notes || null,
        stock_status: form.stock_status,
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        is_new: form.is_new,
      }

      let productId = id
      if (isEdit) {
        await adminUpdateProduct(id, payload)
      } else {
        const created = await adminCreateProduct(payload)
        productId = created.id
      }

      if (newImages.length > 0) {
        await adminAddProductImages(productId, newImages)
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-6">{isEdit ? 'Edit Perfume' : 'Add Perfume'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-ivory border border-charcoal/10 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Perfume Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Brand">
            <select value={form.brand_id} onChange={(e) => update('brand_id', e.target.value)} className="input">
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="input">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input">
              <option value="men">Men's</option>
              <option value="women">Women's</option>
              <option value="unisex">Unisex</option>
            </select>
          </Field>
          <Field label="Price (KSh)" required>
            <input type="number" required min="0" value={form.price} onChange={(e) => update('price', e.target.value)} className="input" />
          </Field>
          <Field label="Sale Price (KSh, optional)">
            <input type="number" min="0" value={form.sale_price} onChange={(e) => update('sale_price', e.target.value)} className="input" />
          </Field>
          <Field label="Sizes (comma-separated, e.g. 30ml, 50ml, 100ml)">
            <input type="text" value={form.sizes} onChange={(e) => update('sizes', e.target.value)} className="input" />
          </Field>
          <Field label="Stock Status">
            <select value={form.stock_status} onChange={(e) => update('stock_status', e.target.value)} className="input">
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </Field>
          <Field label="Fragrance Family">
            <input type="text" value={form.fragrance_family} onChange={(e) => update('fragrance_family', e.target.value)} className="input" placeholder="e.g. Woody, Floral, Oriental" />
          </Field>
        </div>

        <Field label="Description">
          <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className="input" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Top Notes">
            <input type="text" value={form.top_notes} onChange={(e) => update('top_notes', e.target.value)} className="input" />
          </Field>
          <Field label="Heart / Middle Notes">
            <input type="text" value={form.middle_notes} onChange={(e) => update('middle_notes', e.target.value)} className="input" />
          </Field>
          <Field label="Base Notes">
            <input type="text" value={form.base_notes} onChange={(e) => update('base_notes', e.target.value)} className="input" />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          {[
            ['is_featured', 'Featured'],
            ['is_bestseller', 'Bestseller'],
            ['is_new', 'New Arrival'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} className="h-4 w-4 accent-emerald-800" />
              {label}
            </label>
          ))}
        </div>

        <div>
          <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Product Images</label>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative h-24 w-24">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(img)}
                    className="absolute -top-2 -right-2 bg-charcoal text-ivory rounded-full h-6 w-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <ImageUploader images={newImages} onChange={setNewImages} />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-7 py-3 bg-emerald-900 text-ivory text-sm disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Perfume'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="px-7 py-3 border border-charcoal/15 text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs tracking-wide text-charcoal/50 block mb-2">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  )
}
