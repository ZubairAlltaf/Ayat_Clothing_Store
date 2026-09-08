import { SITE } from '@/lib/constants'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind AYAT — premium Pakistani clothing crafted with tradition and elegance.',
}

export default async function AboutPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'about_image_url').single()
  const imageUrl = data?.value || '/images/hero_women.jpg'

  return (
    <>
      {/* Hero */}
      <section className="bg-emerald-deep text-champagne py-24 lg:py-32 px-5 lg:px-10">
        <div className="max-w-[800px] mx-auto text-center">
          <span className="eyebrow text-gold text-[0.6rem] tracking-[0.3em] mb-5 block">Our Story</span>
          <h1 className="font-serif text-[2.5rem] lg:text-[4rem] leading-[1.05] mb-6">
            Rooted in Tradition,{' '}
            <span className="italic">Designed for Today</span>
          </h1>
          <p className="text-champagne/60 leading-relaxed max-w-[560px] mx-auto">
            {SITE.name} was born from a deep love for Pakistani craftsmanship — the textures, the colors, the stories woven into every thread.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 lg:py-28 px-5 lg:px-10">
        <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-[3/4] bg-parchment">
            <Image src={imageUrl} alt="AYAT Heritage" fill className="object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-[1.6rem] lg:text-[2rem] text-charcoal mb-6">The Heritage</h2>
            <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
              <p>
                AYAT is more than a clothing brand — it&apos;s a feeling. A blend of heritage and modernity, crafted for women and men who carry grace in every step.
              </p>
              <p>
                Every piece carries the story of Pakistani craftsmanship — from the hand-finished embroidery to the carefully selected fabrics that drape beautifully and last through seasons.
              </p>
              <p>
                We believe clothing should honour where you come from while moving with you into the future. That&apos;s why every AYAT piece is designed to feel timeless — never trendy, never disposable, always yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-parchment py-20 lg:py-28 px-5 lg:px-10">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-[1.8rem] lg:text-[2.4rem] text-charcoal text-center mb-14">What We Stand For</h2>
          <div className="grid sm:grid-cols-3 gap-10 lg:gap-16">
            {[
              { title: 'Quality Over Quantity', text: 'We select every fabric personally, testing for feel, weight, drape and durability before it becomes part of any collection.' },
              { title: 'Honest Craftsmanship', text: 'No shortcuts. Every stitch, every finish, every embroidery detail receives the attention it deserves.' },
              { title: 'Accessible Elegance', text: 'Premium doesn\'t have to mean exclusive. AYAT brings sophisticated design to everyday wardrobes across Pakistan.' },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="font-serif text-lg text-charcoal mb-3">{v.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
