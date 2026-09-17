import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProductBySlug, fetchRelatedProducts } from '@/lib/api'
import { formatKsh, stockLabel } from '@/lib/format'
import { buildOrderMessage, openWhatsAppOrder } from '@/lib/whatsapp'
import { useSettings } from '@/context/SettingsContext'
import QuantitySelector from '@/components/QuantitySelector'
import ProductGrid from '@/components/ProductGrid'
import usePageMeta from '@/hooks/usePageMeta'

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSettings()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [notFound, setNotFound] = useState(false)

  usePageMeta({
    title: product ? `${product.name}${product.brands?.name ? ` — ${product.brands.name}` : ''}` : undefined,
    description: product?.description,
    image: product?.product_images?.[0]?.image_url,
  })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setNotFound(false)
    fetchProductBySlug(slug)
      .then(async (data) => {
        if (!mounted) return
        if (!data) {
          setNotFound(true)
          return
        }
        setProduct(data)
        setSelectedSize(Array.isArray(data.sizes) ? data.sizes[0] : data.sizes)
        setActiveImage(0)
        setQuantity(1)
        if (data.category_id) {
          const r = await fetchRelatedProducts({ categoryId: data.category_id, excludeId: data.id })
          if (mounted) setRelated(r)
        }
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [slug])

  if (loading) {
    return <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 text-center text-charcoal/40">Loading...</div>
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-3xl mb-3">Perfume not found</h1>
        <Link to="/shop" className="text-emerald-900 border-b border-emerald-900/40">Back to shop</Link>
      </div>
    )
  }

  const images = product.product_images?.length
    ? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)
    : []
  const displayPrice = product.sale_price ?? product.price
  const outOfStock = product.stock_status === 'out_of_stock'

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: product.brands?.name ? { '@type': 'Brand', name: product.brands.name } : undefined,
    description: product.description || undefined,
    image: images.map((img) => img.image_url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: displayPrice,
      availability: outOfStock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
    },
  }

  function handleOrder() {
    const message = buildOrderMessage({
      productName: product.name,
      brand: product.brands?.name,
      size: selectedSize,
      quantity,
      price: displayPrice,
      customerName: customerName || undefined,
    })
    openWhatsAppOrder(settings.whatsapp_number, message)
  }

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      <nav className="text-xs text-charcoal/45 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-charcoal">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-charcoal">Shop</Link>
        {product.categories?.name && (
          <>
            <span>/</span>
            <span>{product.categories.name}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-cream overflow-hidden">
            {images[activeImage] ? (
              <img src={images[activeImage].image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-charcoal/30 font-display text-xl">
                Royal Fragrance
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden border ${i === activeImage ? 'border-gold-500' : 'border-transparent'}`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-charcoal/55 tracking-wide">{product.brands?.name || 'Royal Fragrance KE'}</p>
          <h1 className="font-display text-4xl mt-1">{product.name}</h1>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-xl">{formatKsh(displayPrice)}</span>
            {product.sale_price && (
              <span className="text-sm text-charcoal/40 line-through">{formatKsh(product.price)}</span>
            )}
            <span className={`text-xs px-2 py-1 ${outOfStock ? 'bg-charcoal/10 text-charcoal/60' : 'bg-emerald-900/10 text-emerald-800'}`}>
              {stockLabel(product.stock_status)}
            </span>
          </div>

          {product.description && (
            <p className="mt-6 text-sm text-charcoal/70 leading-relaxed max-w-md">{product.description}</p>
          )}

          <div className="hairline-solid my-7" />

          {Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm border ${
                      selectedSize === size
                        ? 'border-emerald-900 bg-emerald-900 text-ivory'
                        : 'border-charcoal/20 hover:border-charcoal/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            {product.categories?.name && (
              <div>
                <p className="text-xs text-charcoal/45">Category</p>
                <p>{product.categories.name}</p>
              </div>
            )}
            {product.gender && (
              <div>
                <p className="text-xs text-charcoal/45">Gender</p>
                <p className="capitalize">{product.gender}</p>
              </div>
            )}
            {product.fragrance_family && (
              <div>
                <p className="text-xs text-charcoal/45">Fragrance Family</p>
                <p>{product.fragrance_family}</p>
              </div>
            )}
          </div>

          {(product.top_notes || product.middle_notes || product.base_notes) && (
            <div className="mb-7 space-y-2 text-sm">
              {product.top_notes && (
                <p><span className="text-charcoal/45">Top Notes: </span>{product.top_notes}</p>
              )}
              {product.middle_notes && (
                <p><span className="text-charcoal/45">Heart Notes: </span>{product.middle_notes}</p>
              )}
              {product.base_notes && (
                <p><span className="text-charcoal/45">Base Notes: </span>{product.base_notes}</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Quantity</label>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>

          <div className="mb-6">
            <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Your name (optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="So we know who's ordering"
              className="w-full max-w-sm border border-charcoal/15 bg-transparent px-3 py-2 text-sm focus:border-gold-500"
            />
          </div>

          <button
            onClick={handleOrder}
            disabled={outOfStock}
            className="w-full sm:w-auto px-10 py-3.5 bg-emerald-900 text-ivory text-sm tracking-wide hover:bg-emerald-800 disabled:bg-charcoal/15 disabled:text-charcoal/50 transition-colors"
          >
            {outOfStock ? 'Currently Unavailable' : 'Order via WhatsApp'}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-charcoal/10">
          <h2 className="font-display text-3xl mb-8">You May Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
