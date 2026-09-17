import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AdminLogin() {
  const { session, isAdmin, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ivory text-center mb-1">Royal Fragrance KE</h1>
        <p className="text-center text-ivory/50 text-sm mb-8">Admin Dashboard</p>

        <form onSubmit={handleSubmit} className="bg-ivory p-8 space-y-5">
          <div>
            <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-charcoal/15 bg-transparent px-3 py-2.5 text-sm focus:border-gold-500"
            />
          </div>
          <div>
            <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-charcoal/15 bg-transparent px-3 py-2.5 text-sm focus:border-gold-500"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-900 text-ivory text-sm tracking-wide hover:bg-emerald-800 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
