import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
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
    default: `${SITE.name} — Premium Pakistani Clothing`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
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
        <StoreLayout>
          {children}
        </StoreLayout>
      </body>
    </html>
  )
}
