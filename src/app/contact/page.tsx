import { SITE } from '@/lib/constants'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with AYAT Clothing Store. We\'re here to help with orders, sizing, and more.',
}

export default function ContactPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-5 py-16 lg:py-24">
      <div className="text-center mb-14">
        <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Get In Touch</span>
        <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-3">Contact Us</h1>
        <p className="text-sm text-ink-muted max-w-[400px] mx-auto">
          Have a question about an order, need sizing help, or just want to say hello?
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: MessageCircle, title: 'WhatsApp', info: SITE.phone, href: `https://wa.me/${SITE.whatsapp}` },
          { icon: Phone, title: 'Phone', info: SITE.phone, href: `tel:+${SITE.whatsapp}` },
          { icon: Mail, title: 'Email', info: SITE.email, href: `mailto:${SITE.email}` },
          { icon: MapPin, title: 'Location', info: 'Pakistan', href: '#' },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="bg-parchment p-6 text-center hover:bg-emerald-deep group transition-colors duration-300"
          >
            <item.icon size={22} className="mx-auto mb-3 text-emerald-deep group-hover:text-champagne transition-colors" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-charcoal group-hover:text-champagne mb-1 transition-colors">{item.title}</h3>
            <p className="text-xs text-ink-muted group-hover:text-champagne/70 transition-colors">{item.info}</p>
          </a>
        ))}
      </div>

      {/* Contact Form */}
      <div className="max-w-[560px] mx-auto">
        <h2 className="font-serif text-xl text-charcoal mb-6">Send Us a Message</h2>
        <form className="space-y-5" action="#">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Name</label>
              <input type="text" className="w-full border border-border bg-champagne px-4 py-3 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Phone</label>
              <input type="tel" className="w-full border border-border bg-champagne px-4 py-3 text-sm outline-none focus:border-emerald-deep" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
            <input type="email" className="w-full border border-border bg-champagne px-4 py-3 text-sm outline-none focus:border-emerald-deep" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Message</label>
            <textarea rows={5} className="w-full border border-border bg-champagne px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none" />
          </div>
          <button type="submit" className="w-full bg-emerald-deep text-champagne py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
