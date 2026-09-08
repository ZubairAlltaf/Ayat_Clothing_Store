'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Banner {
  id: string
  heading: string | null
  subtitle: string | null
  description: string | null
  cta_text: string | null
  cta_url: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export default function AdminHeroBannersPage() {
  const supabase = createClient()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    heading: '', subtitle: '', description: '', cta_text: '', cta_url: '', image_url: ''
  })

  const load = async () => {
    const { data } = await supabase.from('hero_banners').select('*').order('display_order')
    if (data) setBanners(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ heading: '', subtitle: '', description: '', cta_text: '', cta_url: '', image_url: '' })
    setEditing(null)
    setShowAdd(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      heading: form.heading || null,
      subtitle: form.subtitle || null,
      description: form.description || null,
      cta_text: form.cta_text || null,
      cta_url: form.cta_url || null,
      image_url: form.image_url || null,
    }

    if (editing) {
      await supabase.from('hero_banners').update(payload).eq('id', editing)
    } else {
      await supabase.from('hero_banners').insert({ ...payload, display_order: banners.length, is_active: true })
    }
    resetForm()
    setSaving(false)
    load()
  }

  const startEdit = (b: Banner) => {
    setEditing(b.id)
    setForm({
      heading: b.heading || '', subtitle: b.subtitle || '', description: b.description || '',
      cta_text: b.cta_text || '', cta_url: b.cta_url || '', image_url: b.image_url || ''
    })
    setShowAdd(true)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('hero_banners').update({ is_active: !current }).eq('id', id)
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b))
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    await supabase.from('hero_banners').delete().eq('id', id)
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Hero Banners</h1>
          <p className="text-sm text-ink-muted mt-1">Manage homepage hero banners and promotional slides</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-5 py-2.5 text-sm hover:bg-charcoal transition-colors">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-semibold text-charcoal mb-4">{editing ? 'Edit Banner' : 'Add New Banner'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-charcoal mb-1.5">Heading</label>
              <input value={form.heading} onChange={e => setForm(f => ({ ...f, heading: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1.5">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep resize-none" /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1.5">CTA Button Text</label>
              <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="e.g. Shop Now" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" /></div>
            <div><label className="block text-sm font-medium text-charcoal mb-1.5">CTA Link URL</label>
              <input value={form.cta_url} onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))} placeholder="/new-arrivals" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-charcoal mb-1.5">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-emerald-deep text-champagne px-6 py-2.5 text-sm hover:bg-charcoal transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} {editing ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} className="border border-border px-6 py-2.5 text-sm hover:bg-parchment transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {banners.length === 0 ? (
          <div className="bg-white border border-border text-center py-16 text-ink-muted text-sm">No hero banners yet.</div>
        ) : banners.map(banner => (
          <div key={banner.id} className="bg-white border border-border p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-charcoal truncate">{banner.heading || '(No heading)'}</p>
              <p className="text-xs text-ink-muted truncate">{banner.subtitle || banner.description || '—'}</p>
              {banner.cta_text && <p className="text-xs text-emerald-deep mt-1">{banner.cta_text} → {banner.cta_url}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(banner.id, banner.is_active)} className={`p-2 rounded transition-colors ${banner.is_active ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`} title={banner.is_active ? 'Active' : 'Hidden'}>
                {banner.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => startEdit(banner)} className="p-2 text-ink-muted hover:text-emerald-deep rounded transition-colors"><Pencil size={14} /></button>
              <button onClick={() => deleteBanner(banner.id)} className="p-2 text-ink-muted hover:text-red-600 rounded transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
