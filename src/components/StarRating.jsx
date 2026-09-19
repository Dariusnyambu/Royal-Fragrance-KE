import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, size = 16, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5]

  if (readOnly) {
    return (
      <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {stars.map((n) => (
          <Star
            key={n}
            size={size}
            strokeWidth={1.5}
            className={n <= Math.round(value) ? 'fill-gold-400 text-gold-400' : 'text-charcoal/20'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            size={size + 6}
            strokeWidth={1.5}
            className={n <= value ? 'fill-gold-400 text-gold-400' : 'text-charcoal/25 hover:text-gold-300'}
          />
        </button>
      ))}
    </div>
  )
}
