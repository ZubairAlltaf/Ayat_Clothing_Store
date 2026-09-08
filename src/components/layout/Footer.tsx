import Link from 'next/link'
import { SITE } from '@/lib/constants'
import NewsletterForm from '@/components/ui/NewsletterForm'

const shopLinks = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'Children', href: '/children' },
  { label: 'Unstitched', href: '/unstitched' },
  { label: 'Ready to Wear', href: '/ready-to-wear' },
  { label: 'Sale', href: '/sale' },
]

const careLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQs', href: '/contact' },
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Track Order', href: '/track-order' },
]

const infoLinks = [
  { label: 'About AYAT', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-charcoal text-champagne/80">
      {/* Main Footer */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex flex-col">
              <span className="font-serif text-2xl tracking-[0.04em] text-champagne">
                {SITE.name}
              </span>
              <span className="eyebrow text-[0.45rem] text-gold tracking-[0.35em] mt-0.5">
                {SITE.tagline}
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-champagne/50 max-w-[280px] font-serif italic">
              Elegance in every thread. Tradition, refined for today.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="eyebrow text-gold mb-5 text-[0.65rem]">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-champagne/50 hover:text-champagne transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="eyebrow text-gold mb-5 text-[0.65rem]">Customer Care</h4>
            <ul className="space-y-3">
              {careLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-champagne/50 hover:text-champagne transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Info */}
          <div>
            <h4 className="eyebrow text-gold mb-5 text-[0.65rem]">Stay In The Loop</h4>
            <p className="text-sm text-champagne/50 mb-4 leading-relaxed">
              Be the first to discover new arrivals, exclusive edits and special collections.
            </p>
            <NewsletterForm />

            <h4 className="eyebrow text-gold mb-4 text-[0.65rem]">Information</h4>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-champagne/50 hover:text-champagne transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-champagne/10">
        <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-champagne/30">
          <p>&copy; {new Date().getFullYear()} {SITE.name} Clothing Store. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-champagne/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-champagne/60 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
