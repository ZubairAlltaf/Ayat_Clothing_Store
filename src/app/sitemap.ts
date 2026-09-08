import type { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ayatclothing.com'

  const staticPages = [
    '', '/women', '/men', '/children', '/new-arrivals',
    '/unstitched', '/ready-to-wear', '/sale',
    '/collections', '/about', '/contact',
    '/size-guide', '/shipping', '/returns',
    '/cart', '/wishlist', '/auth', '/track-order',
  ]

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/') && ['women', 'men', 'children'].some(c => route.includes(c)) ? 0.9 : 0.7,
  }))

  try {
    const supabase = await createServerSupabaseClient()
    
    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (categories) {
      categories.forEach((cat) => {
        sitemapEntries.push({
          url: `${baseUrl}/${cat.slug}`,
          lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Fetch active products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (products) {
      products.forEach((prod) => {
        sitemapEntries.push({
          url: `${baseUrl}/product/${prod.slug}`,
          lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        })
      })
    }

  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return sitemapEntries
}
