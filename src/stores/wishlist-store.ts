'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  price: number
  salePrice?: number
  image: string
  slug: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInWishlist(item.productId)) {
          set((s) => ({ items: [...s.items, item] }))
        }
      },

      removeItem: (productId) =>
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        })),

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'ayat-wishlist' }
  )
)
