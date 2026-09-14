import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import ProductClient from './ProductClient'
import { notFound } from 'next/navigation'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: products } = await supabase.from('products').select('slug').eq('is_active', true)
  
  if (!products) return []
  return products.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, product_images(image_url)')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Product Not Found' }

  const primaryImage = product.product_images?.[0]?.image_url || ''

  return {
    title: `${product.name} | Ayat Clothing Store`,
    description: product.short_description || `Shop ${product.name} at Ayat Clothing Store. Premium Pakistani clothing.`,
    openGraph: {
      images: primaryImage ? [primaryImage] : [],
    }
  }
}

export default async function ProductPageServer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  const { data: product } = await supabase
    .from('products')
    .select('id, name, short_description, description, sku, sale_price, price, stock_quantity, product_images(image_url)')
    .eq('slug', slug)
    .single()

  if (!product) {
    notFound()
  }

  const primaryImage = product.product_images?.[0]?.image_url || ''

  // Product Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": primaryImage,
    "description": product.short_description || product.description || `Buy ${product.name} at Ayat Clothing Store`,
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "Ayat Clothing Store"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://ayatclothing.store/product/${slug}`,
      "priceCurrency": "PKR",
      "price": product.sale_price || product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient />
    </>
  )
}
