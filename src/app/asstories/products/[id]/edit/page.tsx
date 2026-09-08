'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useToastStore } from '@/stores/toast-store'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const addToast = useToastStore(s => s.addToast)

  const [form, setForm] = useState({
    name: '', slug: '', description: '', shortDescription: '',
    fabric: '', productType: '', gender: 'unisex',
    price: '', salePrice: '', sku: '', stockQuantity: '',
    weight: '', careInstructions: '', productDetails: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isOnSale: false,
    isActive: true, offerEndTime: '', qualityGuarantee: 'standard'
  })

  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string; is_primary: boolean }[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [variants, setVariants] = useState<{ id?: string; color: string; size: string; stock_quantity: string; price_adjustment: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(id, image_url, is_primary, position), product_variants(id, color, size, stock_quantity, price_adjustment)')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Product not found')
        setLoading(false)
        return
      }

      setForm({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        shortDescription: data.short_description || '',
        fabric: data.fabric || '',
        productType: data.product_type || '',
        gender: data.gender || 'unisex',
        price: String(data.price || ''),
        salePrice: data.sale_price ? String(data.sale_price) : '',
        sku: data.sku || '',
        stockQuantity: String(data.stock_quantity ?? ''),
        weight: data.weight || '',
        careInstructions: data.care_instructions || '',
        productDetails: data.product_details || '',
        isFeatured: data.is_featured || false,
        isNewArrival: data.is_new_arrival || false,
        isBestSeller: data.is_best_seller || false,
        isOnSale: data.is_on_sale || false,
        isActive: data.is_active ?? true,
        offerEndTime: data.offer_end_time ? new Date(data.offer_end_time).toISOString().slice(0, 16) : '',
        qualityGuarantee: data.quality_guarantee || 'standard',
      })

      setExistingImages(
        (data.product_images || []).sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      )

      setVariants(
        (data.product_variants || []).map((v: any) => ({
          id: v.id,
          color: v.color || '',
          size: v.size || '',
          stock_quantity: String(v.stock_quantity || 0),
          price_adjustment: String(v.price_adjustment || 0)
        }))
      )

      setLoading(false)
    }

    fetchProduct()
  }, [id])

  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }))

  const addVariant = () => setVariants(prev => [...prev, { color: '', size: '', stock_quantity: '0', price_adjustment: '0' }])
  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev => {
      const newVars = [...prev]
      newVars[index] = { ...newVars[index], [field]: value }
      return newVars
    })
  }
  const removeVariant = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index))

  const removeExistingImage = async (imageId: string) => {
    await supabase.from('product_images').delete().eq('id', imageId)
    setExistingImages(prev => prev.filter(i => i.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
          description: form.description,
          short_description: form.shortDescription,
          fabric: form.fabric,
          product_type: form.productType,
          gender: form.gender,
          price: parseFloat(form.price),
          sale_price: form.salePrice ? parseFloat(form.salePrice) : null,
          sku: form.sku || null,
          stock_quantity: parseInt(form.stockQuantity) || 0,
          weight: form.weight,
          care_instructions: form.careInstructions,
          product_details: form.productDetails,
          is_featured: form.isFeatured,
          is_new_arrival: form.isNewArrival,
          is_best_seller: form.isBestSeller,
          is_on_sale: form.isOnSale,
          is_active: form.isActive,
          quality_guarantee: form.qualityGuarantee,
          offer_end_time: form.offerEndTime ? new Date(form.offerEndTime).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Upload new images if any
      if (newImages.length > 0) {
        try {
          const authRes = await fetch('/api/imagekit/auth')
          const authData = await authRes.json()

          if (!authData.error) {
            for (let i = 0; i < newImages.length; i++) {
              const file = newImages[i]
              const formData = new FormData()
              formData.append('file', file)
              formData.append('fileName', file.name)
              formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
              formData.append('signature', authData.signature)
              formData.append('expire', authData.expire.toString())
              formData.append('token', authData.token)
              formData.append('folder', '/products')

              const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData,
              })

              if (uploadRes.ok) {
                const uploadData = await uploadRes.json()
                const { error: insertError } = await supabase.from('product_images').insert({
                  product_id: id,
                  image_url: uploadData.url,
                  imagekit_file_id: uploadData.fileId,
                  is_primary: existingImages.length === 0 && i === 0,
                  position: existingImages.length + i
                })
                if (insertError) throw insertError
              } else {
                const errText = await uploadRes.text()
                console.error('ImageKit upload failed:', errText)
                addToast(`Image upload failed: ${file.name}`, 'error')
              }
            }
          }
        } catch (err: any) {
          console.error('Image processing error:', err)
          addToast('One or more images failed to process correctly.', 'error')
        }
      }

      // Update Variants
      await supabase.from('product_variants').delete().eq('product_id', id)
      if (variants.length > 0) {
        await supabase.from('product_variants').insert(
          variants.map(v => ({
            product_id: id,
            color: v.color || null,
            size: v.size || null,
            stock_quantity: parseInt(v.stock_quantity) || 0,
            price_adjustment: parseFloat(v.price_adjustment) || 0
          }))
        )
      }

      addToast('Product updated successfully!', 'success')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to update product')
      addToast(err.message || 'Failed to update product', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-ink-faint" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/asstories/products" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-charcoal mb-4">
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h1 className="font-serif text-[1.8rem] text-charcoal">Edit Product</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 text-sm">{error}</div>}

      <form className="grid lg:grid-cols-[1fr_360px] gap-8" onSubmit={handleSubmit}>
        {/* Main */}
        <div className="space-y-6">
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Basic Information</h2>
            <div className="space-y-4">
              <AdminInput label="Product Name *" value={form.name} onChange={v => update('name', v)} />
              <AdminInput label="Slug" value={form.slug} onChange={v => update('slug', v)} placeholder="auto-generated-from-name" />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none" />
              </div>
              <AdminInput label="Short Description" value={form.shortDescription} onChange={v => update('shortDescription', v)} />
            </div>
          </div>

          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Product Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="Fabric" value={form.fabric} onChange={v => update('fabric', v)} placeholder="e.g. Boski, Lawn" />
              <AdminInput label="Product Type" value={form.productType} onChange={v => update('productType', v)} placeholder="e.g. Kurta, Suit" />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Gender</label>
                <select value={form.gender} onChange={e => update('gender', e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep bg-white">
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="children">Children</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Quality Guarantee</label>
                <select value={form.qualityGuarantee} onChange={e => update('qualityGuarantee', e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep bg-white">
                  <option value="standard">Standard Quality</option>
                  <option value="premium">Premium Guarantee (Warranty included)</option>
                </select>
              </div>
              <AdminInput label="Weight" value={form.weight} onChange={v => update('weight', v)} placeholder="e.g. Medium" />
            </div>
          </div>

          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Pricing & Inventory</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="Price (PKR) *" value={form.price} onChange={v => update('price', v)} type="number" />
              <AdminInput label="Sale Price (PKR)" value={form.salePrice} onChange={v => update('salePrice', v)} type="number" />
              <AdminInput label="SKU" value={form.sku} onChange={v => update('sku', v)} />
              <AdminInput label="Stock Quantity" value={form.stockQuantity} onChange={v => update('stockQuantity', v)} type="number" />
              <div className="sm:col-span-2">
                <AdminInput label="Offer Ends At" value={form.offerEndTime} onChange={v => update('offerEndTime', v)} type="datetime-local" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Additional Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Care Instructions</label>
                <textarea value={form.careInstructions} onChange={e => update('careInstructions', e.target.value)} rows={3} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Product Details</label>
                <textarea value={form.productDetails} onChange={e => update('productDetails', e.target.value)} rows={3} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none" />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="bg-white border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-charcoal">Product Variants</h2>
              <button type="button" onClick={addVariant} className="text-xs bg-emerald-deep/10 text-emerald-deep px-3 py-1.5 font-medium hover:bg-emerald-deep/20 transition-colors">+ Add Variant</button>
            </div>
            {variants.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-ink-muted px-1">
                  <span>Color</span><span>Size</span><span>Stock</span><span>Price Adj.</span><span className="w-8"></span>
                </div>
                {variants.map((variant, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                    <input type="text" placeholder="e.g. Red" value={variant.color} onChange={e => updateVariant(i, 'color', e.target.value)} className="border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep" />
                    <input type="text" placeholder="e.g. M" value={variant.size} onChange={e => updateVariant(i, 'size', e.target.value)} className="border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep" />
                    <input type="number" placeholder="10" value={variant.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} className="border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep" />
                    <input type="number" placeholder="+0" value={variant.price_adjustment} onChange={e => updateVariant(i, 'price_adjustment', e.target.value)} className="border border-border px-3 py-2 text-sm outline-none focus:border-emerald-deep" />
                    <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 p-2"><X size={16} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No variants added. Product will use base price and stock.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Existing Images */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Current Images</h2>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {existingImages.map(img => (
                  <div key={img.id} className="relative aspect-square bg-parchment group">
                    <Image src={img.image_url} alt="" fill className="object-cover" sizes="100px" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    {img.is_primary && (
                      <span className="absolute bottom-1 left-1 bg-emerald-deep text-white text-[0.5rem] px-1.5 py-0.5 rounded">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-muted mb-4">No existing images uploaded yet</p>
            )}

            {newImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {newImages.map((file, idx) => (
                  <div key={idx} className="relative aspect-square bg-parchment">
                    <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" sizes="100px" />
                    <span className="absolute bottom-1 right-1 bg-emerald-deep text-white text-[0.5rem] px-1.5 py-0.5 rounded">New</span>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border py-8 cursor-pointer hover:border-emerald-deep hover:bg-parchment transition-all">
              <Upload size={20} className="text-ink-faint mb-2" />
              <span className="text-xs text-ink-muted">{newImages.length > 0 ? `${newImages.length} new images` : 'Add more images'}</span>
              <input type="file" className="hidden" accept="image/*" multiple onChange={e => e.target.files && setNewImages(Array.from(e.target.files))} />
            </label>
          </div>

          {/* Flags */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Visibility & Flags</h2>
            <div className="space-y-3">
              {[
                { key: 'isActive', label: 'Active (Visible on Store)' },
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isNewArrival', label: 'New Arrival' },
                { key: 'isBestSeller', label: 'Best Seller' },
                { key: 'isOnSale', label: 'On Sale' },
              ].map((flag) => (
                <label key={flag.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[flag.key as keyof typeof form] as boolean}
                    onChange={e => update(flag.key, e.target.checked)}
                    className="w-4 h-4 accent-emerald-deep"
                  />
                  <span className="text-sm text-charcoal">{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-deep text-champagne py-3 text-sm font-medium hover:bg-charcoal transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Update Product'}
          </button>

          <Link
            href="/asstories/products"
            className="block w-full text-center border border-border py-3 text-sm text-ink-muted hover:bg-parchment transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function AdminInput({ label, value, onChange, type = 'text', placeholder }: {
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
