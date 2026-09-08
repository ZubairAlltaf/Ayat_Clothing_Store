'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, CreditCard,
  FolderOpen, Layers, Tag, Star, Users, Image,
  Mail, Settings, ChevronLeft
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
  { label: 'Settings', href: '/asstories/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-charcoal text-champagne flex-col shrink-0">
        <div className="p-6 border-b border-champagne/10">
          <Link href="/asstories" className="font-serif text-xl tracking-wide">AYAT</Link>
          <p className="eyebrow text-[0.5rem] text-champagne/40 mt-0.5">Admin Dashboard</p>
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
