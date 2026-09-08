import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    title: `${name} Collection`,
    description: `Explore the ${name} collection from AYAT Clothing Store.`,
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <>
      <section className="bg-emerald-deep text-champagne py-16 lg:py-24 px-5 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex items-center gap-2 text-xs text-champagne/40 mb-6">
            <Link href="/" className="hover:text-champagne transition-colors">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-champagne transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-champagne/70">{name}</span>
          </nav>
          <h1 className="font-serif text-[2.4rem] lg:text-[3.5rem]">{name}</h1>
          <p className="text-champagne/50 text-sm mt-3 max-w-[480px]">
            A carefully curated selection from our {name.toLowerCase()} collection.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20 px-5 lg:px-10">
        <div className="max-w-[1600px] mx-auto text-center py-20">
          <p className="font-serif text-xl text-ink-light mb-2">Products coming soon</p>
          <p className="text-sm text-ink-muted mb-6">This collection will be populated with products from Supabase.</p>
          <Link href="/" className="eyebrow text-xs text-emerald-deep hover:text-charcoal transition-colors">
            ← Back to Home
          </Link>
        </div>
      </section>
    </>
  )
}
