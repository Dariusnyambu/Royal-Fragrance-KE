import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev rather than silently returning empty data everywhere.
  console.error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Storage bucket names, kept in one place so they're easy to change.
export const BUCKETS = {
  products: 'product-images',
  brands: 'brand-logos',
  slides: 'slider-images',
}

export function publicImageUrl(bucket, path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl ?? null
}
