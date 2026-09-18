import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles, MessageCircle, Truck } from 'lucide-react'
import SectionHeading from '@/components/SectionHeading'
import ProductGrid from '@/components/ProductGrid'
import PromoBanner from '@/components/PromoBanner'
import { useSettings } from '@/context/SettingsContext'
import { fetchProducts, fetchCategories, fetchMostExpensiveProduct } from '@/lib/api'
import { buildGeneralInquiryMessage, openWhatsAppOrder } from '@/lib/whatsapp'
import { formatKsh } from '@/lib/format'
import usePageMeta from '@/hooks/usePageMeta'

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Carefully Selected Fragrances',
    body: 'Every perfume in our collection is chosen from reputable fragrance brands.',
  },
  {
    icon: Sparkles,
    title: 'Curated, Not Crowded',
    body: 'A focused range of scents, so browsing feels considered rather than overwhelming.',
  },
  {
    icon: MessageCircle,
    title: 'Convenient WhatsApp Ordering',
    body: 'Order directly through WhatsApp — no accounts, no complicated checkout.',
  },
  {
    icon: Truck,
    title: 'Delivery Across Kenya',
    body: 'We arrange delivery to wherever you are in the country.',
  },
]

export default function Home() {
  const { settings } = useSettings()
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [heroProduct, setHeroProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageMeta({ description: settings.hero_subheading })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [f, b, n, c, h] = await Promise.all([
          fetchProducts({ tag: 'featured', limit: 4 }),
          fetchProducts({ tag: 'bestseller', limit: 4 }),
          fetchProducts({ tag: 'new', limit: 4 }),
          fetchCategories(),
          fetchMostExpensiveProduct(),
        ])
        if (!mounted) return
        setFeatured(f)
        setBestsellers(b)
        setNewArrivals(n)
        setCategories(c)
        setHeroProduct(h)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-emerald-950 text-ivory overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-ivory">
              {settings.hero_heading}
            </h1>
            <p className="mt-6 text-ivory/70 max-w-md text-[15px] leading-relaxed">
              {settings.hero_subheading}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-7 py-3 bg-gold-400 text-emerald-950 text-sm tracking-wide hover:bg-gold-300 transition-colors"
              >
                Shop Perfumes
              </Link>
              <button
                onClick={() =>
                  openWhatsAppOrder(settings.whatsapp_number, buildGeneralInquiryMessage())
                }
                className="px-7 py-3 border border-ivory/30 text-ivory text-sm tracking-wide hover:border-gold-400 hover:text-gold-300 transition-colors"
              >
                Order on WhatsApp
              </button>
            </div>
          </div>

          <div className="relative aspect-[4/5] max-w-sm mx-auto w-full">
            <div className="absolute inset-0 border border-gold-400/30" style={{ transform: 'translate(14px, 14px)' }} />
            {heroProduct?.product_images?.[0] ? (
              <Link
                to={`/product/${heroProduct.slug}`}
                className="group relative block h-full w-full overflow-hidden"
              >
                <img
                  src={heroProduct.product_images[0].image_url}
                  alt={heroProduct.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent p-5">
                  <p className="text-[11px] tracking-widest text-gold-300 uppercase">The Signature Collection</p>
                  <p className="font-display text-xl text-ivory mt-1">{heroProduct.name}</p>
                  <p className="text-sm text-ivory/70 mt-0.5">
                    {formatKsh(heroProduct.sale_price ?? heroProduct.price)}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="relative h-full w-full bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 200 260" className="h-4/5 w-auto opacity-90" aria-hidden="true">
                  <rect x="70" y="30" width="60" height="16" rx="3" fill="#c6a15e" />
                  <rect x="80" y="10" width="40" height="24" rx="6" fill="#d9bd83" />
                  <path d="M55 46 h90 a8 8 0 0 1 8 8 v150 a14 14 0 0 1 -14 14 h-78 a14 14 0 0 1 -14 -14 v-150 a8 8 0 0 1 8 -8 z" fill="#0e3b2e" stroke="#c6a15e" strokeWidth="1.5" />
                  <rect x="70" y="90" width="60" height="80" fill="#faf7f0" opacity="0.08" />
                  <text x="100" y="135" textAnchor="middle" fill="#d9bd83" fontFamily="Cormorant Garamond, serif" fontSize="14" letterSpacing="2">ROYAL</text>
                  <text x="100" y="152" textAnchor="middle" fill="#d9bd83" fontFamily="Cormorant Garamond, serif" fontSize="10" letterSpacing="3">FRAGRANCE</text>
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Featured */}
        <section className="py-16">
          <SectionHeading
            title="Featured Perfumes"
            subtitle="A selection from our current collection."
            action={
              <Link to="/shop" className="text-sm text-emerald-900 border-b border-emerald-900/40 hover:border-emerald-900">
                View all
              </Link>
            }
          />
          <ProductGrid products={featured} loading={loading} emptyMessage="Featured perfumes will appear here once added in the admin dashboard." />
        </section>
      </div>

      <PromoBanner settings={settings} />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Shop by category */}
        {categories.length > 0 && (
          <section className="py-16 border-t border-charcoal/10">
            <SectionHeading title="Shop by Category" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative aspect-square flex items-end p-4 bg-emerald-900 overflow-hidden"
                >
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                    />
                  )}
                  <span className="relative z-10 font-display text-lg text-ivory">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trust */}
        <section className="py-16 border-t border-charcoal/10">
          <SectionHeading title={`Why ${settings.business_name}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon size={22} strokeWidth={1.5} className="text-gold-500" />
                <h3 className="font-display text-lg mt-3">{title}</h3>
                <p className="text-sm text-charcoal/60 mt-1 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Best sellers */}
        <section className="py-16 border-t border-charcoal/10">
          <SectionHeading
            title="Best Sellers"
            action={
              <Link to="/shop?tag=bestseller" className="text-sm text-emerald-900 border-b border-emerald-900/40 hover:border-emerald-900">
                View all
              </Link>
            }
          />
          <ProductGrid products={bestsellers} loading={loading} emptyMessage="Mark products as bestsellers in the admin dashboard to feature them here." />
        </section>

        {/* New arrivals */}
        <section className="py-16 border-t border-charcoal/10">
          <SectionHeading
            title="New Arrivals"
            action={
              <Link to="/shop?tag=new" className="text-sm text-emerald-900 border-b border-emerald-900/40 hover:border-emerald-900">
                View all
              </Link>
            }
          />
          <ProductGrid products={newArrivals} loading={loading} emptyMessage="New arrivals will appear here once added." />
        </section>
      </div>

      {/* WhatsApp CTA */}
      <section className="bg-gold-100 border-t border-gold-300/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-emerald-950">
            Not sure which scent to choose?
          </h2>
          <p className="mt-3 text-charcoal/60 max-w-md mx-auto text-sm">
            Message us on WhatsApp and we'll help you find a fragrance you'll love.
          </p>
          <button
            onClick={() => openWhatsAppOrder(settings.whatsapp_number, buildGeneralInquiryMessage())}
            className="mt-7 inline-block px-8 py-3 bg-emerald-900 text-ivory text-sm tracking-wide hover:bg-emerald-800 transition-colors"
          >
            Chat with Royal Fragrance KE
          </button>
        </div>
      </section>
    </div>
  )
}
