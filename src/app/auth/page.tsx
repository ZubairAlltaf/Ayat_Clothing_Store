'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

// Simple Google icon SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

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
              
              if (data.user) {
                await supabase.from('profiles').upsert({
                  id: data.user.id,
                  full_name: fullName,
                  phone: phone
                }, { onConflict: 'id' })
              }

              router.push('/')
            } else {
              // Pre-check if user email exists
              const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              })
              const data = await res.json()
              
              if (!res.ok) {
                throw new Error(data.error || 'Failed to verify email.')
              }
              
              if (!data.exists) {
                throw new Error("User doesn't exist.")
              }

              // Proceed to login
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
              })
              
              if (signInError) {
                throw new Error("Invalid login credentials.")
              }
              
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

        <div className="mt-8 pt-8 border-t border-border">
          <button
            onClick={async () => {
              setError(null)
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback` // Or standard redirect
                }
              })
              if (error) setError(error.message)
            }}
            className="w-full bg-white border border-border text-charcoal py-3 text-sm font-medium hover:bg-parchment transition-colors flex items-center justify-center"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
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
