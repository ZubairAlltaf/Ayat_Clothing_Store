'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle, ExternalLink, Phone } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { SITE } from '@/lib/constants'

// Note: In a real app we'd fetch this via a server component or secured API.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Query = {
  id: string
  name: string
  contact_method: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}

export default function MessagesPage() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('support_queries')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setQueries(data)
    }
    setLoading(false)
  }

  const markResolved = async (id: string) => {
    const { error } = await supabase
      .from('support_queries')
      .update({ status: 'resolved' })
      .eq('id', id)
      
    if (!error) {
      setQueries(queries.map(q => q.id === id ? { ...q, status: 'resolved' } : q))
    }
  }

  const handleReplyWhatsApp = (contact: string) => {
    // Strip non numeric chars
    const numericContact = contact.replace(/\D/g, '')
    if (numericContact.length > 8) {
       window.open(`https://wa.me/${numericContact}`, '_blank')
    } else {
       // Maybe it's an email
       window.open(`mailto:${contact}`, '_blank')
    }
  }

  if (loading) {
    return <div className="p-10 flex items-center justify-center text-ink-muted">Loading messages...</div>
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal mb-2">Customer Messages</h1>
          <p className="text-sm text-ink-muted">Queries submitted via the website chat widget.</p>
        </div>
        <button onClick={fetchQueries} className="text-sm text-emerald-deep hover:underline">
          Refresh
        </button>
      </div>

      <div className="bg-white border border-border">
        {queries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-ink-muted">
            <MessageCircle size={32} className="mb-3 text-ink-faint" />
            <p className="text-sm">No messages received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {queries.map((q) => (
              <div key={q.id} className={`p-6 ${q.status === 'resolved' ? 'bg-parchment/30 opacity-70' : 'bg-white'}`}>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-charcoal">{q.name}</h3>
                      <span className="text-xs text-ink-muted">• {new Date(q.created_at).toLocaleString()}</span>
                      {q.status === 'open' && (
                        <span className="bg-emerald-deep/10 text-emerald-deep px-2 py-0.5 text-[0.6rem] uppercase tracking-wider font-bold">New</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-charcoal mb-4 bg-parchment p-4 rounded-r-lg rounded-bl-lg border border-border inline-block max-w-[80%]">
                      {q.message}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <span>Contact: <strong>{q.contact_method}</strong></span>
                      <button 
                        onClick={() => handleReplyWhatsApp(q.contact_method)}
                        className="flex items-center gap-1 text-emerald-deep hover:underline ml-3 bg-emerald-deep/5 px-2 py-1 rounded"
                      >
                        <ExternalLink size={12} /> Reply externally
                      </button>
                    </div>
                  </div>
                  
                  {q.status === 'open' ? (
                    <button 
                      onClick={() => markResolved(q.id)}
                      className="shrink-0 flex items-center gap-2 bg-charcoal text-champagne px-4 py-2 text-xs font-medium hover:bg-emerald-deep transition-colors"
                    >
                      <CheckCircle size={14} /> Mark Resolved
                    </button>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-xs text-sage font-medium">
                      <CheckCircle size={14} /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
