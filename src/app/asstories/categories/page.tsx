'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
}

export default function AdminCategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' })
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order')
    if (data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const resetForm = () => { setForm({ name: '', slug: '', description: '', image_url: '' }); setEditing(null); setShowAdd(false) }

  const handleSave = async () => {
    setSaving(true)
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-')

    if (editing) {
      await supabase.from('categories').update({ name: form.name, slug, description: form.description || null, image_url: form.image_url || null }).eq('id', editing)
    } else {
      await supabase.from('categories').insert({ name: form.name, slug, description: form.description || null, image_url: form.image_url || null, display_order: categories.length })
    }

    resetForm()
    setSaving(false)
    fetch()
  }

  const startEdit = (cat: Category) => {
    setEditing(cat.id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '' })
    setShowAdd(true)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id)
    setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in this category will not be deleted.')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Categories</h1>
          <p className="text-sm text-ink-muted mt-1">Organize your products into categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true) }} className="inline-flex items-center gap-2 bg-emerald-deep text-champagne px-5 py-2.5 text-sm hover:bg-charcoal transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-semibold text-charcoal mb-4">{editing ? 'Edit Category' : 'Add New Category'}</h2>
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

      {/* List */}
      <div className="bg-white border border-border overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-ink-muted text-sm">No categories yet. Add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-parchment/50">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider w-8"></th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Slug</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-parchment/30 transition-colors">
                  <td className="py-3 px-4 text-ink-faint"><GripVertical size={14} /></td>
                  <td className="py-3 px-4 font-medium text-charcoal">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-ink-muted">{cat.slug}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleActive(cat.id, cat.is_active)} className={`text-[0.65rem] px-2.5 py-1 rounded-full font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(cat)} className="p-2 text-ink-muted hover:text-emerald-deep rounded transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 text-ink-muted hover:text-red-600 rounded transition-colors"><Trash2 size={14} /></button>
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
