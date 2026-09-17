import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, emptyMessage = 'No perfumes found.' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] bg-cream" />
            <div className="mt-3 h-3 w-16 bg-cream" />
            <div className="mt-2 h-4 w-32 bg-cream" />
            <div className="mt-2 h-3 w-20 bg-cream" />
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center text-charcoal/50">
        <p className="font-display text-xl mb-1">Nothing here yet</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
