'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  const [store, setStore] = useState({
    store_name: '', phone: '', whatsapp: '', email: '',
    jazzcash_name: '', jazzcash_number: '',
    easypaisa_name: '', easypaisa_number: '',
    about_image_url: '',
  })

  const [delivery, setDelivery] = useState({
    standard_rate: '', free_threshold: '', estimated_days: ''
  })

  useEffect(() => {
    const load = async () => {
      // Load site settings
      const { data: settings } = await supabase.from('site_settings').select('key, value')
      if (settings) {
        const map: Record<string, string> = {}
        settings.forEach(s => { map[s.key] = s.value })
        setStore({
          store_name: map.store_name || 'AYAT',
          phone: map.phone || '',
          whatsapp: map.whatsapp || '',
          email: map.email || '',
          jazzcash_name: map.jazzcash_name || '',
          jazzcash_number: map.jazzcash_number || '',
          easypaisa_name: map.easypaisa_name || '',
          easypaisa_number: map.easypaisa_number || '',
          about_image_url: map.about_image_url || '',
        })
      }

      // Load delivery settings
      const { data: deliveryData } = await supabase.from('delivery_settings').select('*').limit(1).single()
      if (deliveryData) {
        setDelivery({
          standard_rate: String(deliveryData.standard_rate || 250),
          free_threshold: String(deliveryData.free_threshold || 5000),
          estimated_days: deliveryData.estimated_days || '2 to 5 working days',
        })
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      // Upsert all site settings
      const entries = Object.entries(store)
      for (const [key, value] of entries) {
        await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      }

      // Update delivery settings
      const { data: existing } = await supabase.from('delivery_settings').select('id').limit(1).single()
      if (existing) {
        await supabase.from('delivery_settings').update({
          standard_rate: parseFloat(delivery.standard_rate) || 250,
          free_threshold: parseFloat(delivery.free_threshold) || 5000,
          estimated_days: delivery.estimated_days,
        }).eq('id', existing.id)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.8rem] text-charcoal">Settings</h1>
        <p className="text-sm text-ink-muted mt-1">Manage store configuration — all changes are saved to the database</p>
      </div>

      {success && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-100 text-sm">✓ Settings saved successfully!</div>}

      <div className="space-y-6 max-w-[700px]">
        {/* Store Info */}
        <SettingsCard title="Store Information">
          <SettingsInput label="Store Name" value={store.store_name} onChange={v => setStore(s => ({ ...s, store_name: v }))} />
          <SettingsInput label="Phone" value={store.phone} onChange={v => setStore(s => ({ ...s, phone: v }))} />
          <SettingsInput label="WhatsApp Number (with country code)" value={store.whatsapp} onChange={v => setStore(s => ({ ...s, whatsapp: v }))} />
          <SettingsInput label="Email" value={store.email} onChange={v => setStore(s => ({ ...s, email: v }))} />
        </SettingsCard>

        {/* Payment */}
        <SettingsCard title="Payment Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <SettingsInput label="JazzCash Account Name" value={store.jazzcash_name} onChange={v => setStore(s => ({ ...s, jazzcash_name: v }))} />
            <SettingsInput label="JazzCash Number" value={store.jazzcash_number} onChange={v => setStore(s => ({ ...s, jazzcash_number: v }))} />
            <SettingsInput label="Easypaisa Account Name" value={store.easypaisa_name} onChange={v => setStore(s => ({ ...s, easypaisa_name: v }))} />
            <SettingsInput label="Easypaisa Number" value={store.easypaisa_number} onChange={v => setStore(s => ({ ...s, easypaisa_number: v }))} />
          </div>
        </SettingsCard>

        {/* Delivery */}
        <SettingsCard title="Delivery Settings">
          <div className="grid sm:grid-cols-2 gap-4">
            <SettingsInput label="Standard Delivery Rate (PKR)" value={delivery.standard_rate} onChange={v => setDelivery(s => ({ ...s, standard_rate: v }))} type="number" />
            <SettingsInput label="Free Delivery Threshold (PKR)" value={delivery.free_threshold} onChange={v => setDelivery(s => ({ ...s, free_threshold: v }))} type="number" />
            <div className="sm:col-span-2">
              <SettingsInput label="Estimated Delivery Days" value={delivery.estimated_days} onChange={v => setDelivery(s => ({ ...s, estimated_days: v }))} />
            </div>
          </div>
        </SettingsCard>

        {/* About Page Image */}
        <SettingsCard title="About Page">
          <SettingsInput label="About Page Image URL" value={store.about_image_url} onChange={v => setStore(s => ({ ...s, about_image_url: v }))} placeholder="/images/hero_women.jpg or full URL" />
          <p className="text-xs text-ink-faint mt-1">This image will appear on the About Us page.</p>
        </SettingsCard>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-8 py-3 text-sm font-medium hover:bg-charcoal transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border p-6">
      <h2 className="font-semibold text-charcoal mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SettingsInput({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep"
      />
    </div>
  )
}
