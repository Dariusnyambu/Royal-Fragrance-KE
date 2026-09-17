import { Link } from 'react-router-dom'
import { formatKsh, stockLabel } from '@/lib/format'
import { useSettings } from '@/context/SettingsContext'
import { buildOrderMessage, openWhatsAppOrder } from '@/lib/whatsapp'

export default function ProductCard({ product }) {
  const { settings } = useSettings()
  const image = product.product_images?.[0]?.image_url || product.image_url
  const primarySize = Array.isArray(product.sizes) ? product.sizes[0] : product.sizes
  const displayPrice = product.sale_price ?? product.price
  const outOfStock = product.stock_status === 'out_of_stock'

  function handleWhatsAppOrder(e) {
    e.preventDefault()
    const message = buildOrderMessage({
      productName: product.name,
      brand: product.brands?.name,
      size: primarySize,
      quantity: 1,
      price: displayPrice,
    })
    openWhatsAppOrder(settings.whatsapp_number, message)
  }

  return (
    <div className="group flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-cream">
        {image ? (
          <img
            src={image}
            alt={`${product.brands?.name ? product.brands.name + ' ' : ''}${product.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-charcoal/30 font-display text-lg">
            Royal Fragrance
          </div>
        )}
        {product.is_new && (
          <span className="absolute top-3 left-3 bg-emerald-900 text-ivory text-[11px] tracking-wide px-2.5 py-1">
            New
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 right-3 bg-charcoal/85 text-ivory text-[11px] tracking-wide px-2.5 py-1">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="pt-3 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs tracking-wide text-charcoal/55">
            {product.brands?.name || 'Royal Fragrance KE'}
          </span>
          {primarySize && <span className="text-xs text-charcoal/45">{primarySize}</span>}
        </div>
        <Link to={`/product/${product.slug}`} className="font-display text-lg leading-snug hover:text-emerald-800">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-charcoal/90">{formatKsh(displayPrice)}</span>
          {product.sale_price && (
            <span className="text-xs text-charcoal/40 line-through">{formatKsh(product.price)}</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Link
            to={`/product/${product.slug}`}
            className="text-xs tracking-wide text-emerald-900 border-b border-emerald-900/40 hover:border-emerald-900 pb-0.5"
          >
            View Details
          </Link>
          <button
            onClick={handleWhatsAppOrder}
            disabled={outOfStock}
            className="ml-auto text-xs tracking-wide px-3 py-1.5 bg-emerald-900 text-ivory hover:bg-emerald-800 disabled:bg-charcoal/20 disabled:text-charcoal/50 transition-colors"
          >
            {outOfStock ? stockLabel(product.stock_status) : 'Order via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
