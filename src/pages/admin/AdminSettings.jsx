import { useEffect, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { adminUpdateSettings } from '@/lib/api'
import ImageUploader from '@/components/admin/ImageUploader'

export default function AdminSettings() {
  const { settings, refresh } = useSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminUpdateSettings(settings.id, form)
      await refresh()
      setSaved(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!settings.id) {
    return <p className="text-sm text-charcoal/50">Loading settings...</p>
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-6">Site Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-ivory border border-charcoal/10 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Business Name">
            <input value={form.business_name || ''} onChange={(e) => update('business_name', e.target.value)} className="input" />
          </Field>
          <Field label="WhatsApp Number (e.g. 0708039015)">
            <input value={form.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} className="input" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} className="input" />
          </Field>
          <Field label="Phone Number">
            <input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} className="input" />
          </Field>
          <Field label="Business Location">
            <input value={form.location || ''} onChange={(e) => update('location', e.target.value)} className="input" />
          </Field>
          <Field label="Instagram URL">
            <input value={form.instagram || ''} onChange={(e) => update('instagram', e.target.value)} className="input" />
          </Field>
          <Field label="Facebook URL">
            <input value={form.facebook || ''} onChange={(e) => update('facebook', e.target.value)} className="input" />
          </Field>
          <Field label="TikTok URL">
            <input value={form.tiktok || ''} onChange={(e) => update('tiktok', e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="Delivery Information">
          <input value={form.delivery_information || ''} onChange={(e) => update('delivery_information', e.target.value)} className="input" />
        </Field>

        <Field label="About Text">
          <textarea rows={3} value={form.about_text || ''} onChange={(e) => update('about_text', e.target.value)} className="input" />
        </Field>

        <Field label="Homepage Hero Heading">
          <input value={form.hero_heading || ''} onChange={(e) => update('hero_heading', e.target.value)} className="input" />
        </Field>

        <Field label="Homepage Hero Subheading">
          <textarea rows={2} value={form.hero_subheading || ''} onChange={(e) => update('hero_subheading', e.target.value)} className="input" />
        </Field>

        <div className="hairline-solid" />

        <div>
          <label className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={!!form.banner_enabled}
              onChange={(e) => update('banner_enabled', e.target.checked)}
              className="h-4 w-4 accent-emerald-800"
            />
            Show promotional banner on homepage
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Banner Heading">
              <input value={form.banner_heading || ''} onChange={(e) => update('banner_heading', e.target.value)} className="input" placeholder="e.g. Festive Season Offers" />
            </Field>
            <Field label="Button Text">
              <input value={form.banner_button_text || ''} onChange={(e) => update('banner_button_text', e.target.value)} className="input" placeholder="Shop Now" />
            </Field>
            <Field label="Banner Subheading">
              <input value={form.banner_subheading || ''} onChange={(e) => update('banner_subheading', e.target.value)} className="input" />
            </Field>
            <Field label="Button Link">
              <input value={form.banner_button_link || ''} onChange={(e) => update('banner_button_link', e.target.value)} className="input" placeholder="/shop" />
            </Field>
          </div>

          <div className="mt-5">
            <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Banner Image</label>
            <ImageUploader
              images={form.banner_image_url}
              onChange={(url) => update('banner_image_url', url)}
              multiple={false}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-7 py-3 bg-emerald-900 text-ivory text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm text-emerald-800">Saved.</span>}
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs tracking-wide text-charcoal/50 block mb-2">{label}</label>
      {children}
    </div>
  )
}
