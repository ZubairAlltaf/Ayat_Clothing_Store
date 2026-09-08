'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle, Copy, Check } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'
import { formatPrice } from '@/lib/utils'
import { PAYMENT, DELIVERY, SITE } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Step = 'info' | 'summary' | 'payment'
type PaymentMethod = 'jazzcash' | 'easypaisa'

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore()
  const [step, setStep] = useState<Step>('info')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('jazzcash')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [finalTotal, setFinalTotal] = useState(0)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    transactionId: '',
  })

  const subtotal = getSubtotal()
  const deliveryFee = subtotal >= DELIVERY.freeThreshold ? 0 : DELIVERY.standardRate
  const total = subtotal + deliveryFee

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const supabase = createClient()

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    setFinalTotal(total)

    try {
      let paymentProofUrl = null

      if (paymentProof) {
        const authRes = await fetch('/api/imagekit/auth')
        const authData = await authRes.json()

        if (authData.error) throw new Error('Failed to authenticate image upload')

        const formData = new FormData()
        formData.append('file', paymentProof)
        formData.append('fileName', paymentProof.name)
        formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
        formData.append('signature', authData.signature)
        formData.append('expire', authData.expire.toString())
        formData.append('token', authData.token)
        formData.append('folder', '/payment-proofs')

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error('Failed to upload payment proof')
        const uploadData = await uploadRes.json()
        paymentProofUrl = uploadData.url
      }

      const num = `AYAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const { data: { session } } = await supabase.auth.getSession()

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: num,
          customer_id: session?.user?.id || null,
          customer_name: form.fullName,
          phone: form.phone,
          email: form.email || null,
          address: form.address,
          city: form.city,
          province: form.province,
          postal_code: form.postalCode || null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: paymentMethod,
          transaction_id: form.transactionId,
          payment_proof_url: paymentProofUrl,
          order_status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItemsToInsert = items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.name,
        variant_info: [item.color, item.size].filter(Boolean).join(' - ') || null,
        quantity: item.quantity,
        unit_price: item.salePrice ?? item.price,
        total: (item.salePrice ?? item.price) * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) throw itemsError

      setOrderNumber(num)
      setOrderPlaced(true)
      clearCart()
      useToastStore.getState().addToast('Order placed successfully! We will verify your payment shortly.', 'success')
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error: any) {
      console.error('Checkout error:', error)
      useToastStore.getState().addToast(error.message || 'Failed to place order. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="max-w-[480px] w-full text-center py-16">
          <CheckCircle size={48} className="text-emerald-deep mx-auto mb-6" strokeWidth={1.5} />
          <span className="eyebrow text-emerald-deep text-[0.6rem] mb-3 block">Order Received</span>
          <h1 className="font-serif text-[2rem] text-charcoal mb-4">Thank You!</h1>
          <p className="text-sm text-ink-muted mb-8 leading-relaxed">
            Your order has been successfully received. We are verifying your payment and will contact you if any additional confirmation is required.
          </p>

          <div className="bg-parchment p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Order Number</span>
              <span className="font-medium text-charcoal">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Payment Method</span>
              <span className="font-medium text-charcoal">{PAYMENT[paymentMethod].name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Total</span>
              <span className="font-medium text-charcoal">{formatPrice(finalTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Delivery</span>
              <span className="font-medium text-charcoal">{DELIVERY.estimatedDays}</span>
            </div>
          </div>

          <p className="text-xs text-ink-muted mb-8 leading-relaxed">
            You will receive a call or WhatsApp update regarding your order. Please keep your phone available for order confirmation and delivery updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/track-order" className="flex-1 bg-emerald-deep text-champagne py-3 eyebrow text-[0.65rem] text-center hover:bg-charcoal transition-colors">
              Track Order
            </Link>
            <Link href="/" className="flex-1 border border-border py-3 eyebrow text-[0.65rem] text-center hover:bg-parchment transition-colors">
              Continue Shopping
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=Hi, I just placed order ${orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-emerald-deep text-emerald-deep py-3 eyebrow text-[0.65rem] text-center hover:bg-emerald-deep hover:text-champagne transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-[2rem] text-charcoal mb-4">Your Bag is Empty</h1>
        <p className="text-sm text-ink-muted mb-8 max-w-[400px]">
          Looks like you haven't added anything to your cart yet. Discover our premium collections and find your perfect outfit.
        </p>
        <Link href="/" className="bg-emerald-deep text-champagne px-8 py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors">
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-10 lg:py-16">
      {/* Header */}
      <div className="mb-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-charcoal mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to cart
        </Link>
        <h1 className="font-serif text-[2rem] lg:text-[2.5rem] text-charcoal">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        {/* Left: Steps */}
        <div>
          {/* Step Indicators */}
          <div className="flex items-center gap-4 mb-10">
            {(['info', 'summary', 'payment'] as Step[]).map((s, i) => (
              <button
                key={s}
                onClick={() => { if (i < (['info', 'summary', 'payment'] as Step[]).indexOf(step) + 1) setStep(s) }}
                className={`eyebrow text-[0.6rem] pb-2 border-b-2 transition-colors ${
                  step === s ? 'border-emerald-deep text-emerald-deep' : 'border-transparent text-ink-faint'
                }`}
              >
                {i + 1}. {s === 'info' ? 'Information' : s === 'summary' ? 'Review' : 'Payment'}
              </button>
            ))}
          </div>

          {/* Step 1: Information */}
          {step === 'info' && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-charcoal mb-6">Customer Information</h2>
              <InputField label="Full Name *" value={form.fullName} onChange={(v) => updateForm('fullName', v)} />
              <InputField label="Phone Number *" value={form.phone} onChange={(v) => updateForm('phone', v)} type="tel" />
              <InputField label="Email" value={form.email} onChange={(v) => updateForm('email', v)} type="email" />
              <InputField label="Address *" value={form.address} onChange={(v) => updateForm('address', v)} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="City *" value={form.city} onChange={(v) => updateForm('city', v)} />
                <InputField label="Province *" value={form.province} onChange={(v) => updateForm('province', v)} />
              </div>
              <InputField label="Postal Code" value={form.postalCode} onChange={(v) => updateForm('postalCode', v)} />
              <button
                onClick={() => setStep('summary')}
                disabled={!form.fullName || !form.phone || !form.address || !form.city || !form.province}
                className="w-full bg-emerald-deep text-champagne py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-4"
              >
                Continue to Review
              </button>
            </div>
          )}

          {/* Step 2: Summary */}
          {step === 'summary' && (
            <div>
              <h2 className="font-serif text-xl text-charcoal mb-6">Review Your Order</h2>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                    <div className="relative w-16 h-20 bg-parchment shrink-0 overflow-hidden">
                      <Image
                        src={item.image || '/images/hero_men.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(' · ')} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('info')} className="flex-1 border border-border py-3 eyebrow text-[0.65rem] hover:bg-parchment transition-colors">
                  Edit Info
                </button>
                <button onClick={() => setStep('payment')} className="flex-1 bg-emerald-deep text-champagne py-3 eyebrow text-[0.65rem] hover:bg-charcoal transition-colors">
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div>
              <h2 className="font-serif text-xl text-charcoal mb-6">Payment Method</h2>

              {/* Method Selection */}
              <div className="flex gap-3 mb-8">
                {(['jazzcash', 'easypaisa'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-4 border text-center eyebrow text-[0.65rem] transition-all ${
                      paymentMethod === method
                        ? 'border-emerald-deep text-emerald-deep bg-emerald-deep/5'
                        : 'border-border text-ink-muted hover:border-charcoal'
                    }`}
                  >
                    {PAYMENT[method].name}
                  </button>
                ))}
              </div>

              {/* Payment Instructions */}
              <div className="bg-parchment p-6 mb-6">
                <h3 className="text-sm font-semibold text-charcoal mb-4">Payment Instructions</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Account Name</span>
                    <span className="font-medium text-charcoal">{PAYMENT[paymentMethod].accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{PAYMENT[paymentMethod].name} Number</span>
                    <div className="flex items-center">
                      <span className="font-medium text-charcoal">{PAYMENT[paymentMethod].number}</span>
                      <CopyButton text={PAYMENT[paymentMethod].number} />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Amount</span>
                    <span className="font-semibold text-charcoal">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border">
                  <ol className="text-xs text-ink-muted space-y-2 list-decimal pl-4">
                    <li>Send the exact order amount to the {PAYMENT[paymentMethod].name} number above.</li>
                    <li>Keep the payment confirmation screenshot.</li>
                    <li>Enter the transaction/reference ID below.</li>
                    <li>Submit the order.</li>
                  </ol>
                </div>
              </div>

              {/* Transaction ID */}
              <InputField label="Transaction / Reference ID (Optional)" value={form.transactionId} onChange={(v) => updateForm('transactionId', v)} />

              {/* Upload Payment Proof */}
              <div className="mt-5 mb-8">
                <label className="block text-sm font-medium text-charcoal mb-2">Payment Proof (Screenshot)</label>
                {proofPreview ? (
                  <div className="relative">
                    <img src={proofPreview} alt="Payment proof" className="w-full max-h-[300px] object-contain border border-border bg-parchment" />
                    <button
                      type="button"
                      onClick={() => { setPaymentProof(null); setProofPreview(null) }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full text-xs hover:bg-red-700 transition-colors"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-emerald-deep mt-2">✓ Screenshot attached — will be uploaded when you place the order</p>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border py-8 cursor-pointer hover:border-emerald-deep hover:bg-parchment transition-all text-ink-muted text-sm">
                    <Upload size={18} />
                    <span>Upload payment screenshot</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setPaymentProof(file)
                          setProofPreview(URL.createObjectURL(file))
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-emerald-deep text-champagne py-4 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
              <p className="text-xs text-ink-faint text-center mt-3">
                Payment status: Pending Verification. Admin will verify your payment.
              </p>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="bg-parchment p-6 lg:p-8">
            <h3 className="font-serif text-lg text-charcoal mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="text-xs text-emerald-deep">Free delivery on orders above {formatPrice(DELIVERY.freeThreshold)}</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-charcoal">
                <span>Total</span>
                <span className="font-serif text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Reusable Input ── */
function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-champagne px-4 py-3 text-sm text-charcoal placeholder:text-ink-faint outline-none focus:border-emerald-deep transition-colors"
      />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="ml-2 text-ink-muted hover:text-emerald-deep transition-colors inline-flex items-center gap-1"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} className="text-emerald-deep" /> : <Copy size={14} />}
    </button>
  )
}
