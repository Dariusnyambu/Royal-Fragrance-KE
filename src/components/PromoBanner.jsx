import { Link } from 'react-router-dom'

export default function PromoBanner({ settings }) {
  if (!settings.banner_enabled || !settings.banner_heading) return null

  const link = settings.banner_button_link || '/shop'
  const isExternal = /^https?:\/\//.test(link)

  return (
    <section className="relative bg-charcoal text-ivory overflow-hidden">
      {settings.banner_image_url && (
        <img
          src={settings.banner_image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-20 text-center">
        <h2 className="font-display text-3xl sm:text-4xl">{settings.banner_heading}</h2>
        {settings.banner_subheading && (
          <p className="mt-3 text-ivory/70 max-w-lg mx-auto text-sm">{settings.banner_subheading}</p>
        )}
        {settings.banner_button_text && (
          isExternal ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block px-8 py-3 bg-gold-400 text-charcoal text-sm tracking-wide hover:bg-gold-300 transition-colors"
            >
              {settings.banner_button_text}
            </a>
          ) : (
            <Link
              to={link}
              className="mt-8 inline-block px-8 py-3 bg-gold-400 text-charcoal text-sm tracking-wide hover:bg-gold-300 transition-colors"
            >
              {settings.banner_button_text}
            </Link>
          )
        )}
      </div>
    </section>
  )
}
