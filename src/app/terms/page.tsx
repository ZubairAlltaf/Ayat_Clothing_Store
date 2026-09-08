import { SITE } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'AYAT Clothing Store terms and conditions of use.',
}

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16 lg:py-24">
      <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Legal</span>
      <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-10">Terms & Conditions</h1>

      <div className="space-y-8 text-sm text-ink-muted leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">General</h2>
          <p>By accessing and using the {SITE.name} Clothing Store website, you accept and agree to be bound by these terms and conditions. If you do not agree to these terms, please do not use our website.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Products & Pricing</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All prices are listed in Pakistani Rupees (PKR)</li>
            <li>Prices are subject to change without prior notice</li>
            <li>Product colors may slightly vary due to screen settings</li>
            <li>We reserve the right to limit quantities or refuse orders</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Payments</h2>
          <p>We accept payments via JazzCash and Easypaisa only. Cash on delivery is not available. All payments are manually verified by our team before order processing begins.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Order Cancellation</h2>
          <p>You may cancel an order within 24 hours of placing it by contacting us via WhatsApp. Once an order is in processing, cancellation may not be possible.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Contact</h2>
          <p>For any questions regarding these terms, contact us at {SITE.email} or WhatsApp at {SITE.phone}.</p>
        </div>
      </div>
    </div>
  )
}
