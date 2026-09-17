export function formatKsh(amount) {
  const value = Number(amount)
  if (Number.isNaN(value)) return 'KSh 0'
  return `KSh ${value.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function stockLabel(status) {
  switch (status) {
    case 'in_stock':
      return 'In Stock'
    case 'low_stock':
      return 'Low Stock'
    case 'out_of_stock':
      return 'Out of Stock'
    default:
      return status || 'In Stock'
  }
}
