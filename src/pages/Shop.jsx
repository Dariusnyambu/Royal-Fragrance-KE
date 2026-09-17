import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductGrid from '@/components/ProductGrid'
import ShopFilters from '@/components/ShopFilters'
import { fetchProducts, fetchBrands, fetchCategories } from '@/lib/api'
import usePageMeta from '@/hooks/usePageMeta'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      gender: searchParams.get('gender') || '',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      tag: searchParams.get('tag') || '',
    }),
    [searchParams],
  )

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error)
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchProducts({
      search: filters.search || undefined,
      gender: filters.gender || undefined,
      categorySlug: filters.category || undefined,
      brandSlug: filters.brand || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      tag: filters.tag || undefined,
      sort: filters.sort,
    })
      .then((data) => mounted && setProducts(data))
      .catch(console.error)
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [filters])

  function handleFilterChange(next) {
    const params = {}
    if (next.search) params.search = next.search
    if (next.gender) params.gender = next.gender
    if (next.category) params.category = next.category
    if (next.brand) params.brand = next.brand
    if (next.minPrice) params.minPrice = next.minPrice
    if (next.maxPrice) params.maxPrice = next.maxPrice
    if (next.sort && next.sort !== 'newest') params.sort = next.sort
    setSearchParams(params)
  }

  const pageTitle = filters.tag === 'bestseller'
    ? 'Best Sellers'
    : filters.tag === 'new'
    ? 'New Arrivals'
    : 'Shop Perfumes'

  usePageMeta({ title: pageTitle, description: 'Browse original perfumes by brand, category, gender and price — order directly via WhatsApp.' })

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">{pageTitle}</h1>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center gap-2 text-sm border border-charcoal/15 px-3 py-2"
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        <aside className="hidden lg:block">
          <ShopFilters filters={filters} onChange={handleFilterChange} brands={brands} categories={categories} />
        </aside>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-charcoal/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-ivory p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <ShopFilters filters={filters} onChange={handleFilterChange} brands={brands} categories={categories} />
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-charcoal/50 mb-6">
            {loading ? 'Loading...' : `${products.length} perfume${products.length === 1 ? '' : 's'}`}
          </p>
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  )
}
