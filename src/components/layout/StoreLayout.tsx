'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import ToastContainer from '@/components/ui/ToastContainer'

import SmoothScroll from '@/components/layout/SmoothScroll'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Do not render storefront layout for admin routes
  if (pathname?.startsWith('/asstories')) {
    return <>
      {children}
      <ToastContainer />
    </>
  }

  return (
    <SmoothScroll>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer />
    </SmoothScroll>
  )
}
