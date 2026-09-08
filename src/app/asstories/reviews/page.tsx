'use client'

import { useState, useEffect } from 'react'
import { Loader2, Star, Check, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

export default function AdminReviewsPage() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newReview, setNewReview] = useState({ customer_name: '', rating: 5, review_text: '', is_featured: false })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
    if (data) setReviews(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approveReview = async (id: string) => {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r))
  }

  const rejectReview = async (id: string) => {
    await supabase.from('reviews').update({ is_approved: false }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: false } : r))
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('reviews').update({ is_featured: !current }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_featured: !current } : r))
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data, error } = await supabase.from('reviews').insert({
      customer_name: newReview.customer_name || 'Anonymous',
      rating: newReview.rating,
      review_text: newReview.review_text,
      is_approved: true,
      is_featured: newReview.is_featured,
      is_verified_purchase: true
    }).select('*, products(name)').single()
    
    if (!error && data) {
      setReviews(prev => [data, ...prev])
      setShowAddForm(false)
      setNewReview({ customer_name: '', rating: 5, review_text: '', is_featured: false })
    }
    setSubmitting(false)
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={24} className="animate-spin text-ink-faint" /></div>

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-[1.8rem] text-charcoal">Reviews</h1>
          <p className="text-sm text-ink-muted mt-1">Moderate and manage customer reviews ({reviews.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-deep text-champagne px-4 py-2 text-sm font-medium hover:bg-charcoal transition-colors flex items-center gap-2"
        >
          {showAddForm ? 'Cancel' : <><Plus size={16} /> Add Review</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddReview} className="bg-white border border-border p-6 mb-8 space-y-4">
          <h2 className="font-medium text-charcoal mb-4">Add Manual Review</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink-muted mb-1">Customer Name</label>
              <input type="text" value={newReview.customer_name} onChange={e => setNewReview({ ...newReview, customer_name: e.target.value })} className="w-full border px-3 py-2 text-sm outline-none focus:border-emerald-deep" placeholder="e.g. Ayesha K." required />
            </div>
            <div>
              <label className="block text-xs text-ink-muted mb-1">Rating (1-5)</label>
              <select value={newReview.rating} onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })} className="w-full border px-3 py-2 text-sm outline-none focus:border-emerald-deep">
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-muted mb-1">Review Text</label>
            <textarea value={newReview.review_text} onChange={e => setNewReview({ ...newReview, review_text: e.target.value })} rows={3} className="w-full border px-3 py-2 text-sm outline-none focus:border-emerald-deep resize-none" required placeholder="Write the review..." />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer w-max">
            <input type="checkbox" checked={newReview.is_featured} onChange={e => setNewReview({ ...newReview, is_featured: e.target.checked })} className="accent-emerald-deep" />
            <span>Mark as Featured Review</span>
          </label>
          <button type="submit" disabled={submitting} className="bg-charcoal text-white px-5 py-2 text-sm font-medium hover:bg-emerald-deep transition-colors">
            {submitting ? 'Adding...' : 'Save Review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white border border-border text-center py-16 text-ink-muted text-sm">
          <Star size={36} className="mx-auto mb-3 text-ink-faint" strokeWidth={1} />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className={`bg-white border p-5 ${review.is_approved ? 'border-border' : 'border-orange-200 bg-orange-50/30'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-xs text-ink-muted">·</span>
                    <span className="text-xs text-ink-muted">{review.customer_name || 'Anonymous'}</span>
                    {review.is_verified_purchase && <span className="text-[0.6rem] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Verified</span>}
                    {review.is_featured && <span className="text-[0.6rem] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Featured</span>}
                  </div>
                  <p className="text-xs text-ink-muted mb-1">Product: {review.products?.name || '—'}</p>
                  {review.review_text && <p className="text-sm text-charcoal">{review.review_text}</p>}
                  <p className="text-xs text-ink-faint mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {!review.is_approved && <span className="ml-2 text-orange-600 font-medium">⚠ Pending Approval</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!review.is_approved && (
                    <button onClick={() => approveReview(review.id)} className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve">
                      <Check size={16} />
                    </button>
                  )}
                  {review.is_approved && (
                    <button onClick={() => rejectReview(review.id)} className="p-2 text-orange-500 hover:bg-orange-50 rounded transition-colors" title="Unapprove">
                      <X size={16} />
                    </button>
                  )}
                  <button onClick={() => toggleFeatured(review.id, review.is_featured)} className={`p-2 rounded transition-colors ${review.is_featured ? 'text-purple-600 hover:bg-purple-50' : 'text-ink-faint hover:bg-parchment'}`} title="Toggle Featured">
                    <Star size={14} fill={review.is_featured ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => deleteReview(review.id)} className="p-2 text-ink-muted hover:text-red-600 rounded transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
