import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_SETTINGS = {
  business_name: 'Royal Fragrance KE',
  whatsapp_number: '254708039015',
  email: 'hello@royalfragrance.co.ke',
  phone: '',
  location: 'Nairobi, Kenya',
  instagram: '',
  facebook: '',
  tiktok: '',
  delivery_information: 'Delivery Available Across Kenya',
  about_text:
    'Royal Fragrance KE brings you original perfumes from carefully selected fragrance brands, delivered across Kenya.',
  hero_heading: 'Discover Your Signature Scent.',
  hero_subheading:
    'Original perfumes from carefully selected fragrance brands, delivered across Kenya.',
  banner_enabled: false,
  banner_heading: '',
  banner_subheading: '',
  banner_image_url: '',
  banner_button_text: 'Shop Now',
  banner_button_link: '/shop',
}

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: () => {},
})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      setSettings({ ...DEFAULT_SETTINGS, ...data })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
