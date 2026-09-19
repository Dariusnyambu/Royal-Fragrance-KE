import { useEffect, useState } from 'react'
import SectionHeading from './SectionHeading'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import { fetchApprovedReviews } from '@/lib/api'

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchApprovedReviews({ limit: 9 })
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (!loading && reviews.length === 0 && !showForm) {
    // Nothing to show yet, but still invite the first review rather than
    // hiding the section entirely.
    return (
      <section className="py-16 border-t border-charcoal/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">What Our Customers Say</h2>
          <p className="mt-3 text-sm text-charcoal/55">Be the first to share your experience.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-7 py-3 bg-emerald-900 text-ivory text-sm tracking-wide hover:bg-emerald-800"
          >
            Write a Review
          </button>
        </div>
      </section>
    )
  }

  if (loading) return null

  return (
    <section className="py-16 border-t border-charcoal/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          title="What Our Customers Say"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-emerald-900 border-b border-emerald-900/40 hover:border-emerald-900"
            >
              Write a Review
            </button>
          }
        />

        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
          {reviews.map((review) => (
            <div key={review.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
              <ReviewCard review={review} showProduct />
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <ReviewForm onSubmitted={() => setTimeout(() => setShowForm(false), 1500)} />
            <button
              onClick={() => setShowForm(false)}
              className="mt-3 text-sm text-ivory/90 bg-charcoal/70 hover:bg-charcoal px-4 py-2 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
