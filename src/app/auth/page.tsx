'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push('/')
      }
    })
  }, [router, supabase.auth])

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl text-charcoal tracking-[0.04em]">{SITE.name}</Link>
          <p className="text-sm text-ink-muted mt-3">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 pb-3 eyebrow text-[0.65rem] border-b-2 transition-colors ${
              mode === 'signin' ? 'border-emerald-deep text-emerald-deep' : 'border-transparent text-ink-faint'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 pb-3 eyebrow text-[0.65rem] border-b-2 transition-colors ${
              mode === 'signup' ? 'border-emerald-deep text-emerald-deep' : 'border-transparent text-ink-faint'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault()
          setError(null)
          setLoading(true)
          
          const formData = new FormData(e.currentTarget)
          const email = formData.get('email') as string
          const password = formData.get('password') as string
          const fullName = formData.get('fullName') as string
          const phone = formData.get('phone') as string
          
          if (mode === 'signup' && email && !email.toLowerCase().endsWith('@gmail.com')) {
            setError('Currently, only @gmail.com addresses are allowed for signup.')
            setLoading(false)
            return
          }
          
          try {
            if (mode === 'signup') {
              const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: {
                    full_name: fullName,
                    phone: phone,
                  }
                }
              })
              if (signUpError) throw signUpError
              router.push('/')
            } else {
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
              })
              if (signInError) throw signInError
              
              router.push('/')
            }
          } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.')
          } finally {
            setLoading(false)
          }
        }}>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 border border-red-100">
              {error}
            </div>
          )}
          {mode === 'signup' && (
            <>
              <AuthInput name="fullName" icon={User} label="Full Name" type="text" placeholder="Your full name" />
              <AuthInput name="phone" icon={Phone} label="Phone / WhatsApp" type="tel" placeholder="03XX XXXXXXX" />
            </>
          )}
          <AuthInput name="email" icon={Mail} label="Email" type="email" placeholder="your@email.com" />
          <AuthInput name="password" icon={Lock} label="Password" type="password" placeholder="••••••••" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-deep text-champagne py-3.5 eyebrow text-[0.7rem] hover:bg-charcoal transition-colors mt-6 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {mode === 'signin' && (
          <p className="text-center mt-6">
            <button className="text-xs text-ink-muted hover:text-charcoal underline transition-colors">
              Forgot password?
            </button>
          </p>
        )}

        <p className="text-center text-xs text-ink-faint mt-8">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-emerald-deep hover:text-charcoal transition-colors underline"
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function AuthInput({
  icon: Icon,
  label,
  type,
  placeholder,
  name,
}: {
  icon: React.ElementType
  label: string
  type: string
  placeholder: string
  name: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" strokeWidth={1.5} />
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required
          className="w-full border border-border bg-champagne pl-11 pr-4 py-3 text-sm text-charcoal placeholder:text-ink-faint outline-none focus:border-emerald-deep transition-colors"
        />
      </div>
    </div>
  )
}
