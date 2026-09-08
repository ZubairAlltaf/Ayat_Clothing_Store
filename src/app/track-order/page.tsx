'use client'

import { useState } from 'react'
import { Search, CheckCircle2, Circle, Package, XCircle, Loader2, AlertTriangle, ShoppingBag } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const TIMELINE_STEPS = [
  'pending',
  'payment_pending',
  'payment_verified',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
]

const CANCELLED_STATUSES = ['cancelled', 'return_requested', 'returned']

interface OrderItemData {
  product_name: string
  variant_info: string | null
  quantity: number
  unit_price: number
  total: number
}

interface OrderData {
  order_number: string
  customer_name: string
  phone: string
  total: number
  subtotal: number
  delivery_fee: number
  payment_method: string
  payment_status: string
  order_status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItemData[]
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const supabase = createClient()

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber || !phone) return

    setLoading(true)
    setError(null)
    setOrder(null)
    setSearched(true)

    try {
      // Query order by order_number AND phone to verify ownership
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('order_number, customer_name, phone, total, subtotal, delivery_fee, payment_method, payment_status, order_status, admin_notes, created_at, updated_at, order_items(product_name, variant_info, quantity, unit_price, total)')
        .eq('order_number', orderNumber.toUpperCase().trim())
        .eq('phone', phone.trim())
        .single()

      if (dbError || !data) {
        setError('No order found with this order number and phone combination. Please check your details and try again.')
      } else {
        setOrder(data)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isCancelled = order ? CANCELLED_STATUSES.includes(order.order_status) : false
  const isRejected = order?.payment_status === 'rejected'
  const currentStepIndex = order ? TIMELINE_STEPS.indexOf(order.order_status) : -1

  return (
    <div className="max-w-[600px] mx-auto px-5 py-16 lg:py-24">
      <div className="text-center mb-12">
        <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Order Status</span>
        <h1 className="font-serif text-[2rem] lg:text-[2.5rem] text-charcoal">Track Your Order</h1>
        <p className="text-sm text-ink-muted mt-2">Enter your order number and the phone number you used during checkout.</p>
      </div>

      {/* Search Form — always visible */}
      <form onSubmit={handleTrack} className="space-y-5 mb-10">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Order Number</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. AYAT-A1B2C3"
            className="w-full border border-border bg-champagne px-4 py-3 text-sm outline-none focus:border-emerald-deep font-mono uppercase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Phone Number (used during checkout)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX XXXXXXX"
            className="w-full border border-border bg-champagne px-4 py-3 text-sm outline-none focus:border-emerald-deep"
          />
        </div>
        <button
          type="submit"
          disabled={!orderNumber || !phone || loading}
          className="w-full bg-emerald-deep text-champagne py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? 'Searching...' : 'Track Order'}
        </button>
      </form>

      {/* Error */}
      {error && searched && (
        <div className="bg-red-50 border border-red-100 p-5 text-center">
          <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Order Result */}
      {order && (
        <div>
          {/* Order Info Card */}
          <div className="bg-parchment p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package size={20} className="text-emerald-deep" />
              <div>
                <p className="text-sm font-medium text-charcoal font-mono">{order.order_number}</p>
                <p className="text-xs text-ink-muted">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-ink-muted">Customer</p>
                <p className="font-medium text-charcoal">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Total</p>
                <p className="font-medium text-charcoal">{formatPrice(Number(order.total))}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Payment Method</p>
                <p className="font-medium text-charcoal capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Payment Status</p>
                <p className={`font-medium capitalize ${
                  order.payment_status === 'verified' ? 'text-green-700' :
                  order.payment_status === 'rejected' ? 'text-red-600' :
                  'text-yellow-700'
                }`}>{order.payment_status}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-parchment p-6 mb-8">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <ShoppingBag size={18} className="text-emerald-deep" />
              <h3 className="text-sm font-semibold text-charcoal">Order Items</h3>
            </div>
            <div className="space-y-4">
              {order.order_items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-medium text-charcoal">{item.product_name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {item.variant_info ? `${item.variant_info} · ` : ''}Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-charcoal whitespace-nowrap">
                    {formatPrice(Number(item.total))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection / Cancellation Notice */}
          {isRejected && (
            <div className="bg-red-50 border border-red-100 p-5 mb-8">
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Payment Rejected</p>
                  <p className="text-xs text-red-600 mt-1">
                    Your payment could not be verified. Please contact us via WhatsApp for assistance.
                  </p>
                  {order.admin_notes && (
                    <p className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
                      <strong>Reason:</strong> {order.admin_notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-100 p-5 mb-8">
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Order {order.order_status === 'cancelled' ? 'Cancelled' : order.order_status === 'returned' ? 'Returned' : 'Return Requested'}
                  </p>
                  {order.admin_notes && (
                    <p className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
                      <strong>Reason:</strong> {order.admin_notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {!isCancelled && (
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => {
                const isComplete = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {isComplete ? (
                        <CheckCircle2
                          size={20}
                          className={isCurrent ? 'text-emerald-deep' : 'text-sage'}
                          fill={isCurrent ? 'currentColor' : 'none'}
                        />
                      ) : (
                        <Circle size={20} className="text-border" />
                      )}
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`w-px h-10 ${isComplete ? 'bg-sage' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-emerald-deep' : isComplete ? 'text-charcoal' : 'text-ink-faint'}`}>
                        {ORDER_STATUS_LABELS[step] || step.replace(/_/g, ' ')}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-ink-muted mt-0.5">Current status</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Last Updated */}
          <p className="text-xs text-ink-faint text-center mt-4">
            Last updated: {new Date(order.updated_at).toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  )
}
