'use client'

import Link from 'next/link'
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import { DELIVERY } from '@/lib/constants'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const subtotal = getSubtotal()
  const deliveryFee = subtotal >= DELIVERY.freeThreshold ? 0 : DELIVERY.standardRate
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="text-center">
          <ShoppingBag size={48} strokeWidth={1} className="text-ink-faint mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-charcoal mb-2">Your Bag is Empty</h1>
          <p className="text-sm text-ink-muted mb-8">Discover our curated collections</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-8 py-3 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-10 lg:py-16">
      <h1 className="font-serif text-[2rem] lg:text-[2.5rem] text-charcoal mb-10">Your Bag</h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Items */}
        <div>
          <div className="hidden sm:grid grid-cols-[1fr_120px_140px_80px] gap-4 pb-3 border-b border-border text-xs text-ink-muted uppercase tracking-wider">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => {
              const price = item.salePrice ?? item.price
              return (
                <div key={item.id} className="py-6 grid sm:grid-cols-[1fr_120px_140px_80px] gap-4 items-center">
                  {/* Product */}
                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-parchment shrink-0" />
                    <div>
                      <Link href={`/product/${item.slug}`} className="text-sm font-medium text-charcoal hover:underline">
                        {item.name}
                      </Link>
                      {(item.color || item.size) && (
                        <p className="text-xs text-ink-muted mt-1">{[item.color, item.size].filter(Boolean).join(' · ')}</p>
                      )}
                      <p className="text-sm text-charcoal mt-1 sm:hidden">{formatPrice(price)}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center border border-border">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-parchment" aria-label="Decrease">
                        <Minus size={12} />
                      </button>
                      <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-parchment" aria-label="Increase">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <p className="text-sm font-medium text-charcoal text-right hidden sm:block">
                    {formatPrice(price * item.quantity)}
                  </p>

                  {/* Remove */}
                  <div className="flex justify-end">
                    <button onClick={() => removeItem(item.id)} className="p-2 text-ink-faint hover:text-charcoal transition-colors" aria-label="Remove">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="bg-parchment p-6 lg:p-8">
            <h3 className="font-serif text-lg text-charcoal mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee > 0 && subtotal < DELIVERY.freeThreshold && (
                <p className="text-xs text-sage">Add {formatPrice(DELIVERY.freeThreshold - subtotal)} more for free delivery</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-charcoal">
                <span>Total</span>
                <span className="font-serif text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-emerald-deep text-champagne text-center py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors mt-6"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/"
              className="block w-full text-center py-3 eyebrow text-[0.65rem] text-ink-muted hover:text-charcoal transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
