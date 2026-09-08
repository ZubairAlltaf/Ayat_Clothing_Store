'use client'

import { useState, useEffect } from 'react'
import { Loader2, Mail, Trash2, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminNewsletterPage() {
  const supabase = createClient()
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false })
      if (data) setSubs(data)
      setLoading(false)
    }
    load()
  }, [])

  const deleteSub = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return
    await supabase.from('newsletter_subscribers').delete().eq('id', id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  const exportCSV = () => {
    const csv = 'Email,Active,Subscribed At\n' + subs.map(s => `${s.email},${s.is_active},${s.subscribed_at}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'newsletter_subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Newsletter</h1>
          <p className="text-sm text-ink-muted mt-1">Manage newsletter subscribers ({subs.length} total)</p>
        </div>
        {subs.length > 0 && (
          <button onClick={exportCSV} className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm hover:bg-parchment transition-colors">
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      <div className="bg-white border border-border overflow-hidden">
        {subs.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <Mail size={36} className="mx-auto mb-3 text-ink-faint" strokeWidth={1} />
            <p className="text-sm">No subscribers yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-parchment/50">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-parchment/30">
                  <td className="py-3 px-4 font-medium">{s.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[0.65rem] px-2 py-1 rounded-full font-medium ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                      {s.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-muted">
                    {new Date(s.subscribed_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => deleteSub(s.id)} className="p-2 text-ink-muted hover:text-red-600 rounded transition-colors"><Trash2 size={14} /></button>
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
