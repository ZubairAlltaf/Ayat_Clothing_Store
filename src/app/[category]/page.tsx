import Link from 'next/link'
import { Heart, ShoppingBag, ArrowRight, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

export const revalidate = 60

// Fallbacks for special built-in routes if not defined in the database
const SPECIAL_ROUTES: Record<string, { title: string; description: string; eyebrow: string }> = {
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'The latest additions to the AYAT collection — fresh styles that embody our commitment to quality and tradition.',
    eyebrow: 'Just In',
  },
  sale: {
    title: 'Sale',
    description: 'Selected pieces at special prices — the same AYAT quality, exceptional value.',
    eyebrow: 'Limited Time',
  },
  women: { title: "Women's Couture", description: 'Curated ensembles.', eyebrow: "Women's" },
  men: { title: "Men's Heritage", description: 'Timeless fabrics.', eyebrow: "Men's" },
  children: { title: "Children's", description: 'Comfortable outfits.', eyebrow: "Children's" },
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data } = await supabaseServer.from('categories').select('name, description').eq('slug', category).single()
  
  if (data) {
    return { title: data.name, description: data.description }
  }
  
  const special = SPECIAL_ROUTES[category]
  if (special) {
    return { title: special.title, description: special.description }
  }

  return { title: 'Shop' }
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { category } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let meta = SPECIAL_ROUTES[category]
  let categoryId = null

  // Try fetching dynamic category from DB
  const { data: dbCategory } = await supabase.from('categories').select('id, name, description').eq('slug', category).single()

  if (dbCategory) {
    meta = {
      title: dbCategory.name,
      description: dbCategory.description || '',
      eyebrow: 'Collection'
    }
    categoryId = dbCategory.id
  } else if (!meta) {
    // Not in DB and not a special route
    notFound()
  }

  const MOCK_PRODUCTS = [
    { id: '1', name: 'Serene Bloom', slug: 'serene-bloom', fabric: 'Lawn', product_type: '3 Piece', price: 4500, gender: 'women', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
    { id: '2', name: 'Noor-e-Aab', slug: 'noor-e-aab', fabric: 'Chiffon', product_type: '3 Piece', price: 8750, sale_price: 7875, gender: 'women', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
    { id: '3', name: 'Zarafshan', slug: 'zarafshan', fabric: 'Organza', product_type: '3 Piece', price: 12990, gender: 'women', image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
    { id: '4', name: 'Tashreeh', slug: 'tashreeh', fabric: 'Lawn', product_type: '3 Piece', price: 3590, gender: 'women', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
    { id: '5', name: 'Heritage Boski', slug: 'heritage-boski', fabric: 'Boski', product_type: 'Suit Length', price: 6200, gender: 'men', is_best_seller: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
    { id: '6', name: 'Master Plan', slug: 'master-plan', fabric: 'Wash & Wear', product_type: 'Suit Length', price: 5500, gender: 'men', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
    { id: '7', name: 'Eagle Cotton Premium', slug: 'eagle-cotton', fabric: 'Cotton', product_type: 'Suit Length', price: 4800, gender: 'men', image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
    { id: '8', name: 'Little Star Kurta', slug: 'little-star', fabric: 'Cotton', product_type: '2 Piece', price: 2800, gender: 'children', image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
    { id: '9', name: 'Mini Heritage Set', slug: 'mini-heritage', fabric: 'Lawn', product_type: '3 Piece', price: 3200, gender: 'children', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
  ]
  
  let products: any[] = []
  
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    let query = supabaseClient.from('products').select('*, product_images(image_url)').eq('is_active', true)
    
    if (category === 'new-arrivals') {
      query = query.eq('is_new_arrival', true)
    } else if (category === 'sale') {
      query = query.eq('is_on_sale', true)
    } else if (categoryId) {
      // Dynamic database category
      query = query.eq('category_id', categoryId)
    } else if (['women', 'men', 'children'].includes(category)) {
      query = query.eq('gender', category)
    }
    
    const { data } = await query
    if (data && data.length > 0) products = data
  } catch (err) {
    console.error('Supabase Error in Category:', err)
  }

  // Fallback to mock data
  if (products.length === 0) {
    products = category === 'new-arrivals'
      ? MOCK_PRODUCTS.filter((p) => p.is_new_arrival)
      : category === 'sale'
        ? MOCK_PRODUCTS.filter((p) => p.sale_price)
        : MOCK_PRODUCTS.filter((p) => p.gender === category || !['women', 'men', 'children'].includes(category))
  }

  return (
    <>
      {/* Category Header */}
      <section className="bg-parchment py-14 lg:py-20 px-5 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <span className="eyebrow text-sage text-[0.6rem] mb-3 block">{meta.eyebrow}</span>
          <h1 className="font-serif text-[2.4rem] lg:text-[3.5rem] text-charcoal mb-4">{meta.title}</h1>
          <p className="text-sm text-ink-muted max-w-[560px] leading-relaxed">{meta.description}</p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 lg:py-16 px-5 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <p className="text-sm text-ink-muted">{products.length} products</p>
            <select className="text-sm text-charcoal bg-transparent border border-border px-3 py-2 outline-none focus:border-emerald-deep">
              <option>Featured</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className="group"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-parchment mb-4 overflow-hidden">
                  <Image 
                    src={product.product_images?.[0]?.image_url || product.image_url || '/images/fabric.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {product.is_new_arrival && (
                    <span className="absolute top-3 left-3 z-10 bg-champagne/90 text-charcoal px-2.5 py-1 text-[0.55rem] font-semibold tracking-[0.12em] uppercase">
                      New
                    </span>
                  )}
                  {product.sale_price && (
                    <span className="absolute top-3 left-3 z-10 bg-[#8B4513] text-champagne px-2.5 py-1 text-[0.55rem] font-semibold tracking-[0.12em] uppercase">
                      Sale
                    </span>
                  )}
                  <button
                    className="absolute top-3 right-3 z-10 p-2 text-ink-faint hover:text-charcoal transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart size={16} strokeWidth={1.5} />
                  </button>

                  {/* Quick add on hover */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      className="w-full bg-charcoal/90 text-champagne py-3 eyebrow text-[0.6rem] flex items-center justify-center gap-2 hover:bg-emerald-deep transition-colors"
                    >
                      <ShoppingBag size={13} /> Quick Add
                    </button>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-[0.85rem] font-medium text-charcoal mb-0.5 group-hover:text-emerald-deep transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-ink-muted mb-1.5 capitalize">
                  {product.product_type} · {product.fabric}
                </p>
                <div className="flex items-center gap-2">
                  {product.sale_price ? (
                    <>
                      <span className="text-sm font-semibold text-[#8B4513]">
                        PKR {product.sale_price.toLocaleString()}
                      </span>
                      <span className="text-xs text-ink-faint line-through">
                        PKR {product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-charcoal">
                      PKR {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-ink-light mb-2">No products found</p>
              <p className="text-sm text-ink-muted mb-6">Try browsing a different collection</p>
              <Link href="/" className="inline-flex items-center gap-2 eyebrow text-xs text-emerald-deep hover:text-charcoal transition-colors">
                Back to Home <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
