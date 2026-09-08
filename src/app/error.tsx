'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Captured Global Error:', error)
  }, [error])

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-5 text-center bg-parchment">
      <div className="bg-white p-8 md:p-12 border border-border max-w-md w-full shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={32} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl text-charcoal mb-4">Something went wrong</h1>
        <p className="text-ink-muted mb-8 text-sm leading-relaxed">
          We apologize for the inconvenience. Our automated security protocols have caught an unexpected issue. Your data is perfectly safe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 font-medium hover:bg-emerald-deep transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 border border-border bg-white text-charcoal px-6 py-3 font-medium hover:border-emerald-deep transition-colors text-sm w-full sm:w-auto justify-center"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
