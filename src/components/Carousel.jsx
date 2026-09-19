import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Generic slide carousel. Renders whatever `renderSlide(slide, index)` returns
 * inside a fixed-aspect-ratio frame (so nothing shifts as slides load/change),
 * with arrows, dot indicators, swipe/touch support, and optional autoplay.
 */
export default function Carousel({
  slides,
  renderSlide,
  aspectClassName = 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]',
  autoplayMs = 6000,
  label = 'carousel',
}) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(null)
  const containerRef = useRef(null)
  const [paused, setPaused] = useState(false)

  const count = slides.length

  const goTo = useCallback(
    (i) => {
      setIndex(((i % count) + count) % count)
    },
    [count],
  )

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (count <= 1 || paused || !autoplayMs) return
    const timer = setInterval(next, autoplayMs)
    return () => clearInterval(timer)
  }, [count, paused, autoplayMs, next])

  // Reset to a valid slide if the slide count shrinks (e.g. after admin edits).
  useEffect(() => {
    if (index >= count) setIndex(0)
  }, [count, index])

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  if (count === 0) return null

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={`relative w-full overflow-hidden ${aspectClassName}`}>
        {slides.map((slide, i) => (
          <div
            key={slide.id ?? i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {renderSlide(slide, i)}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center bg-ivory/85 text-charcoal hover:bg-ivory transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center bg-ivory/85 text-charcoal hover:bg-ivory transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id ?? i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-gold-400' : 'w-1.5 bg-ivory/60 hover:bg-ivory/90'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
