'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

export default function AdminPaymentsPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, phone, total, payment_method, payment_status, transaction_id, admin_notes, created_at')
      .in('payment_status', ['pending'])
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updatePayment = async (id: string, status: string, notes?: string) => {
    setSaving(id)
    const updates: Record<string, unknown> = {
      payment_status: status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'verified') {
      updates.order_status = 'payment_verified'
    }
    if (notes) {
      updates.admin_notes = notes
    }
    await supabase.from('orders').update(updates).eq('id', id)
    setOrders(prev => prev.filter(o => o.id !== id))
    setSaving(null)
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.8rem] text-charcoal">Payment Verification</h1>
        <p className="text-sm text-ink-muted mt-1">Review and verify JazzCash / Easypaisa payments ({orders.length} pending)</p>
      </div>

      <div className="bg-white border border-border overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">
            <p className="mb-1">✓ No pending payments to verify</p>
            <p className="text-xs text-ink-faint">All caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-parchment/50">
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-parchment/30">
                    <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-ink-muted">{order.phone}</p>
                    </td>
                    <td className="py-3 px-4 font-medium">{formatPrice(Number(order.total))}</td>
                    <td className="py-3 px-4 capitalize">{order.payment_method}</td>
                    <td className="py-3 px-4 font-mono text-xs">{order.transaction_id || '—'}</td>
                    <td className="py-3 px-4 text-xs text-ink-muted">
                      {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updatePayment(order.id, 'verified')}
                          disabled={saving === order.id}
                          className="bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          ✓ Verify
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:')
                            if (reason !== null) updatePayment(order.id, 'rejected', reason)
                          }}
                          disabled={saving === order.id}
                          className="bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-parchment border border-border p-4 text-xs text-ink-muted">
        <strong className="text-charcoal">Payment Verification Flow:</strong>
        <ol className="list-decimal pl-4 mt-2 space-y-1">
          <li>Customer submits order with JazzCash/Easypaisa payment details</li>
          <li>Payment status is set to <span className="font-mono bg-champagne px-1">PENDING</span></li>
          <li>Admin reviews the transaction ID and payment proof</li>
          <li>Admin clicks <span className="font-mono bg-green-100 px-1">VERIFY</span> or <span className="font-mono bg-red-100 px-1">REJECT</span></li>
          <li>If rejected, a reason is saved and shown to customer on track order page</li>
        </ol>
      </div>
    </div>
  )
}
