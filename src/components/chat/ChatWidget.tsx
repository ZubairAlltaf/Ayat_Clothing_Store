'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [activeQuery, setActiveQuery] = useState<any>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  const supabase = createClient()

  // Load active chat session on mount or open
  useEffect(() => {
    if (isOpen) {
      loadActiveSession()
    }
  }, [isOpen])

  const loadActiveSession = async () => {
    const queryId = localStorage.getItem('ayat_chat_id')
    if (queryId) {
      setLoadingHistory(true)
      const { data } = await supabase
        .from('support_queries')
        .select('*')
        .eq('id', queryId)
        .single()
        
      if (data) {
        setActiveQuery(data)
      } else {
        localStorage.removeItem('ayat_chat_id')
      }
      setLoadingHistory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !contact || !message) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('support_queries')
        .insert([{ name, contact_method: contact, message }])
        .select()
        .single()
        
      if (error) throw error
      
      if (data) {
        localStorage.setItem('ayat_chat_id', data.id)
        setActiveQuery(data)
        setIsSuccess(true)
        // Reset fields for future
        setMessage('')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const clearSession = () => {
    localStorage.removeItem('ayat_chat_id')
    setActiveQuery(null)
    setIsSuccess(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-border w-[320px] mb-4 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-charcoal text-champagne p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-medium">Ayat Support</h3>
              <p className="text-xs text-champagne/70">
                {activeQuery ? 'Your active ticket' : 'We typically reply in a few minutes.'}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-champagne/70 hover:text-champagne transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex-1 bg-parchment/30 max-h-[400px] overflow-y-auto">
            {loadingHistory ? (
              <div className="flex justify-center py-10 text-ink-muted text-sm">Loading chat...</div>
            ) : activeQuery ? (
              <div className="space-y-4">
                {/* User Message */}
                <div className="flex flex-col items-end">
                  <span className="text-[0.65rem] text-ink-muted mb-1 px-1">You</span>
                  <div className="bg-emerald-deep text-champagne p-3 rounded-l-lg rounded-br-lg text-sm max-w-[85%]">
                    {activeQuery.message}
                  </div>
                  <span className="text-[0.6rem] text-ink-faint mt-1">
                    {new Date(activeQuery.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                {/* Admin Reply or Pending */}
                <div className="flex flex-col items-start mt-4">
                  <span className="text-[0.65rem] text-ink-muted mb-1 px-1">Ayat Support</span>
                  {activeQuery.admin_reply ? (
                    <>
                      <div className="bg-white border border-border text-charcoal p-3 rounded-r-lg rounded-bl-lg text-sm max-w-[85%] shadow-sm">
                        {activeQuery.admin_reply}
                      </div>
                      {activeQuery.replied_at && (
                        <span className="text-[0.6rem] text-ink-faint mt-1">
                          {new Date(activeQuery.replied_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="bg-white border border-border text-ink-muted p-3 rounded-r-lg rounded-bl-lg text-xs italic max-w-[85%] shadow-sm">
                      Our team is reviewing your message and will reply here soon. Feel free to check back later!
                    </div>
                  )}
                </div>
                
                {/* Footer for active query */}
                <div className="pt-6 text-center border-t border-border/50 mt-6">
                  {activeQuery.status === 'resolved' ? (
                    <p className="text-xs text-sage font-medium mb-3">This ticket has been marked resolved.</p>
                  ) : null}
                  <button onClick={clearSession} className="text-xs text-ink-muted hover:text-charcoal underline">
                    Start a new conversation
                  </button>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-deep/10 text-emerald-deep rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send size={20} className="ml-1" />
                </div>
                <h4 className="font-medium text-charcoal mb-1">Message Sent!</h4>
                <p className="text-xs text-ink-muted">Our agent will reply here shortly.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-4 text-xs text-emerald-deep font-medium hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[0.7rem] font-medium text-charcoal mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep bg-white"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-charcoal mb-1">WhatsApp No. or Email</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep bg-white"
                    placeholder="To receive our reply"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-medium text-charcoal mb-1">Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep resize-none bg-white"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-charcoal text-champagne py-2.5 text-xs font-medium hover:bg-emerald-deep transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-charcoal text-champagne rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-deep transition-all hover:scale-105 active:scale-95"
        aria-label="Open support chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
