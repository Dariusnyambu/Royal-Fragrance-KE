export default function ShopFilters({ filters, onChange, brands, categories }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-7">
      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search perfumes..."
          className="w-full border border-charcoal/15 bg-transparent px-3 py-2 text-sm focus:border-gold-500"
        />
      </div>

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Gender</label>
        <select
          value={filters.gender}
          onChange={(e) => update('gender', e.target.value)}
          className="w-full border border-charcoal/15 bg-ivory px-3 py-2 text-sm focus:border-gold-500"
        >
          <option value="">All</option>
          <option value="men">Men's</option>
          <option value="women">Women's</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          className="w-full border border-charcoal/15 bg-ivory px-3 py-2 text-sm focus:border-gold-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => update('brand', e.target.value)}
          className="w-full border border-charcoal/15 bg-ivory px-3 py-2 text-sm focus:border-gold-500"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Price Range (KSh)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            placeholder="Min"
            className="w-1/2 border border-charcoal/15 bg-transparent px-3 py-2 text-sm focus:border-gold-500"
          />
          <span className="text-charcoal/30">–</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            placeholder="Max"
            className="w-1/2 border border-charcoal/15 bg-transparent px-3 py-2 text-sm focus:border-gold-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs tracking-wide text-charcoal/50 block mb-2">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full border border-charcoal/15 bg-ivory px-3 py-2 text-sm focus:border-gold-500"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
    </div>
  )
}
