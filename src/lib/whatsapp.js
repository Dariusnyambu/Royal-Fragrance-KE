import { formatKsh } from './format'

/**
 * Normalizes a WhatsApp number to digits-only international format
 * (e.g. "0708 039 015" or "+254708039015" -> "254708039015").
 */
export function normalizeWhatsAppNumber(raw) {
  if (!raw) return ''
  let digits = raw.replace(/[^\d]/g, '')
  if (digits.startsWith('0')) {
    digits = `254${digits.slice(1)}`
  }
  return digits
}

/**
 * Builds the WhatsApp order message for a single product order.
 */
export function buildOrderMessage({
  productName,
  brand,
  size,
  quantity = 1,
  price,
  customerName,
  notes,
}) {
  const lines = [
    'Hello Royal Fragrance KE 👋',
    '',
    'I would like to order:',
    '',
    `Perfume: ${productName}`,
  ]

  if (brand) lines.push(`Brand: ${brand}`)
  if (size) lines.push(`Size: ${size}`)
  lines.push(`Quantity: ${quantity}`)
  if (price !== undefined && price !== null) {
    lines.push(`Price: ${formatKsh(price)}`)
  }
  if (customerName) lines.push(`Name: ${customerName}`)
  if (notes) lines.push(`Notes: ${notes}`)

  lines.push('', 'Please confirm availability and delivery details.')

  return lines.join('\n')
}

/**
 * Builds a generic inquiry message (used by the floating button / CTA
 * sections that aren't tied to a specific product).
 */
export function buildGeneralInquiryMessage() {
  return [
    'Hello Royal Fragrance KE 👋',
    '',
    "I'd like to know more about your perfumes.",
  ].join('\n')
}

/**
 * Opens WhatsApp (web or app, depending on device) with the given
 * message pre-filled, addressed to the configured business number.
 */
export function openWhatsAppOrder(whatsappNumber, message) {
  const number = normalizeWhatsAppNumber(whatsappNumber)
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${number}?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
