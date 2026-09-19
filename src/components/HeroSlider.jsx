import { Link } from 'react-router-dom'
import Carousel from './Carousel'
import { resolveSlideLink } from '@/lib/slides'
import { formatKsh } from '@/lib/format'
import { buildGeneralInquiryMessage, openWhatsAppOrder } from '@/lib/whatsapp'

/**
 * Renders the homepage hero. When the admin has added active hero slides,
 * those are shown as a rotating carousel. When none exist yet, this falls
 * back to the site's original static hero (settings text + the priciest
 * product photo) so the homepage looks exactly as it did before this
 * feature existed, out of the box.
 */
export default function HeroSlider({ slides, settings, heroProduct }) {
  if (slides.length === 0) {
    return <DefaultHeroSlide settings={settings} heroProduct={heroProduct} />
  }

  return (
    <section className="relative bg-emerald-950 text-ivory overflow-hidden">
      <Carousel
        slides={slides}
        label="Homepage highlights"
        aspectClassName="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
        renderSlide={(slide) => <HeroSlide slide={slide} />}
      />
    </section>
  )
}

function HeroSlide({ slide }) {
  const link = resolveSlideLink(slide)

  return (
    <div className="relative h-full w-full">
      <img
        src={slide.image_url}
        alt={slide.title || ''}
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/25 to-emerald-950/10 sm:bg-gradient-to-r sm:from-emerald-950/85 sm:via-emerald-950/40 sm:to-transparent" />

      <div className="relative z-10 h-full flex items-end sm:items-center">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-10 sm:pb-0">
          <div className="max-w-md">
            {slide.title && (
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ivory">
                {slide.title}
              </h1>
            )}
            {slide.description && (
              <p className="mt-4 text-ivory/75 text-[15px] leading-relaxed">{slide.description}</p>
            )}
            {slide.cta_text && link && (
              <div className="mt-7">
                {link.external ? (
                  <a
                    href={link.to}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-7 py-3 bg-gold-400 text-emerald-950 text-sm tracking-wide hover:bg-gold-300 transition-colors"
                  >
                    {slide.cta_text}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="inline-block px-7 py-3 bg-gold-400 text-emerald-950 text-sm tracking-wide hover:bg-gold-300 transition-colors"
                  >
                    {slide.cta_text}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DefaultHeroSlide({ settings, heroProduct }) {
  return (
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
              onClick={() => openWhatsAppOrder(settings.whatsapp_number, buildGeneralInquiryMessage())}
              className="px-7 py-3 border border-ivory/30 text-ivory text-sm tracking-wide hover:border-gold-400 hover:text-gold-300 transition-colors"
            >
              Order on WhatsApp
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/5] max-w-sm mx-auto w-full">
          <div className="absolute inset-0 border border-gold-400/30" style={{ transform: 'translate(14px, 14px)' }} />
          {heroProduct?.product_images?.[0] ? (
            <Link to={`/product/${heroProduct.slug}`} className="group relative block h-full w-full overflow-hidden">
              <img
                src={heroProduct.product_images[0].image_url}
                alt={heroProduct.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent p-5">
                <p className="text-[11px] tracking-widest text-gold-300 uppercase">The Signature Collection</p>
                <p className="font-display text-xl text-ivory mt-1">{heroProduct.name}</p>
                <p className="text-sm text-ivory/70 mt-0.5">{formatKsh(heroProduct.sale_price ?? heroProduct.price)}</p>
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
  )
}
