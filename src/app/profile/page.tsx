'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User, Mail, Phone, MapPin, Building2, Package, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      setUser({
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || '',
        phone: session.user.user_metadata?.phone || '',
        address: session.user.user_metadata?.address || '',
        city: session.user.user_metadata?.city || '',
      })

      // Fetch user's orders based on email (since guests might use email too)
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_email', session.user.email)
        .order('created_at', { ascending: false })
      
      if (orderData) {
        setOrders(orderData)
      }

      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: user.full_name,
          phone: user.phone,
          address: user.address,
          city: user.city,
        }
      })

      if (error) throw error

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await supabase.from('profiles').update({
          full_name: user.full_name,
          phone: user.phone
        }).eq('id', authUser.id)
      }

      setMessage({ text: 'Profile updated successfully.', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-deep" /></div>
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-5 border-b border-border">
        <div>
          <h1 className="font-serif text-[2.5rem] text-charcoal">My Account</h1>
          <p className="text-sm text-ink-muted mt-2">Welcome back, {user?.full_name || 'Customer'}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="mt-4 md:mt-0 text-sm font-medium text-emerald-deep hover:text-charcoal transition-colors underline"
        >
          Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        {/* Left: Orders */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-6 flex items-center gap-2">
            <Package size={20} className="text-emerald-deep" /> Order History
          </h2>

          {orders.length === 0 ? (
            <div className="bg-parchment p-8 text-center border border-border">
              <p className="text-sm text-ink-muted mb-4">You haven't placed any orders yet.</p>
              <Link href="/" className="inline-flex items-center gap-2 text-emerald-deep hover:text-charcoal text-sm font-medium transition-colors">
                Start Shopping <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-border p-6 hover:shadow-sm transition-shadow bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-sm text-ink-muted">Order <span className="font-medium text-charcoal">#{order.order_number}</span></p>
                      <p className="text-xs text-ink-faint mt-1 flex items-center gap-1">
                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-charcoal">{formatPrice(order.total_amount)}</p>
                      <span className="inline-block mt-1 text-[0.65rem] uppercase tracking-wider px-2 py-1 bg-parchment text-emerald-deep font-medium rounded-full">
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                          <span className="text-ink-muted">{item.quantity}x</span>
                          <div>
                            <p className="text-charcoal font-medium">{item.product_name}</p>
                            {item.variant_info && <p className="text-xs text-ink-faint mt-0.5">{item.variant_info}</p>}
                          </div>
                        </div>
                        <span className="text-ink-muted">{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Profile Details */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-6 flex items-center gap-2">
            <User size={20} className="text-emerald-deep" /> Profile Details
          </h2>

          <div className="bg-parchment border border-border p-6 lg:p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {message && (
                <div className={`text-sm p-3 border mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">Email (Cannot be changed)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-ink-faint" />
                  </div>
                  <input
                    disabled
                    type="email"
                    value={user?.email || ''}
                    className="w-full border border-border bg-black/5 pl-10 pr-3 py-2.5 text-sm text-ink-faint cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-ink-faint" />
                  </div>
                  <input
                    required
                    type="text"
                    value={user?.full_name || ''}
                    onChange={e => setUser({...user, full_name: e.target.value})}
                    className="w-full border border-border bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-ink-faint" />
                  </div>
                  <input
                    required
                    type="tel"
                    value={user?.phone || ''}
                    onChange={e => setUser({...user, phone: e.target.value})}
                    className="w-full border border-border bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-ink-faint" />
                  </div>
                  <input
                    type="text"
                    value={user?.address || ''}
                    onChange={e => setUser({...user, address: e.target.value})}
                    className="w-full border border-border bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5 uppercase tracking-wider">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-ink-faint" />
                  </div>
                  <input
                    type="text"
                    value={user?.city || ''}
                    onChange={e => setUser({...user, city: e.target.value})}
                    className="w-full border border-border bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-deep transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-charcoal text-champagne py-3 eyebrow text-[0.65rem] hover:bg-emerald-deep transition-colors flex items-center justify-center disabled:opacity-70 mt-4"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
