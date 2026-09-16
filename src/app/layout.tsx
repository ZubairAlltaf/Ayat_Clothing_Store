import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/providers/AuthProvider'
import ChatWidget from '@/components/chat/ChatWidget'
import '@/styles/globals.css'
import StoreLayout from '@/components/layout/StoreLayout'
import { SITE } from '@/lib/constants'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ayat Clothing Store | Premium Pakistani Clothing Online',
    template: '%s | Ayat Clothing Store',
  },
  description: 'Shop Ayat Clothing Store for premium Pakistani clothing, elegant suits and curated collections. Discover new arrivals, exclusive styles and nationwide delivery.',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: `${SITE.name} Clothing Store`,
  },
  verification: {
    google: '9JVWI1myoI9NVBbzZrKD9iDBUIlUXejvUD8qvV0XALI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Ayat Clothing Store",
              "url": "https://ayatclothing.store",
              "logo": "https://ayatclothing.store/logo.png",
              "sameAs": [
                "https://instagram.com/ayatclothingstore",
                "https://facebook.com/ayatclothingstore"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+92-300-1234567",
                "contactType": "customer service"
              }
            })
          }}
        />
        <AuthProvider>
          <StoreLayout>
            {children}
          </StoreLayout>
          <ChatWidget />
        </AuthProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
