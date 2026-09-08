'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Tag, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  min_order: number
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
}

export default function AdminCouponsPage() {
  const supabase = createClient()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: ''
  })

  const load = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (data) setCoupons(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '' })
    setEditing(null)
    setShowAdd(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      min_order: parseFloat(form.minOrder) || 0,
      max_discount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      usage_limit: form.usageLimit ? parseInt(form.usageLimit) : null,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    }

    if (editing) {
      await supabase.from('coupons').update(payload).eq('id', editing)
    } else {
      await supabase.from('coupons').insert({ ...payload, is_active: true })
    }
    resetForm()
    setSaving(false)
    load()
  }

  const startEdit = (c: Coupon) => {
    setEditing(c.id)
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.min_order || ''),
      maxDiscount: c.max_discount ? String(c.max_discount) : '',
      usageLimit: c.usage_limit ? String(c.usage_limit) : '',
      expiresAt: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : '',
    })
    setShowAdd(true)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id)
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await supabase.from('coupons').delete().eq('id', id)
    setCoupons(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Coupons & Deals</h1>
          <p className="text-sm text-ink-muted mt-1">Create discount codes and promotional deals</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-5 py-2.5 text-sm hover:bg-charcoal transition-colors">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-semibold text-charcoal mb-4">{editing ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep font-mono uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Discount Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep bg-white">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Value * ({form.type === 'percentage' ? '%' : 'PKR'})</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Minimum Order (PKR)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Max Discount (PKR)</label>
              <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="Leave empty for no limit" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Unlimited" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-1.5">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !form.code || !form.value} className="bg-emerald-deep text-champagne px-6 py-2.5 text-sm hover:bg-charcoal transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {editing ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button onClick={resetForm} className="border border-border px-6 py-2.5 text-sm hover:bg-parchment transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border overflow-hidden">
        {coupons.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <Tag size={36} className="mx-auto mb-3 text-ink-faint" strokeWidth={1} />
            <p className="text-sm">No coupons yet. Create your first promotional deal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-parchment/50">
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Discount</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Min Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Used</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Expires</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="border-b border-border last:border-0 hover:bg-parchment/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-charcoal bg-parchment px-2 py-0.5">{coupon.code}</span>
                        <button onClick={() => navigator.clipboard.writeText(coupon.code)} className="text-ink-faint hover:text-charcoal" title="Copy code">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `PKR ${Number(coupon.value).toLocaleString()}`}
                    </td>
                    <td className="py-3 px-4 text-ink-muted">
                      {coupon.min_order ? `PKR ${Number(coupon.min_order).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-muted">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(coupon.id, coupon.is_active)} className={`text-[0.65rem] px-2.5 py-1 rounded-full font-medium ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(coupon)} className="p-2 text-ink-muted hover:text-emerald-deep rounded transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-ink-muted hover:text-red-600 rounded transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
