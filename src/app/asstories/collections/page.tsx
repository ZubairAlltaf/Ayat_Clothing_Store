'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export default function AdminCollectionsPage() {
  const supabase = createClient()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('collections').select('*').order('display_order')
    if (data) setCollections(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => { setForm({ name: '', slug: '', description: '', image_url: '' }); setEditing(null); setShowAdd(false) }

  const handleSave = async () => {
    setSaving(true)
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
    if (editing) {
      await supabase.from('collections').update({ name: form.name, slug, description: form.description || null, image_url: form.image_url || null }).eq('id', editing)
    } else {
      await supabase.from('collections').insert({ name: form.name, slug, description: form.description || null, image_url: form.image_url || null, display_order: collections.length })
    }
    resetForm()
    setSaving(false)
    load()
  }

  const startEdit = (col: Collection) => {
    setEditing(col.id)
    setForm({ name: col.name, slug: col.slug, description: col.description || '', image_url: col.image_url || '' })
    setShowAdd(true)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('collections').update({ is_active: !current }).eq('id', id)
    setCollections(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const deleteCollection = async (id: string) => {
    if (!confirm('Delete this collection?')) return
    await supabase.from('collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Collections</h1>
          <p className="text-sm text-ink-muted mt-1">Group products into curated collections</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-5 py-2.5 text-sm hover:bg-charcoal transition-colors">
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-semibold text-charcoal mb-4">{editing ? 'Edit Collection' : 'Add New Collection'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-1.5">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !form.name} className="bg-emerald-deep text-champagne px-6 py-2.5 text-sm hover:bg-charcoal transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {editing ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} className="border border-border px-6 py-2.5 text-sm hover:bg-parchment transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border overflow-hidden">
        {collections.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">No collections yet. Add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-parchment/50">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Slug</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map(col => (
                <tr key={col.id} className="border-b border-border last:border-0 hover:bg-parchment/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-charcoal">{col.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-muted">{col.slug}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleActive(col.id, col.is_active)} className={`text-[0.65rem] px-2.5 py-1 rounded-full font-medium ${col.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {col.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(col)} className="p-2 text-ink-muted hover:text-emerald-deep rounded transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteCollection(col.id)} className="p-2 text-ink-muted hover:text-red-600 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
