export function resolveSlideLink(slide) {
  if (!slide) return null
  switch (slide.link_type) {
    case 'product':
      return slide.products?.slug ? { to: `/product/${slide.products.slug}`, external: false } : null
    case 'category':
      return slide.categories?.slug ? { to: `/shop?category=${slide.categories.slug}`, external: false } : null
    case 'custom':
      if (!slide.cta_url) return null
      return { to: slide.cta_url, external: /^https?:\/\//.test(slide.cta_url) }
    case 'none':
    default:
      return null
  }
}
