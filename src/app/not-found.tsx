import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="text-center">
        <p className="font-serif text-[6rem] text-ink-faint leading-none mb-4">404</p>
        <h1 className="font-serif text-2xl text-charcoal mb-2">Page Not Found</h1>
        <p className="text-sm text-ink-muted mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex bg-emerald-deep text-champagne px-8 py-3 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
