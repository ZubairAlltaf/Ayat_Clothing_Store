'use client'

import Link from 'next/link'
import { Heart, ShoppingBag, ArrowRight, X } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-10 lg:py-16">
      <h1 className="font-serif text-[2rem] lg:text-[2.5rem] text-charcoal mb-10">Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} strokeWidth={1} className="text-ink-faint mx-auto mb-4" />
          <p className="font-serif text-xl text-ink-light mb-2">Your wishlist is empty</p>
          <p className="text-sm text-ink-muted mb-8">Save your favorite pieces for later</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-8 py-3 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors"
          >
            Explore Collections <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {items.map((item) => (
            <div key={item.productId} className="group relative">
              <button
                onClick={() => removeItem(item.productId)}
                className="absolute top-3 right-3 z-10 p-1.5 bg-champagne/80 text-ink-muted hover:text-charcoal transition-colors"
                aria-label="Remove from wishlist"
              >
                <X size={14} />
              </button>

              <Link href={`/product/${item.slug}`}>
                <div className="aspect-[3/4] bg-parchment mb-4" />
                <h3 className="text-[0.85rem] font-medium text-charcoal mb-1 group-hover:text-emerald-deep transition-colors">{item.name}</h3>
                <p className="text-sm font-semibold text-charcoal mb-3">
                  {item.salePrice ? (
                    <>
                      <span className="text-[#8B4513]">{formatPrice(item.salePrice)}</span>
                      <span className="text-xs text-ink-faint line-through ml-2">{formatPrice(item.price)}</span>
                    </>
                  ) : (
                    formatPrice(item.price)
                  )}
                </p>
              </Link>

              <button
                onClick={() =>
                  addToCart({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    salePrice: item.salePrice,
                    image: item.image,
                    slug: item.slug,
                    quantity: 1,
                  })
                }
                className="w-full border border-border py-2.5 eyebrow text-[0.6rem] flex items-center justify-center gap-2 text-ink-muted hover:bg-emerald-deep hover:text-champagne hover:border-emerald-deep transition-all"
              >
                <ShoppingBag size={13} /> Add to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
