import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/asstories/', 
          '/api/', 
          '/checkout/', 
          '/account/', 
          '/cart/', 
          '/wishlist/',
          '/auth/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      }
    ],
    sitemap: 'https://ayatclothing.com/sitemap.xml',
  }
}
