'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Phone, MapPin, Building2, Map } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
      } else if (session.user.user_metadata?.phone) {
        router.push('/')
      } else {
        setVerifying(false)
      }
    })
  }, [router, supabase.auth])

  if (verifying) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-deep" /></div>
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-charcoal tracking-[0.04em]">Complete Profile</h1>
          <p className="text-sm text-ink-muted mt-3">
            Please provide a few more details to complete your account.
          </p>
        </div>

        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setLoading(true)
          
          const formData = new FormData(e.currentTarget)
          const phone = formData.get('phone') as string
          const address = formData.get('address') as string
          const city = formData.get('city') as string
          
          try {
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                phone,
                address,
                city
              }
            })

            if (updateError) throw updateError

            // Also update the profiles table if necessary
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await supabase.from('profiles').update({
                phone: phone
              }).eq('id', user.id)
            }

            router.push('/')
            router.refresh()
          } catch (err: any) {
            setError(err.message || 'An error occurred while updating your profile.')
          } finally {
            setLoading(false)
          }
        }}>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 border border-red-100 mb-4">
              {error}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={16} className="text-ink-faint" />
            </div>
            <input
              required
              name="phone"
              type="tel"
              placeholder="Phone Number *"
              className="w-full border border-border bg-transparent pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={16} className="text-ink-faint" />
            </div>
            <input
              required
              name="address"
              type="text"
              placeholder="Complete Address *"
              className="w-full border border-border bg-transparent pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 size={16} className="text-ink-faint" />
            </div>
            <input
              required
              name="city"
              type="text"
              placeholder="City *"
              className="w-full border border-border bg-transparent pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-deep text-champagne py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors mt-6 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}
