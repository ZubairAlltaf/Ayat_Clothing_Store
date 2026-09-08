import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Scissors, Shield, Truck, Clock, Star } from 'lucide-react'
import { FABRICS } from '@/lib/constants'
import { createClient } from '@supabase/supabase-js'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import ScrollReveal from '@/components/ui/ScrollReveal'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  let featuredProducts: any[] = []
  let saleProducts: any[] = []
  let featuredReviews: any[] = []



  try {
    const { data: fProducts, error: fError } = await supabase
      .from('products')
      .select('*, product_images(image_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (fError) throw fError
    if (fProducts) featuredProducts = fProducts

    const { data: sProducts, error: sError } = await supabase
      .from('products')
      .select('*, product_images(image_url)')
      .eq('is_active', true)
      .eq('is_on_sale', true)
      .not('offer_end_time', 'is', null)
      .limit(4)

    if (sError) throw sError
    if (sProducts && sProducts.length > 0) saleProducts = sProducts

    const { data: rData, error: rError } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6)
      
    if (!rError && rData) featuredReviews = rData
  } catch (err) {
    // Silently ignore to prevent Next.js dev overlay from showing errors
  }

  return (
    <>
      {/* 1. EDITORIAL SPLIT HERO SECTION */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col lg:flex-row w-full bg-charcoal overflow-hidden">
        {/* Left: Women's Editorial */}
        <Link href="/women" className="group relative flex-1 min-h-[50vh] lg:min-h-full overflow-hidden block">
          <ScrollReveal animation="zoom-out" className="absolute inset-0 w-full h-full">
            <Image
              src="/images/hero_women.jpg"
              alt="Women's Collection"
              fill
              priority
              className="object-cover object-[50%_30%] transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </ScrollReveal>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent transition-opacity duration-700 group-hover:opacity-80" />
          
          <ScrollReveal animation="fade-up" className="absolute inset-0 flex flex-col items-center justify-end lg:justify-center p-8 lg:p-16 text-center lg:opacity-80 group-hover:opacity-100 transition-all duration-700 lg:translate-y-4 group-hover:translate-y-0">
            <span className="eyebrow text-champagne mb-4 tracking-[0.3em]">The Heritage Collection</span>
            <h2 className="font-serif text-[3rem] lg:text-[4.5rem] text-champagne leading-none mb-6">Women</h2>
            <span className="inline-flex items-center justify-center border border-champagne text-champagne px-8 py-3 text-xs tracking-widest uppercase hover:bg-champagne hover:text-charcoal transition-colors duration-500">
              Explore Edit
            </span>
          </ScrollReveal>
        </Link>

        {/* Right: Men's Editorial */}
        <Link href="/men" className="group relative flex-1 min-h-[50vh] lg:min-h-full overflow-hidden block">
          <ScrollReveal animation="zoom-out" delay={0.2} className="absolute inset-0 w-full h-full">
            <Image
              src="/images/hero_men.jpg"
              alt="Men's Collection"
              fill
              priority
              className="object-cover object-[50%_40%] transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </ScrollReveal>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent transition-opacity duration-700 group-hover:opacity-80" />
          
          <ScrollReveal animation="fade-up" delay={0.2} className="absolute inset-0 flex flex-col items-center justify-end lg:justify-center p-8 lg:p-16 text-center lg:opacity-80 group-hover:opacity-100 transition-all duration-700 lg:translate-y-4 group-hover:translate-y-0">
            <span className="eyebrow text-champagne mb-4 tracking-[0.3em]">The Classic Tailoring</span>
            <h2 className="font-serif text-[3rem] lg:text-[4.5rem] text-champagne leading-none mb-6">Men</h2>
            <span className="inline-flex items-center justify-center border border-champagne text-champagne px-8 py-3 text-xs tracking-widest uppercase hover:bg-champagne hover:text-charcoal transition-colors duration-500">
              Explore Edit
            </span>
          </ScrollReveal>
        </Link>
        
        {/* Center Brand Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden lg:flex flex-col items-center">
           <h1 className="font-serif text-[5rem] xl:text-[7rem] text-white drop-shadow-2xl mix-blend-overlay tracking-tight">AYAT</h1>
        </div>
      </section>

      {/* 2. THE BRAND PHILOSOPHY (Editorial Text) */}
      <section className="py-24 lg:py-32 px-5 bg-parchment relative overflow-hidden">
        <ScrollReveal animation="fade-up" className="max-w-[800px] mx-auto text-center">
          <Sparkles className="mx-auto text-sage mb-8" strokeWidth={1} size={32} />
          <h2 className="font-serif text-[2.5rem] lg:text-[3.5rem] text-charcoal leading-[1.1] mb-8">
            Timeless design, rooted in <span className="text-emerald-deep italic">heritage.</span>
          </h2>
          <p className="text-ink-muted text-base lg:text-lg leading-relaxed max-w-[600px] mx-auto mb-10">
            At AYAT, we believe that true elegance lies in the details. From the finest woven boski to the most delicate chiffon embroideries, every piece is crafted to transcend seasons and trends.
          </p>
          <Link href="/about" className="inline-flex items-center gap-2 text-charcoal eyebrow border-b border-charcoal/30 pb-1 hover:border-charcoal transition-colors">
            Our Story <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
      </section>

      {/* 3. FABRIC FOCUS (Image + Text Asymmetric) */}
      <section className="bg-charcoal text-champagne overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-square lg:aspect-auto h-full min-h-[50vh] overflow-hidden">
            <ScrollReveal animation="parallax" className="absolute inset-0 w-full h-[120%] -top-[10%]">
              <Image
                src="/images/fabric.jpg"
                alt="Premium AYAT Fabrics"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </ScrollReveal>
          </div>
          <ScrollReveal animation="slide-in-right" className="p-10 lg:p-24 xl:p-32 flex flex-col justify-center">
            <span className="eyebrow text-champagne/50 mb-6 block">The Materials</span>
            <h2 className="font-serif text-[2.5rem] lg:text-[3.5rem] leading-[1.1] mb-8">Uncompromising Quality</h2>
            <div className="space-y-8">
              {FABRICS.map((fabric) => (
                <div key={fabric.name} className="border-l border-champagne/20 pl-6">
                  <h3 className="font-serif text-xl mb-2">{fabric.name}</h3>
                  <p className="text-sm text-champagne/60 leading-relaxed max-w-[400px]">
                    {fabric.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. NEW ARRIVALS (Minimalist Grid) */}
      <section className="py-24 lg:py-32 px-5 lg:px-10 max-w-[1800px] mx-auto">
        <ScrollReveal animation="fade-up" className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="eyebrow text-sage mb-4 block">Curated Selection</span>
            <h2 className="font-serif text-[2.5rem] lg:text-[3rem] text-charcoal">Latest Arrivals</h2>
          </div>
          <Link href="/new-arrivals" className="inline-flex items-center gap-2 text-charcoal eyebrow hover:text-emerald-deep transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </ScrollReveal>

        <ScrollReveal animation="stagger-children" className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {featuredProducts?.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="relative aspect-[3/4] mb-5 overflow-hidden bg-parchment">
                <Image
                  src={product.product_images?.[0]?.image_url || product.image_url || '/images/hero_men.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {product.stock_quantity <= 0 && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-widest text-charcoal uppercase shadow-sm z-10">
                    Out of Stock
                  </div>
                )}
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-serif text-lg text-charcoal group-hover:text-emerald-deep transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-ink-faint mt-1 capitalize">{product.gender}</p>
                </div>
                <p className="text-sm text-charcoal shrink-0">PKR {product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {(!featuredProducts || featuredProducts.length === 0) && (
             <p className="col-span-full text-center text-ink-muted py-10">No new arrivals found.</p>
          )}
        </ScrollReveal>
      </section>

      {/* 4.5 LIMITED TIME OFFERS */}
      {saleProducts && saleProducts.length > 0 && (
        <section className="py-24 lg:py-32 px-5 lg:px-10 max-w-[1800px] mx-auto bg-parchment/50">
          <ScrollReveal animation="fade-up" className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="eyebrow text-sage mb-4 flex items-center gap-2"><Clock size={14} /> Flash Sale</span>
              <h2 className="font-serif text-[2.5rem] lg:text-[3rem] text-charcoal">Limited Time Offers</h2>
            </div>
            <Link href="/sale" className="inline-flex items-center gap-2 text-charcoal eyebrow hover:text-emerald-deep transition-colors">
              Shop Sale <ArrowRight size={14} />
            </Link>
          </ScrollReveal>

          <ScrollReveal animation="stagger-children" className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {saleProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group block relative">
                <div className="relative aspect-[3/4] mb-5 overflow-hidden bg-white">
                  <Image
                    src={product.product_images?.[0]?.image_url || product.image_url || '/images/hero_women.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {product.offer_end_time && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[90%] flex justify-center">
                      <CountdownTimer targetDate={product.offer_end_time} />
                    </div>
                  )}
                  {product.stock_quantity <= 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-widest text-charcoal uppercase shadow-sm z-10">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-charcoal group-hover:text-emerald-deep transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-semibold text-emerald-deep">PKR {product.sale_price?.toLocaleString()}</span>
                       <span className="text-xs text-ink-faint line-through">PKR {product.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </ScrollReveal>
        </section>
      )}

      {/* 5. BRAND PROMISES (Icon Grid) */}
      <section className="bg-white py-24 px-5 border-t border-parchment">
        <ScrollReveal animation="stagger-children" className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center text-emerald-deep mb-6">
              <Scissors strokeWidth={1} size={28} />
            </div>
            <h3 className="font-serif text-xl text-charcoal mb-3">Master Craftsmanship</h3>
            <p className="text-sm text-ink-muted max-w-[280px]">Meticulous stitching and finishing by expert tailors to ensure the perfect drape and fit.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center text-emerald-deep mb-6">
              <Shield strokeWidth={1} size={28} />
            </div>
            <h3 className="font-serif text-xl text-charcoal mb-3">Premium Quality</h3>
            <p className="text-sm text-ink-muted max-w-[280px]">Sourcing only the finest authentic fabrics that endure through time and wear.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center text-emerald-deep mb-6">
              <Truck strokeWidth={1} size={28} />
            </div>
            <h3 className="font-serif text-xl text-charcoal mb-3">Nationwide Delivery</h3>
            <p className="text-sm text-ink-muted max-w-[280px]">Secure, tracked shipping across Pakistan with free delivery on premium orders.</p>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. REVIEWS / TESTIMONIALS */}
      {featuredReviews.length > 0 && (
        <section className="bg-charcoal py-24 px-5 overflow-hidden">
          <div className="max-w-[1200px] mx-auto mb-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl text-champagne mb-4">Words of Elegance</h2>
            <p className="text-parchment max-w-[600px] mx-auto text-sm">Hear from our esteemed clientele about their experience with our craftsmanship.</p>
          </div>
          
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredReviews.map((review: any, idx: number) => (
                <div key={review.id} className={`bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors duration-500 flex flex-col justify-between ${idx % 3 === 1 ? 'lg:translate-y-8' : ''}`}>
                  <div>
                    <div className="flex gap-1 mb-6 text-emerald-deep">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                    </div>
                    <p className="text-champagne font-serif text-lg leading-relaxed mb-8 italic">"{review.review_text}"</p>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{review.customer_name || 'Anonymous'}</p>
                      {review.products?.name && (
                        <p className="text-xs text-white/50 mt-1">Purchased {review.products.name}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-deep/20 flex items-center justify-center text-emerald-deep font-serif text-lg">
                      {(review.customer_name || 'A')[0].toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
