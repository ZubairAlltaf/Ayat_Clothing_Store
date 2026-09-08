'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/stores/toast-store'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email })

      if (error) {
        if (error.code === '23505') {
          useToastStore.getState().addToast('You\'re already subscribed!', 'info')
        } else {
          useToastStore.getState().addToast('Could not subscribe. Please try again.', 'error')
        }
      } else {
        useToastStore.getState().addToast('Subscribed successfully! Welcome to the AYAT family.', 'success')
        setEmail('')
      }
    } catch {
      useToastStore.getState().addToast('Something went wrong.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex border-b border-champagne/20 pb-1 mb-8" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="bg-transparent text-sm text-champagne placeholder:text-champagne/30 outline-none flex-grow py-1"
      />
      <button
        type="submit"
        disabled={loading}
        className="eyebrow text-[0.6rem] text-gold hover:text-champagne transition-colors ml-3 shrink-0 disabled:opacity-50"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}
