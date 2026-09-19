import { useEffect, useState } from 'react'
import { Check, X, Trash2, ShieldCheck } from 'lucide-react'
import { adminFetchReviews, adminModerateReview, adminDeleteReview } from '@/lib/api'
import StarRating from '@/components/StarRating'

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
]

export default function AdminReviews() {
  const [filter, setFilter] = useState('pending')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setReviews(await adminFetchReviews(filter))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function approve(review) {
    await adminModerateReview(review.id, { status: 'approved' })
    load()
  }

  async function reject(review) {
    await adminModerateReview(review.id, { status: 'rejected' })
    load()
  }

  async function toggleVerified(review) {
    await adminModerateReview(review.id, { status: review.status, isVerifiedPurchase: !review.is_verified_purchase })
    load()
  }

  async function remove(review) {
    if (!confirm('Delete this review permanently?')) return
    await adminDeleteReview(review.id)
    load()
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Reviews</h1>
      <p className="text-sm text-charcoal/50 mb-6">Reviews stay hidden from the site until approved.</p>

      <div className="flex items-center gap-2 mb-6 border-b border-charcoal/10">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              filter === f.key ? 'border-gold-500 text-emerald-900' : 'border-transparent text-charcoal/50 hover:text-charcoal'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-charcoal/40">No {filter !== 'all' ? filter : ''} reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-ivory border border-charcoal/10 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium">{review.display_name}</span>
                    <StarRating value={review.rating} readOnly size={13} />
                    <span className={`text-[11px] px-2 py-0.5 ${
                      review.status === 'approved'
                        ? 'bg-emerald-900/10 text-emerald-800'
                        : review.status === 'rejected'
                        ? 'bg-red-900/10 text-red-700'
                        : 'bg-gold-100 text-gold-600'
                    }`}>
                      {review.status}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-800">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                  {review.products?.name && (
                    <p className="text-xs text-charcoal/45 mt-1">on {review.products.name}</p>
                  )}
                  <p className="text-sm text-charcoal/75 mt-2 max-w-2xl">{review.review_text}</p>
                  <p className="text-xs text-charcoal/40 mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {review.status !== 'approved' && (
                    <button onClick={() => approve(review)} title="Approve" className="p-2 border border-charcoal/15 hover:border-emerald-700 hover:text-emerald-800">
                      <Check size={15} />
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button onClick={() => reject(review)} title="Reject" className="p-2 border border-charcoal/15 hover:border-red-600 hover:text-red-700">
                      <X size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleVerified(review)}
                    title="Toggle verified purchase"
                    className={`p-2 border ${review.is_verified_purchase ? 'border-emerald-700 text-emerald-800' : 'border-charcoal/15'}`}
                  >
                    <ShieldCheck size={15} />
                  </button>
                  <button onClick={() => remove(review)} title="Delete" className="p-2 border border-charcoal/15 hover:border-red-600 hover:text-red-700">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
