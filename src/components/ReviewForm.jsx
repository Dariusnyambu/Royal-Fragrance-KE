import { useEffect, useState } from 'react'
import StarRating from './StarRating'
import { fetchProductOptions, submitReview } from '@/lib/api'

const COOLDOWN_MS = 60 * 1000 // one submission per minute per browser
const COOLDOWN_KEY = 'rfk_last_review_at'

export default function ReviewForm({ productId, onSubmitted }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(productId || '')
  const [products, setProducts] = useState([])
  const [honeypot, setHoneypot] = useState('') // hidden field — real visitors never fill this in
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!productId) {
      fetchProductOptions().then(setProducts).catch(() => {})
    }
  }, [productId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (honeypot) {
      // Silently "succeed" for bots without writing anything.
      setDone(true)
      return
    }
    if (!name.trim() || !rating || !text.trim()) {
      setError('Please add your name, a rating, and a short review.')
      return
    }

    const lastSubmit = Number(localStorage.getItem(COOLDOWN_KEY) || 0)
    if (Date.now() - lastSubmit < COOLDOWN_MS) {
      setError('You just submitted a review — thank you! Please wait a moment before submitting another.')
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        displayName: name,
        productId: selectedProduct || null,
        rating,
        reviewText: text,
      })
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      setDone(true)
      setName('')
      setRating(0)
      setText('')
      onSubmitted?.()
    } catch (err) {
      setError(err.message || 'Something went wrong submitting your review.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="border border-emerald-900/20 bg-emerald-900/5 p-6 text-sm text-emerald-900">
        Thank you — your review has been submitted and will appear once it's approved.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-charcoal/10 bg-ivory p-6">
      <h3 className="font-display text-xl">Write a Review</h3>

      {/* Honeypot: hidden from real users, catches simple bots */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Your Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" maxLength={80} required />
        </div>
        {!productId && (
          <div>
            <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Perfume (optional)</label>
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input">
              <option value="">General experience</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Your Experience</label>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          className="input"
          placeholder="Tell us what you thought..."
          required
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-7 py-3 bg-emerald-900 text-ivory text-sm tracking-wide hover:bg-emerald-800 disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
