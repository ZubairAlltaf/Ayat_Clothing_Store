import { SITE } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'AYAT Clothing Store privacy policy — how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16 lg:py-24">
      <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Legal</span>
      <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-10">Privacy Policy</h1>

      <div className="space-y-8 text-sm text-ink-muted leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Information We Collect</h2>
          <p>When you place an order with {SITE.name}, we collect the following information: your name, phone number, email address, delivery address, and payment transaction details. This information is necessary to process your order and deliver your purchase.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To process and deliver your orders</li>
            <li>To verify payments via JazzCash and Easypaisa</li>
            <li>To communicate order updates via WhatsApp, phone, or email</li>
            <li>To improve our products and services</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information. We do not store sensitive payment details. All payment transactions are processed directly through JazzCash or Easypaisa.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Third-Party Services</h2>
          <p>We use Supabase for secure data storage and authentication. Your information is stored on servers with enterprise-grade security. We do not sell or share your personal data with third parties for marketing purposes.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Contact Us</h2>
          <p>If you have questions about this privacy policy, contact us at {SITE.email} or WhatsApp us at {SITE.phone}.</p>
        </div>
      </div>
    </div>
  )
}
