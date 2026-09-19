import StarRating from './StarRating'
import { ShieldCheck } from 'lucide-react'

export default function ReviewCard({ review, showProduct = false }) {
  const date = new Date(review.created_at).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="border border-charcoal/10 bg-ivory p-6 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <StarRating value={review.rating} readOnly size={14} />
        {review.is_verified_purchase && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-900/8 px-2 py-1">
            <ShieldCheck size={12} /> Verified Purchase
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-charcoal/75 leading-relaxed flex-1">{review.review_text}</p>
      <div className="mt-5 pt-4 border-t border-charcoal/10 flex items-center justify-between text-xs text-charcoal/50">
        <span className="font-medium text-charcoal/80">{review.display_name}</span>
        <span>{date}</span>
      </div>
      {showProduct && review.products?.name && (
        <p className="mt-1 text-xs text-charcoal/40">on {review.products.name}</p>
      )}
    </div>
  )
}
