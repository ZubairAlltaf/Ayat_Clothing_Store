'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Phone } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !contact || !message) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message })
      })
      if (res.ok) {
        setIsSuccess(true)
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hello, I have a question about Ayat Clothing Store.')
    window.open(`https://wa.me/${SITE.whatsapp}?text=${text}`, '_blank')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-border w-[320px] mb-4 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-charcoal text-champagne p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-medium">Ayat Support</h3>
              <p className="text-xs text-champagne/70">We typically reply in a few minutes.</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-champagne/70 hover:text-champagne transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex-1 bg-parchment/30">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-deep/10 text-emerald-deep rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send size={20} className="ml-1" />
                </div>
                <h4 className="font-medium text-charcoal mb-1">Message Sent!</h4>
                <p className="text-xs text-ink-muted">Our agent will reply to your contact method shortly. For a faster reply, please use WhatsApp.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-4 text-xs text-emerald-deep font-medium hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[0.7rem] font-medium text-charcoal mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep bg-white"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-charcoal mb-1">WhatsApp No. or Email</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep bg-white"
                    placeholder="To receive our reply"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-charcoal mb-1">Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep resize-none bg-white"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-charcoal text-champagne py-2.5 text-xs font-medium hover:bg-emerald-deep transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="shrink-0 px-2 text-[0.65rem] text-ink-faint uppercase tracking-wider">or preferred</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              onClick={handleWhatsApp}
              type="button"
              className="w-full bg-[#25D366] text-white py-2.5 text-xs font-medium hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={14} /> WhatsApp Us directly
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-charcoal text-champagne rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-deep transition-all hover:scale-105 active:scale-95"
        aria-label="Open support chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
