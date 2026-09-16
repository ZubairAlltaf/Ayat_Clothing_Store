'use client'

import { Phone } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function WhatsAppButton() {
  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hello, I have a question about Ayat Clothing Store.')
    window.open(`https://wa.me/${SITE.whatsapp}?text=${text}`, '_blank')
  }

  return (
    <button
      onClick={handleWhatsApp}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#128C7E] transition-all hover:scale-105 active:scale-95"
      aria-label="Contact us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <Phone size={24} />
    </button>
  )
}
