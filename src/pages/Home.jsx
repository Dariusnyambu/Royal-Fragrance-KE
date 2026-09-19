import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles, MessageCircle, Truck } from 'lucide-react'
import SectionHeading from '@/components/SectionHeading'
import ProductGrid from '@/components/ProductGrid'
import PromoBanner from '@/components/PromoBanner'
import HeroSlider from '@/components/HeroSlider'
import PromoSlider from '@/components/PromoSlider'
import ReviewsSection from '@/components/ReviewsSection'
import { useSettings } from '@/context/SettingsContext'
import { fetchProducts, fetchCategories, fetchMostExpensiveProduct, fetchSlides } from '@/lib/api'
import { buildGeneralInquiryMessage, openWhatsAppOrder } from '@/lib/whatsapp'
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
  const [heroSlides, setHeroSlides] = useState([])
  const [promoSlides, setPromoSlides] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({ description: settings.hero_subheading })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [f, b, n, c, h, hs, ps] = await Promise.all([
          fetchProducts({ tag: 'featured', limit: 4 }),
          fetchProducts({ tag: 'bestseller', limit: 4 }),
          fetchProducts({ tag: 'new', limit: 4 }),
          fetchCategories(),
          fetchMostExpensiveProduct(),
          fetchSlides('hero'),
          fetchSlides('promo'),
        ])
        if (!mounted) return
        setFeatured(f)
        setBestsellers(b)
        setNewArrivals(n)
        setCategories(c)
        setHeroProduct(h)
        setHeroSlides(hs)
        setPromoSlides(ps)
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
      <HeroSlider slides={heroSlides} settings={settings} heroProduct={heroProduct} />

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

      <PromoSlider slides={promoSlides} />

      <ReviewsSection />

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
