import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Returns & Exchange',
  description: 'AYAT Clothing Store return and exchange policy.',
}

export default function ReturnsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 py-16 lg:py-24">
      <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Customer Care</span>
      <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-10">Returns & Exchange</h1>

      <div className="space-y-8 text-sm text-ink-muted leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Return Policy</h2>
          <p>We want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, you may return or exchange it within <strong>7 days</strong> of delivery.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Conditions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Items must be unworn, unwashed and in original condition with tags attached.</li>
            <li>Items purchased on sale are final sale and cannot be returned.</li>
            <li>Custom-stitched items are non-returnable.</li>
            <li>Return shipping is the responsibility of the customer.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">How to Return</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contact us via WhatsApp or email with your order number.</li>
            <li>We will provide you with return instructions.</li>
            <li>Ship the item back to us in its original packaging.</li>
            <li>Once received and inspected, your refund or exchange will be processed within 5-7 business days.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Exchanges</h2>
          <p>For exchanges (size or color), please contact us within 7 days of delivery. Exchanges are subject to availability.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-charcoal mb-3">Damaged or Defective Items</h2>
          <p>If you receive a damaged or defective item, please contact us immediately with photos. We will arrange a replacement at no extra cost.</p>
        </div>
      </div>
    </div>
  )
}
