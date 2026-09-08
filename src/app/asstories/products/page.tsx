'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  sale_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_on_sale: boolean
  gender: string
  fabric: string
  created_at: string
  product_images: { image_url: string; is_primary: boolean }[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(image_url, is_primary)')
      .order('created_at', { ascending: false })

    if (!error && data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This will soft-delete it (mark as inactive).')) return
    setDeleting(id)
    await supabase.from('products').update({ is_active: false }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p))
    setDeleting(null)
  }

  const hardDelete = async (id: string) => {
    if (!confirm('⚠️ PERMANENTLY delete this product and all its images? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('product_images').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    (p.fabric || '').toLowerCase().includes(search.toLowerCase())
  )

  const getImage = (p: Product) => {
    const primary = p.product_images?.find(i => i.is_primary)
    return primary?.image_url || p.product_images?.[0]?.image_url || ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Products</h1>
          <p className="text-sm text-ink-muted mt-1">Manage your product catalog ({products.length} total)</p>
        </div>
        <Link
          href="/asstories/products/new"
          className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-5 py-2.5 text-sm hover:bg-charcoal transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-border p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search products by name, slug, fabric..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border outline-none focus:border-emerald-deep"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-ink-faint" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <p className="mb-2">{search ? 'No products match your search' : 'No products yet'}</p>
            {!search && (
              <Link href="/asstories/products/new" className="text-emerald-deep text-xs hover:underline">
                Add your first product →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-parchment/50">
                  <th className="text-left py-3 px-4 font-semibold text-charcoal text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-charcoal text-xs uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-charcoal text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-charcoal text-xs uppercase tracking-wider">Flags</th>
                  <th className="text-left py-3 px-4 font-semibold text-charcoal text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-charcoal text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-parchment/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-parchment shrink-0 relative overflow-hidden">
                          {getImage(product) && (
                            <Image src={getImage(product)} alt={product.name} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal line-clamp-1">{product.name}</p>
                          <p className="text-xs text-ink-faint">{product.gender} · {product.fabric || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">PKR {Number(product.price).toLocaleString()}</p>
                      {product.sale_price && (
                        <p className="text-xs text-red-600">Sale: PKR {Number(product.sale_price).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${product.stock_quantity <= 0 ? 'text-red-600' : product.stock_quantity <= 5 ? 'text-orange-600' : 'text-charcoal'}`}>
                        {product.stock_quantity <= 0 ? 'Out of Stock' : product.stock_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.is_featured && <span className="text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Featured</span>}
                        {product.is_new_arrival && <span className="text-[0.6rem] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">New</span>}
                        {product.is_on_sale && <span className="text-[0.6rem] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Sale</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleActive(product.id, product.is_active)}
                        className={`inline-flex items-center gap-1.5 text-[0.65rem] px-2.5 py-1 rounded-full font-medium transition-colors ${
                          product.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {product.is_active ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Inactive</>}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/asstories/products/${product.id}/edit`}
                          className="p-2 text-ink-muted hover:text-emerald-deep hover:bg-emerald-deep/5 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-ink-muted hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                          title="Soft Delete (Hide)"
                        >
                          <EyeOff size={14} />
                        </button>
                        <button
                          onClick={() => hardDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Permanently Delete"
                        >
                          {deleting === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
