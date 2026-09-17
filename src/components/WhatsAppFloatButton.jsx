import { useSettings } from '@/context/SettingsContext'
import { buildGeneralInquiryMessage, openWhatsAppOrder } from '@/lib/whatsapp'

export default function WhatsAppFloatButton() {
  const { settings } = useSettings()

  return (
    <button
      onClick={() => openWhatsAppOrder(settings.whatsapp_number, buildGeneralInquiryMessage())}
      aria-label="Chat with Royal Fragrance KE on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-emerald-800 text-white shadow-lg shadow-emerald-950/30 hover:bg-emerald-700 transition-colors"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.44 1.33 4.94L2 22l5.28-1.38a9.87 9.87 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92C21.96 6.45 17.5 2 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.35c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.28.86 5.84 2.42a8.19 8.19 0 0 1 2.42 5.83c0 4.55-3.7 8.25-8.27 8.25zm4.53-6.19c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28z" />
      </svg>
    </button>
  )
}
