'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  salePrice?: number
  image: string
  color?: string
  size?: string
  quantity: number
  slug: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (item) => {
        const items = get().items
        const key = `${item.productId}-${item.color || ''}-${item.size || ''}`
        const existing = items.find(
          (i) => `${i.productId}-${i.color || ''}-${i.size || ''}` === key
        )

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
            isOpen: true,
          })
        } else {
          set({
            items: [...items, { ...item, id: key }],
            isOpen: true,
          })
        }
      },

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity,
          0
        ),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'ayat-cart' }
  )
)
