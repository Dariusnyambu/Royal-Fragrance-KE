import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-32 text-center">
      <h1 className="font-display text-5xl mb-4">404</h1>
      <p className="text-charcoal/60 mb-8">This page doesn't exist.</p>
      <Link to="/" className="px-6 py-3 bg-emerald-900 text-ivory text-sm tracking-wide inline-block">
        Back to Home
      </Link>
    </div>
  )
}
