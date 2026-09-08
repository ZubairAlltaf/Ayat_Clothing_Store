import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Sparkles } from 'lucide-react'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore all AYAT clothing collections — from festive edits to everyday essentials.',
}

const BG_COLORS = [
  'bg-emerald-deep/90', 'bg-[#3A2F2B]', 'bg-[#2B3A35]',
  'bg-[#35302B]', 'bg-[#2A3530]', 'bg-[#302B25]',
  'bg-[#2B2B3A]', 'bg-[#3A352B]',
]

export default async function CollectionsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  const hasCollections = collections && collections.length > 0

  return (
    <div className="max-w-[1600px] mx-auto px-5 lg:px-10 py-16 lg:py-24">
      <div className="mb-14">
        <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Browse</span>
        <h1 className="font-serif text-[2.4rem] lg:text-[3.5rem] text-charcoal">Collections</h1>
      </div>

      {hasCollections ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {collections.map((col, i) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative aspect-[4/5] overflow-hidden"
            >
              {col.image_url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${col.image_url})` }}
                />
              ) : (
                <div className={`absolute inset-0 ${BG_COLORS[i % BG_COLORS.length]} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20">
                <h2 className="font-serif text-champagne text-xl lg:text-2xl mb-2">{col.name}</h2>
                {col.description && (
                  <p className="text-champagne/50 text-sm mb-3 line-clamp-2">{col.description}</p>
                )}
                <span className="eyebrow text-[0.55rem] text-champagne/60 group-hover:text-champagne transition-colors">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Coming Soon State */
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-parchment mb-8">
            <Sparkles size={32} className="text-sage" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-[1.8rem] lg:text-[2.2rem] text-charcoal mb-4">
            Collections Coming Soon
          </h2>
          <p className="text-sm text-ink-muted max-w-[480px] mx-auto leading-relaxed mb-10">
            We're curating exclusive collections to bring you the finest Pakistani fabrics and designs.
            Stay tuned — our first collections will drop soon.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-emerald-deep text-champagne px-8 py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors"
            >
              Shop All Products
            </Link>
            <Link
              href="/new-arrivals"
              className="border border-border px-8 py-3.5 eyebrow text-[0.7rem] text-charcoal hover:bg-parchment transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
