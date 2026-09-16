'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'
import { createClient } from '@/lib/supabase/client'

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isSearchOpen])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async (searchTerm: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, sale_price, product_images(image_url)')
      .ilike('name', `%${searchTerm}%`)
      .limit(6)

    if (!error && data) {
      setResults(data)
    }
    setLoading(false)
  }

  const handleClose = () => {
    closeSearch()
  }

  if (!isSearchOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-md animate-fade-in">
      <div className="flex items-center justify-between p-6 md:px-12 border-b border-border">
        <div className="flex items-center gap-4 flex-1 max-w-4xl mx-auto">
          <Search className="text-ink-muted" size={24} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products, categories, or collections..."
            className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-serif text-charcoal placeholder:text-ink-faint"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleClose} className="p-2 hover:bg-parchment rounded-full transition-colors">
            <X size={28} className="text-charcoal" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Searching for {query}...</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-ink-muted mb-6">
                Search Results ({results.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {results.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug}`}
                    onClick={handleClose}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] bg-parchment mb-4 overflow-hidden">
                      {product.product_images?.[0]?.image_url ? (
                        <Image
                          src={product.product_images[0].image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-faint">
                          No Image
                        </div>
                      )}
                    </div>
                    <h4 className="font-serif text-charcoal text-sm md:text-base mb-1 line-clamp-1 group-hover:text-emerald-deep transition-colors">
                      {product.name}
                    </h4>
                    <div className="text-sm">
                      {product.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-deep font-semibold">PKR {product.sale_price}</span>
                          <span className="text-ink-muted line-through text-xs">PKR {product.price}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal font-medium">PKR {product.price}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : query.trim().length > 1 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="text-ink-faint mb-4" size={48} />
              <h3 className="font-serif text-2xl text-charcoal mb-2">No results found</h3>
              <p className="text-ink-muted">We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.</p>
            </div>
          ) : (
            <div className="py-10">
              <h3 className="text-sm font-bold tracking-widest uppercase text-ink-muted mb-6">Popular Categories</h3>
              <div className="flex flex-wrap gap-4">
                {['Men', 'Women', 'Children', 'Unisex'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/${cat.toLowerCase()}`}
                    onClick={handleClose}
                    className="px-6 py-3 border border-border rounded-full text-sm font-medium text-charcoal hover:border-emerald-deep hover:text-emerald-deep transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
