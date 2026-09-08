'use client'

import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore, type CartItem } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[300] transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-champagne z-[301] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <h2 className="font-serif text-lg tracking-wide">Your Bag</h2>
            <span className="text-xs text-ink-muted">({items.length})</span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-charcoal/5 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} strokeWidth={1} className="text-ink-faint mb-4" />
              <p className="font-serif text-lg text-ink-light mb-1">Your bag is empty</p>
              <p className="text-sm text-ink-muted mb-6">Discover our curated collections</p>
              <button
                onClick={closeCart}
                className="eyebrow text-xs bg-emerald-deep text-champagne px-8 py-3 hover:bg-charcoal transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onUpdateQty={(qty) => updateQuantity(item.id, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium uppercase tracking-wider">Subtotal</span>
              <span className="font-serif text-lg">{formatPrice(getSubtotal())}</span>
            </div>
            <p className="text-xs text-ink-muted">Delivery calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-emerald-deep text-champagne text-center py-3.5 eyebrow text-xs hover:bg-charcoal transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center py-2.5 eyebrow text-xs text-ink-muted hover:text-charcoal transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem
  onRemove: () => void
  onUpdateQty: (qty: number) => void
}) {
  const effectivePrice = item.salePrice ?? item.price

  return (
    <div className="flex gap-4">
      {/* Image */}
      <div className="relative w-[80px] h-[100px] bg-parchment shrink-0 overflow-hidden">
        <Image
          src={item.image || '/images/hero_men.jpg'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/product/${item.slug}`}
              className="text-sm font-medium text-charcoal leading-tight line-clamp-2 hover:underline"
            >
              {item.name}
            </Link>
            {(item.color || item.size) && (
              <p className="text-xs text-ink-muted mt-1">
                {[item.color, item.size].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="p-1 text-ink-faint hover:text-charcoal transition-colors shrink-0"
            aria-label="Remove item"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-end justify-between mt-3">
          {/* Quantity */}
          <div className="flex items-center border border-border">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="p-1.5 hover:bg-parchment transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 text-xs font-medium tabular-nums">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="p-1.5 hover:bg-parchment transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <p className="text-sm font-medium">{formatPrice(effectivePrice * item.quantity)}</p>
        </div>
      </div>
    </div>
  )
}
