'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Eye, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

const ORDER_STATUSES = [
  'pending', 'payment_pending', 'payment_verified', 'confirmed',
  'processing', 'packed', 'shipped', 'out_for_delivery',
  'delivered', 'cancelled', 'return_requested', 'returned'
]

const PAYMENT_STATUSES = ['pending', 'verified', 'rejected']

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  payment_pending: 'bg-orange-100 text-orange-800',
  payment_verified: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-violet-100 text-violet-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  return_requested: 'bg-pink-100 text-pink-800',
  returned: 'bg-gray-100 text-gray-800',
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  phone: string
  email: string | null
  address: string
  city: string
  province: string
  total: number
  subtotal: number
  delivery_fee: number
  payment_method: string
  payment_status: string
  transaction_id: string | null
  payment_proof_url: string | null
  order_status: string
  admin_notes: string | null
  created_at: string
}

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (statusFilter) query = query.eq('order_status', statusFilter)
    if (paymentFilter) query = query.eq('payment_status', paymentFilter)

    const { data } = await query
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter, paymentFilter])

  const updateOrder = async (id: string, updates: Record<string, string | null>) => {
    setSaving(id)
    await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o))
    setSaving(null)
  }

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search)
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.8rem] text-charcoal">Orders</h1>
        <p className="text-sm text-ink-muted mt-1">Manage customer orders, update statuses, verify payments ({orders.length} total)</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Search by order number, customer, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border outline-none focus:border-emerald-deep"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-border px-3 py-2.5 text-sm outline-none focus:border-emerald-deep bg-white">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="border border-border px-3 py-2.5 text-sm outline-none focus:border-emerald-deep bg-white">
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">
            {search || statusFilter || paymentFilter ? 'No orders match your filters' : 'No orders yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-parchment/50">
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider w-8"></th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <>
                    <tr key={order.id} className="border-b border-border hover:bg-parchment/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                      <td className="py-3 px-4">
                        <ChevronDown size={14} className={`text-ink-faint transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-medium">{order.order_number}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-charcoal">{order.customer_name}</p>
                        <p className="text-xs text-ink-muted">{order.phone}</p>
                      </td>
                      <td className="py-3 px-4 font-medium">{formatPrice(Number(order.total))}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[0.65rem] px-2 py-1 rounded-full font-medium capitalize ${
                          order.payment_status === 'verified' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[0.65rem] px-2 py-1 rounded-full font-medium ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.order_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-muted text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-parchment/30">
                        <td colSpan={7} className="p-6">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Customer Details */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Customer Details</h4>
                              <div className="space-y-1.5 text-sm">
                                <p><span className="text-ink-muted">Name:</span> {order.customer_name}</p>
                                <p><span className="text-ink-muted">Phone:</span> {order.phone}</p>
                                {order.email && <p><span className="text-ink-muted">Email:</span> {order.email}</p>}
                                <p><span className="text-ink-muted">Address:</span> {order.address}</p>
                                <p><span className="text-ink-muted">City:</span> {order.city}, {order.province}</p>
                              </div>
                            </div>

                            {/* Payment Info */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Payment Info</h4>
                              <div className="space-y-1.5 text-sm">
                                <p><span className="text-ink-muted">Method:</span> <span className="capitalize">{order.payment_method}</span></p>
                                <p><span className="text-ink-muted">Transaction ID:</span> {order.transaction_id || '—'}</p>
                                {order.payment_proof_url && (
                                  <p>
                                    <span className="text-ink-muted">Proof:</span>{' '}
                                    <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-emerald-deep underline hover:text-charcoal transition-colors">
                                      View Image
                                    </a>
                                  </p>
                                )}
                                <p><span className="text-ink-muted">Subtotal:</span> {formatPrice(Number(order.subtotal))}</p>
                                <p><span className="text-ink-muted">Delivery:</span> {formatPrice(Number(order.delivery_fee))}</p>
                                <p className="font-medium"><span className="text-ink-muted">Total:</span> {formatPrice(Number(order.total))}</p>
                              </div>
                            </div>

                            {/* Update Controls */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Update Order</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs text-ink-muted mb-1">Payment Status</label>
                                  <select
                                    value={order.payment_status}
                                    onChange={e => updateOrder(order.id, { payment_status: e.target.value })}
                                    disabled={saving === order.id}
                                    className="w-full border border-border px-3 py-2 text-sm bg-white outline-none focus:border-emerald-deep"
                                  >
                                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-ink-muted mb-1">Order Status</label>
                                  <select
                                    value={order.order_status}
                                    onChange={e => updateOrder(order.id, { order_status: e.target.value })}
                                    disabled={saving === order.id}
                                    className="w-full border border-border px-3 py-2 text-sm bg-white outline-none focus:border-emerald-deep"
                                  >
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-ink-muted mb-1">Admin Notes / Rejection Reason</label>
                                  <textarea
                                    defaultValue={order.admin_notes || ''}
                                    onBlur={e => {
                                      if (e.target.value !== (order.admin_notes || '')) {
                                        updateOrder(order.id, { admin_notes: e.target.value || null })
                                      }
                                    }}
                                    rows={2}
                                    placeholder="Add notes or rejection reason..."
                                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep resize-none"
                                  />
                                </div>
                                {saving === order.id && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-deep">
                                    <Loader2 size={12} className="animate-spin" /> Saving...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
