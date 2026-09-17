import { useEffect } from 'react'

function setMetaTag(name, content, attr = 'name') {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Sets the document title and meta description / Open Graph tags for the
 * current page. Falls back to sensible site-wide defaults when omitted.
 */
export default function usePageMeta({ title, description, image }) {
  useEffect(() => {
    const siteName = 'Royal Fragrance KE'
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Original Perfumes in Kenya`
    document.title = fullTitle

    const desc =
      description ||
      'Royal Fragrance KE — shop original perfumes from carefully selected fragrance brands, with easy WhatsApp ordering and delivery across Kenya.'

    setMetaTag('description', desc)
    setMetaTag('og:title', fullTitle, 'property')
    setMetaTag('og:description', desc, 'property')
    setMetaTag('og:type', 'website', 'property')
    if (image) setMetaTag('og:image', image, 'property')
  }, [title, description, image])
}
