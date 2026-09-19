import { useEffect, useState } from 'react'
import StarRating from './StarRating'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import { fetchApprovedReviews } from '@/lib/api'

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  function load() {
    setLoading(true)
    fetchApprovedReviews({ productId })
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <section className="mt-20 pt-12 border-t border-charcoal/10">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="font-display text-3xl">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={average} readOnly />
              <span className="text-sm text-charcoal/60">
                {average.toFixed(1)} out of 5 ({reviews.length} review{reviews.length === 1 ? '' : 's'})
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 border border-charcoal/20 text-sm hover:border-gold-500"
          >
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-10 max-w-lg">
          <ReviewForm
            productId={productId}
            onSubmitted={() => {
              setTimeout(() => setShowForm(false), 1500)
            }}
          />
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-charcoal/50">No reviews yet for this perfume — be the first to share your experience.</p>
      )}

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}
