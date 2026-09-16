import { SITE, DELIVERY } from '@/lib/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQs)',
  description: 'Find answers to common questions about Ayat Clothing Store, including delivery times, shipping rates, fabric care, and our return policy.',
}

export default function FAQPage() {
  const faqs = [
    {
      question: "What are your delivery charges?",
      answer: `We offer FREE nationwide delivery on all orders above PKR ${DELIVERY.freeThreshold.toLocaleString()}. For orders below this amount, a flat shipping rate of PKR ${DELIVERY.standardRate} applies.`
    },
    {
      question: "How long will my order take to arrive?",
      answer: `Our standard delivery time is ${DELIVERY.estimatedDays}. Once your order is dispatched, you will receive a tracking number via email or SMS.`
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within Pakistan. We are working on expanding our delivery network internationally in the near future."
    },
    {
      question: "What is your return and exchange policy?",
      answer: "We offer a 7-day exchange policy for unopened, unstitched suits in their original packaging. Please note that sale items and stitched garments are not eligible for return or exchange unless there is a manufacturing defect."
    },
    {
      question: "How do I care for my premium fabrics?",
      answer: "For delicate fabrics like Chiffon and Silk, we recommend dry cleaning only. For Lawn, Cotton, and Karandi, hand wash separately in cold water and dry in the shade to maintain the color and fabric integrity."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order using the 'Track Order' link in our footer. Simply enter your Order ID and the phone number used during checkout."
    }
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-16 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center mb-14">
        <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Help Center</span>
        <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-3">Frequently Asked Questions</h1>
        <p className="text-sm text-ink-muted max-w-[500px] mx-auto">
          Find answers to common questions about our delivery, returns, fabrics, and more.
        </p>
      </div>

      <div className="max-w-[800px] mx-auto space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-8 shadow-sm border border-champagne/20">
            <h3 className="font-serif text-lg text-charcoal mb-3">{faq.question}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center bg-parchment p-10">
        <h3 className="font-serif text-xl text-charcoal mb-2">Still have questions?</h3>
        <p className="text-sm text-ink-muted mb-6">Our customer support team is here to help.</p>
        <a href="/contact" className="inline-block bg-charcoal text-champagne px-8 py-3 eyebrow text-[0.7rem] hover:bg-emerald-deep transition-colors">
          Contact Us
        </a>
      </div>
    </div>
  )
}
