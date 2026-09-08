'use client'

import Link from 'next/link'
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react'
import { NAV_LINKS, SITE } from '@/lib/constants'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const { getItemCount, openCart } = useCartStore()
  const { openMobileMenu, isMobileMenuOpen, closeMobileMenu, openSearch } = useUIStore()
  const [scrolled, setScrolled] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const [authLink, setAuthLink] = useState('/auth')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthLink(session ? '/profile' : '/auth')
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthLink(session ? '/profile' : '/auth')
    })
    
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    setItemCount(getItemCount())
  }, [getItemCount])

  // Subscribe to cart changes
  useEffect(() => {
    const unsub = useCartStore.subscribe((state) => {
      setItemCount(state.getItemCount())
    })
    return unsub
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-emerald-deep text-champagne text-center py-2.5 px-4">
        <p className="eyebrow tracking-wider text-[0.625rem]">
          Free Delivery on Orders Above PKR 5,000 &nbsp;·&nbsp; Secure Payments via JazzCash & Easypaisa
        </p>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-champagne/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
            : 'bg-champagne'
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-[72px] lg:h-[84px] px-5 lg:px-10">
          {/* Left Nav (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.main.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.8rem] font-medium tracking-[0.06em] uppercase text-charcoal/80 hover:text-charcoal transition-colors link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={openMobileMenu}
            className="lg:hidden p-2 -ml-2"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-serif text-[1.75rem] lg:text-[2.25rem] tracking-[0.04em] text-charcoal leading-none">
              {SITE.name}
            </span>
          </Link>

          {/* Right Nav (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.secondary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.8rem] font-medium tracking-[0.06em] uppercase text-charcoal/80 hover:text-charcoal transition-colors link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-1 lg:gap-3">
            <button
              onClick={openSearch}
              className="p-2.5 hover:bg-charcoal/5 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <Link
              href={authLink}
              className="hidden sm:flex p-2.5 hover:bg-charcoal/5 rounded-full transition-colors"
              aria-label="Account"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>

            <Link
              href="/wishlist"
              className="hidden sm:flex p-2.5 hover:bg-charcoal/5 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} />
            </Link>

            <button
              onClick={openCart}
              className="p-2.5 hover:bg-charcoal/5 rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-deep text-champagne text-[0.6rem] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileMenu}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-champagne overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <span className="font-serif text-xl tracking-[0.04em]">{SITE.name}</span>
              <button onClick={closeMobileMenu} className="p-2" aria-label="Close menu">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="py-4">
              {[...NAV_LINKS.main, ...NAV_LINKS.secondary].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block px-6 py-3.5 text-[0.9rem] font-medium tracking-[0.04em] uppercase text-charcoal/80 hover:text-charcoal hover:bg-parchment transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border mt-4 pt-4">
                <Link
                  href={authLink}
                  onClick={closeMobileMenu}
                  className="block px-6 py-3.5 text-[0.85rem] text-ink-muted hover:text-charcoal"
                >
                  Account
                </Link>
                <Link
                  href="/wishlist"
                  onClick={closeMobileMenu}
                  className="block px-6 py-3.5 text-[0.85rem] text-ink-muted hover:text-charcoal"
                >
                  Wishlist
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="block px-6 py-3.5 text-[0.85rem] text-ink-muted hover:text-charcoal"
                >
                  About AYAT
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="block px-6 py-3.5 text-[0.85rem] text-ink-muted hover:text-charcoal"
                >
                  Contact
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
