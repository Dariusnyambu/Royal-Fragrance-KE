import { supabase } from './supabase'

function buildProductSelect({ brandSlug, categorySlug } = {}) {
  // Only force an inner join when we actually need to filter on that
  // relation's columns — forcing !inner unconditionally would silently
  // exclude any product that has no brand or category assigned yet.
  const brandJoin = brandSlug ? 'brands!inner' : 'brands'
  const categoryJoin = categorySlug ? 'categories!inner' : 'categories'
  return `
    *,
    ${brandJoin} ( id, name, slug, logo_url ),
    ${categoryJoin} ( id, name, slug ),
    product_images ( id, image_url, sort_order )
  `
}

const PRODUCT_SELECT = buildProductSelect()

function applyOrdering(query, sort) {
  switch (sort) {
    case 'price_asc':
      return query.order('price', { ascending: true })
    case 'price_desc':
      return query.order('price', { ascending: false })
    case 'popularity':
      return query.order('is_bestseller', { ascending: false }).order('created_at', { ascending: false })
    case 'newest':
    default:
      return query.order('created_at', { ascending: false })
  }
}

export async function fetchProducts({
  search,
  brandSlug,
  categorySlug,
  gender,
  minPrice,
  maxPrice,
  tag, // 'bestseller' | 'new' | 'featured'
  sort,
  limit,
} = {}) {
  let query = supabase
    .from('products')
    .select(buildProductSelect({ brandSlug, categorySlug }))
    .eq('is_visible', true)

  if (search) query = query.ilike('name', `%${search}%`)
  if (brandSlug) query = query.eq('brands.slug', brandSlug)
  if (categorySlug) query = query.eq('categories.slug', categorySlug)
  if (gender) query = query.eq('gender', gender)
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') query = query.gte('price', minPrice)
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') query = query.lte('price', maxPrice)
  if (tag === 'bestseller') query = query.eq('is_bestseller', true)
  if (tag === 'new') query = query.eq('is_new', true)
  if (tag === 'featured') query = query.eq('is_featured', true)
  if (limit) query = query.limit(limit)

  query = applyOrdering(query, sort)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_visible', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchRelatedProducts({ categoryId, excludeId, limit = 4 }) {
  if (!categoryId) return []
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .eq('is_visible', true)
    .neq('id', excludeId)
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function fetchMostExpensiveProduct() {
  // Pull a few of the highest-priced products and pick the first with an
  // image — a product without a photo yet wouldn't make an appealing hero.
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_visible', true)
    .order('price', { ascending: false })
    .limit(5)
  if (error) throw error
  return (data ?? []).find((p) => p.product_images?.length > 0) ?? data?.[0] ?? null
}


export async function fetchBrands() {
  const { data, error } = await supabase.from('brands').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data ?? []
}

// ---- Admin: products ----
export async function adminFetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminFetchProduct(id) {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function adminCreateProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function adminUpdateProduct(id, payload) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function adminAddProductImages(productId, images) {
  const rows = images.map((image_url, index) => ({ product_id: productId, image_url, sort_order: index }))
  const { error } = await supabase.from('product_images').insert(rows)
  if (error) throw error
}

export async function adminDeleteProductImage(imageId) {
  const { error } = await supabase.from('product_images').delete().eq('id', imageId)
  if (error) throw error
}

// ---- Admin: brands ----
export async function adminCreateBrand(payload) {
  const { data, error } = await supabase.from('brands').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function adminUpdateBrand(id, payload) {
  const { data, error } = await supabase.from('brands').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteBrand(id) {
  const { error } = await supabase.from('brands').delete().eq('id', id)
  if (error) throw error
}

// ---- Admin: categories ----
export async function adminCreateCategory(payload) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function adminUpdateCategory(id, payload) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function adminDeleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ---- Admin: settings ----
export async function adminUpdateSettings(id, payload) {
  const { data, error } = await supabase.from('site_settings').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ---- Admin: dashboard stats ----
export async function adminFetchStats() {
  const [{ count: total }, { count: available }, { count: outOfStock }, { count: featured }, { count: brands }, { count: categories }] =
    await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).neq('stock_status', 'out_of_stock'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('stock_status', 'out_of_stock'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
      supabase.from('brands').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ])

  return {
    total: total ?? 0,
    available: available ?? 0,
    outOfStock: outOfStock ?? 0,
    featured: featured ?? 0,
    brands: brands ?? 0,
    categories: categories ?? 0,
  }
}

// ---- Storage upload helper ----
export async function uploadImage(bucket, file) {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
