'use client'

import { useState, useEffect } from 'react'
import { Loader2, Users, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminCustomersPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (data) setProfiles(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.8rem] text-charcoal">Customers</h1>
        <p className="text-sm text-ink-muted mt-1">View registered customers ({profiles.length} total)</p>
      </div>

      <div className="bg-white border border-border overflow-hidden">
        {profiles.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <Users size={36} className="mx-auto mb-3 text-ink-faint" strokeWidth={1} />
            <p className="text-sm">No customers registered yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-parchment/50">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-parchment/30">
                  <td className="py-3 px-4 font-medium text-charcoal">{p.full_name || '—'}</td>
                  <td className="py-3 px-4 text-ink-muted">{p.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[0.65rem] px-2 py-1 rounded-full font-medium ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-muted">
                    {new Date(p.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
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
