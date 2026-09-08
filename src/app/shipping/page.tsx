import { SITE, DELIVERY } from '@/lib/constants'
import { Truck, RotateCcw, Package, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping & Delivery',
  description: `Free delivery on orders above PKR ${DELIVERY.freeThreshold.toLocaleString()}. ${DELIVERY.estimatedDays} delivery across Pakistan.`,
}

export default function ShippingPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16 lg:py-24">
      <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Customer Care</span>
      <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-10">Shipping & Delivery</h1>

      <div className="space-y-10">
        <InfoCard icon={Truck} title="Delivery Across Pakistan">
          <p>We deliver to all major cities and towns across Pakistan. Estimated delivery time is <strong>{DELIVERY.estimatedDays}</strong> from the date of order confirmation.</p>
        </InfoCard>

        <InfoCard icon={Package} title="Free Delivery">
          <p>Enjoy <strong>free delivery</strong> on all orders above PKR {DELIVERY.freeThreshold.toLocaleString()}. Orders below this threshold are charged a flat rate of PKR {DELIVERY.standardRate}.</p>
        </InfoCard>

        <InfoCard icon={Clock} title="Order Processing">
          <p>Orders are processed within 24-48 hours of payment verification. You will receive a WhatsApp update once your order is dispatched.</p>
        </InfoCard>

        <InfoCard icon={RotateCcw} title="Need Help?">
          <p>For delivery queries, reach us on WhatsApp at <a href={`https://wa.me/${SITE.whatsapp}`} className="text-emerald-deep hover:underline">{SITE.phone}</a> or email us at {SITE.email}.</p>
        </InfoCard>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={18} strokeWidth={1.5} className="text-emerald-deep" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-charcoal mb-2">{title}</h2>
        <div className="text-sm text-ink-muted leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
