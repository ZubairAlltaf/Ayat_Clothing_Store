'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, CreditCard,
  FolderOpen, Layers, Tag, Star, Users, Image,
  Mail, Settings, ChevronLeft, Menu, X, MessageCircle
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Dashboard', href: '/asstories', icon: LayoutDashboard },
  { label: 'Products', href: '/asstories/products', icon: Package },
  { label: 'Orders', href: '/asstories/orders', icon: ShoppingCart },
  { label: 'Payments', href: '/asstories/payments', icon: CreditCard },
  { label: 'Categories', href: '/asstories/categories', icon: FolderOpen },
  { label: 'Collections', href: '/asstories/collections', icon: Layers },
  { label: 'Coupons', href: '/asstories/coupons', icon: Tag },
  { label: 'Reviews', href: '/asstories/reviews', icon: Star },
  { label: 'Customers', href: '/asstories/customers', icon: Users },
  { label: 'Hero Banners', href: '/asstories/hero-banners', icon: Image },
  { label: 'Newsletter', href: '/asstories/newsletter', icon: Mail },
  { label: 'Messages', href: '/asstories/messages', icon: MessageCircle },
  { label: 'Settings', href: '/asstories/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-charcoal text-champagne p-4 flex items-center justify-between z-20 border-b border-champagne/10 sticky top-0">
        <div>
          <Link href="/asstories" className="font-serif text-xl tracking-wide">AYAT</Link>
          <p className="eyebrow text-[0.5rem] text-champagne/40 mt-0.5">Admin Dashboard</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-champagne">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex fixed lg:sticky top-0 h-screen z-40 w-[260px] bg-charcoal text-champagne flex-col shrink-0`}>
        <div className="p-6 border-b border-champagne/10 flex justify-between items-center">
          <div>
            <Link href="/asstories" className="font-serif text-xl tracking-wide">AYAT</Link>
            <p className="eyebrow text-[0.5rem] text-champagne/40 mt-0.5">Admin Dashboard</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 text-champagne">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/asstories' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-6 py-2.5 text-[0.8rem] transition-colors ${
                  isActive
                    ? 'bg-champagne/10 text-champagne font-medium'
                    : 'text-champagne/50 hover:text-champagne hover:bg-champagne/5'
                }`}
              >
                <link.icon size={16} strokeWidth={1.5} />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-6 border-t border-champagne/10">
          <Link href="/" className="flex items-center gap-2 text-xs text-champagne/40 hover:text-champagne transition-colors">
            <ChevronLeft size={14} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
