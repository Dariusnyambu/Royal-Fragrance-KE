import { Link } from 'react-router-dom'
import Carousel from './Carousel'
import { resolveSlideLink } from '@/lib/slides'

export default function PromoSlider({ slides }) {
  if (!slides || slides.length === 0) return null

  return (
    <section className="py-16 border-t border-charcoal/10 bg-cream/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Carousel
          slides={slides}
          label="Featured collections and offers"
          aspectClassName="aspect-[4/3] sm:aspect-[16/7]"
          renderSlide={(slide) => <PromoSlide slide={slide} />}
        />
      </div>
    </section>
  )
}

function PromoSlide({ slide }) {
  const link = resolveSlideLink(slide)

  const content = (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={slide.image_url}
        alt={slide.title || ''}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
      <div className="relative z-10 h-full flex items-end p-6 sm:p-10">
        <div className="max-w-md">
          {slide.title && <h3 className="font-display text-2xl sm:text-3xl text-ivory">{slide.title}</h3>}
          {slide.description && (
            <p className="mt-2 text-ivory/75 text-sm leading-relaxed">{slide.description}</p>
          )}
          {slide.cta_text && (
            <span className="mt-5 inline-block text-xs tracking-widest text-gold-300 border-b border-gold-300/60 pb-0.5">
              {slide.cta_text}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (!link) return content

  return link.external ? (
    <a href={link.to} target="_blank" rel="noreferrer" className="block h-full w-full">
      {content}
    </a>
  ) : (
    <Link to={link.to} className="block h-full w-full">
      {content}
    </Link>
  )
}
