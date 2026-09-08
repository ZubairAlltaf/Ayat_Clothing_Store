'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Heart, Minus, Plus, ShoppingBag, Truck, Shield, MessageCircle, ChevronDown, Star, RotateCcw, Package, Loader2, AlertTriangle } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useToastStore } from '@/stores/toast-store'
import { formatPrice } from '@/lib/utils'
import { DELIVERY, SITE } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  sale_price: number | null
  category_id: string | null
  collection_id: string | null
  gender: string
  fabric: string | null
  product_type: string | null
  description: string | null
  short_description: string | null
  care_instructions: string | null
  product_details: string | null
  stock_quantity: number
  weight: string | null
  is_on_sale: boolean
  is_featured: boolean
  is_new_arrival: boolean
  sku: string | null
  quality_guarantee: string | null
  categories?: { name: string; slug: string } | null
}

interface ProductImage {
  id: string
  image_url: string
  alt_text: string | null
  is_primary: boolean
  position: number
}

interface ProductVariant {
  id: string
  color: string | null
  size: string | null
  stock_quantity: number
  price_adjustment: number
}

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [openSection, setOpenSection] = useState<string | null>('description')
  const addItem = useCartStore((s) => s.addItem)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Fetch product
      const { data: prod, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .single()

      if (error || !prod) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setProduct(prod)

      // Fetch images
      const { data: imgs } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', prod.id)
        .order('position')
      if (imgs) setImages(imgs)

      // Fetch variants
      const { data: vars } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', prod.id)
      if (vars) {
        setVariants(vars)
        // Set first color as default
        const colors = vars.filter(v => v.color).map(v => v.color!)
        if (colors.length > 0) setSelectedColor(colors[0])
      }

      // Fetch related products (same category)
      if (prod.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('id, name, slug, price, sale_price, is_new_arrival, is_on_sale')
          .eq('category_id', prod.category_id)
          .eq('is_active', true)
          .neq('id', prod.id)
          .limit(4)

        if (related && related.length > 0) {
          // Fetch primary image for each related product
          const relatedIds = related.map(r => r.id)
          const { data: relImgs } = await supabase
            .from('product_images')
            .select('product_id, image_url')
            .in('product_id', relatedIds)
            .eq('is_primary', true)

          const imgMap: Record<string, string> = {}
          relImgs?.forEach(img => { imgMap[img.product_id] = img.image_url })

          setRelatedProducts(related.map(r => ({ ...r, image_url: imgMap[r.id] || null })))
        }
      }

      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    const primaryImage = images.find(i => i.is_primary) || images[0]
    addItem({
      productId: product.id,
      name: product.name,
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      image: primaryImage?.image_url || '/images/hero_men.jpg',
      color: selectedColor || undefined,
      size: 'Unstitched',
      quantity,
      slug: product.slug,
    })
    useToastStore.getState().addToast(`${product.name} added to bag!`, 'success')
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color!))]
  const currentPrice = product?.is_on_sale && product?.sale_price ? product.sale_price : product?.price || 0

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-faint" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
        <AlertTriangle size={48} className="text-ink-faint mb-4" strokeWidth={1} />
        <h1 className="font-serif text-2xl text-charcoal mb-2">Product Not Found</h1>
        <p className="text-sm text-ink-muted mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/" className="bg-emerald-deep text-champagne px-8 py-3 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors">
          Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-4">
        <nav className="flex items-center gap-2 text-xs text-ink-muted">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span>/</span>
          {product.categories && (
            <>
              <Link href={`/${product.categories.slug}`} className="hover:text-charcoal transition-colors">{product.categories.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 lg:px-10 pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Left: Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-parchment mb-3 overflow-hidden relative">
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]?.image_url}
                  alt={images[activeImage]?.alt_text || product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-faint">
                  <Package size={48} strokeWidth={1} />
                </div>
              )}
              {images.length > 1 && (
                <span className="absolute bottom-3 left-3 bg-charcoal/70 text-champagne text-xs px-2.5 py-1">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 overflow-hidden relative transition-all ${
                      activeImage === i ? 'ring-2 ring-emerald-deep ring-offset-2' : 'opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img.image_url} alt={img.alt_text || ''} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:py-4">
            {product.categories && (
              <span className="eyebrow text-sage text-[0.6rem] mb-2 block">{product.categories.name}</span>
            )}
            <h1 className="font-serif text-[1.8rem] lg:text-[2.4rem] text-charcoal mb-3">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-xl font-semibold text-charcoal">{formatPrice(currentPrice)}</p>
              {product.is_on_sale && product.sale_price && (
                <p className="text-base text-ink-faint line-through">{formatPrice(product.price)}</p>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-ink-muted leading-relaxed mb-8 max-w-[480px]">{product.short_description}</p>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-charcoal mb-3">
                  Color: <span className="text-ink-muted font-normal">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs border transition-all ${
                        selectedColor === color
                          ? 'border-emerald-deep text-emerald-deep bg-emerald-deep/5'
                          : 'border-border text-ink-muted hover:border-charcoal'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-medium text-charcoal mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-parchment transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-5 text-sm font-medium tabular-nums min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-parchment transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {product.stock_quantity === 0 && (
                <p className="text-xs text-red-600 mt-2">Currently out of stock</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-emerald-deep text-champagne py-4 eyebrow text-[0.7rem] flex items-center justify-center gap-2 hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={16} /> {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button
                className="w-14 border border-border flex items-center justify-center hover:bg-parchment transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 py-6 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-ink-muted">
                <Truck size={16} strokeWidth={1.5} />
                <span>Free delivery on orders over PKR {DELIVERY.freeThreshold.toLocaleString()} — flat PKR {DELIVERY.standardRate} below that</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ink-muted">
                <RotateCcw size={16} strokeWidth={1.5} />
                <span>7-day exchange window on unopened suits</span>
              </div>
              {product.quality_guarantee === 'premium' ? (
                <div className="flex items-start gap-3 p-3 bg-emerald-deep/5 border border-emerald-deep/20 rounded">
                  <Shield size={18} className="text-emerald-deep shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <span className="block text-sm font-medium text-emerald-deep mb-1">Premium Quality Guarantee</span>
                    <span className="block text-xs text-emerald-deep/80 leading-relaxed">
                      This product is backed by our Premium Quality Guarantee. We ensure the highest standard of fabric and craftsmanship. Full refund or exchange if quality expectations are not met.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-ink-muted">
                  <Shield size={16} strokeWidth={1.5} />
                  <span>Premium quality guaranteed — no compromise</span>
                </div>
              )}
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=Hi, I have a question about ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-emerald-deep hover:text-charcoal transition-colors"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                <span>Need help? WhatsApp us</span>
              </a>
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-border">
              {[
                {
                  key: 'description',
                  title: 'Description',
                  content: product.description
                    ? product.description + '\n\n• Actual product colour may look different from the images due to different monitors, screen settings, lighting and photography.'
                    : 'Premium quality fabric selected for elegant drape and lasting comfort.\n\n• Actual product colour may look different from the images due to different monitors, screen settings, lighting and photography.'
                },
                ...(product.product_details ? [{ key: 'details', title: 'Product Details', content: product.product_details }] : []),
                ...(product.fabric ? [{
                  key: 'fabric',
                  title: 'Fabric & Material',
                  content: `Fabric: ${product.fabric}\n${product.weight ? `Weight: ${product.weight}\n` : ''}${product.sku ? `SKU: ${product.sku}\n` : ''}\nOur fabrics are selected for their premium quality, elegant drape and lasting comfort. Every AYAT product goes through rigorous quality checks — no compromise on quality, ever.`
                }] : []),
                {
                  key: 'care',
                  title: 'Wash & Care',
                  content: product.care_instructions || 'Machine wash cold on gentle cycle. Line dry in shade. Iron reverse on medium. Do not bleach. Do not dry in direct sunlight. Premium box packaging included.'
                },
                {
                  key: 'shipping',
                  title: 'Shipping & Returns',
                  content: `Free nationwide delivery on orders over PKR ${DELIVERY.freeThreshold.toLocaleString()} — a flat PKR ${DELIVERY.standardRate} below that. Dispatch in 2–4 working days. 7-day exchange window on unopened suits.\n\nSee our shipping page for full terms.`
                },
              ].map((section) => (
                <div key={section.key} className="border-b border-border">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between py-4 text-sm font-medium text-charcoal"
                  >
                    <span className="eyebrow text-[0.6rem]">{section.title}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${openSection === section.key ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openSection === section.key && (
                    <div className="pb-4 text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Assurance Banner */}
        <div className="mt-16 bg-parchment border border-border p-8 lg:p-12">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <Star size={24} className="mx-auto mb-3 text-gold" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-charcoal mb-1">Premium Quality</h3>
              <p className="text-xs text-ink-muted">Every fabric hand-selected. No compromise on quality, ever.</p>
            </div>
            <div>
              <Truck size={24} className="mx-auto mb-3 text-gold" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-charcoal mb-1">Nationwide Delivery</h3>
              <p className="text-xs text-ink-muted">Free delivery on orders over PKR {DELIVERY.freeThreshold.toLocaleString()}. 2–4 working days.</p>
            </div>
            <div>
              <RotateCcw size={24} className="mx-auto mb-3 text-gold" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-charcoal mb-1">Easy Returns</h3>
              <p className="text-xs text-ink-muted">7-day exchange window on all unopened products.</p>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-[1.6rem] lg:text-[2rem] text-charcoal mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/product/${rp.slug}`} className="group">
                  <div className="aspect-[3/4] bg-parchment overflow-hidden relative mb-3">
                    {rp.image_url ? (
                      <Image
                        src={rp.image_url}
                        alt={rp.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-faint">
                        <Package size={32} strokeWidth={1} />
                      </div>
                    )}
                    {rp.is_new_arrival && (
                      <span className="absolute top-3 left-3 bg-charcoal text-champagne text-[0.55rem] eyebrow px-2.5 py-1">NEW</span>
                    )}
                    {rp.is_on_sale && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[0.55rem] eyebrow px-2.5 py-1">SALE</span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-charcoal group-hover:text-emerald-deep transition-colors truncate">{rp.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-semibold">{formatPrice(rp.sale_price || rp.price)}</span>
                    {rp.sale_price && <span className="text-xs text-ink-faint line-through">{formatPrice(rp.price)}</span>}
                  </div>
                  <span className="inline-block mt-1.5 text-[0.55rem] eyebrow border border-border px-2 py-0.5 text-ink-muted">PREMIUM QUALITY</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Color Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-ink-faint max-w-[500px] mx-auto">
            Actual product colour may vary slightly from images due to different monitors, screen settings, lighting and photography conditions.
          </p>
        </div>
      </div>
    </>
  )
}
