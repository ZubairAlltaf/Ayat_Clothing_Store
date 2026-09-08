'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Loader2, X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/stores/toast-store'

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: '', slug: '', description: '', shortDescription: '',
    fabric: '', productType: '', gender: 'unisex',
    price: '', salePrice: '', sku: '', stockQuantity: '0',
    weight: '', careInstructions: '', productDetails: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isOnSale: false,
    offerEndTime: '', categoryId: '', qualityGuarantee: 'standard'
  })
  
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [variants, setVariants] = useState<{ color: string; size: string; stock_quantity: string; price_adjustment: string }[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name')
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages(prev => [...prev, ...newFiles])
      // Create previews
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file)
        setImagePreviews(prev => [...prev, url])
      })
    }
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const addVariant = () => setVariants(prev => [...prev, { color: '', size: '', stock_quantity: '0', price_adjustment: '0' }])
  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev => {
      const newVars = [...prev]
      newVars[index] = { ...newVars[index], [field]: value }
      return newVars
    })
  }
  const removeVariant = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) {
      setError('Product name and price are required.')
      return
    }
    setLoading(true)
    setError(null)
    
    try {
      // 1. Insert product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: form.description || null,
          short_description: form.shortDescription || null,
          fabric: form.fabric || null,
          product_type: form.productType || null,
          gender: form.gender,
          price: parseFloat(form.price),
          sale_price: form.salePrice ? parseFloat(form.salePrice) : null,
          sku: form.sku || null,
          stock_quantity: parseInt(form.stockQuantity) || 0,
          weight: form.weight || null,
          care_instructions: form.careInstructions || null,
          product_details: form.productDetails || null,
          category_id: form.categoryId || null,
          quality_guarantee: form.qualityGuarantee,
          is_featured: form.isFeatured,
          is_new_arrival: form.isNewArrival,
          is_best_seller: form.isBestSeller,
          is_on_sale: form.isOnSale,
          offer_end_time: form.offerEndTime ? new Date(form.offerEndTime).toISOString() : null,
          is_active: true
        })
        .select()
        .single()

      if (productError) throw productError
      const productId = productData.id

      // 2. Upload images to ImageKit
      if (images.length > 0) {
        try {
          const authRes = await fetch('/api/imagekit/auth')
          const authData = await authRes.json()

          if (!authData.error) {
            for (let i = 0; i < images.length; i++) {
              const file = images[i]
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
                  product_id: productId,
                  image_url: uploadData.url,
                  imagekit_file_id: uploadData.fileId,
                  is_primary: i === 0,
                  position: i
                })
                if (insertError) throw insertError
              } else {
                const errText = await uploadRes.text()
                console.error('ImageKit upload failed:', errText)
                useToastStore.getState().addToast(`Image upload failed: ${file.name}`, 'error')
              }
            }
          }
        } catch (err: any) {
          console.error('Image processing error:', err)
          useToastStore.getState().addToast('One or more images failed to process correctly.', 'error')
        }
      }

      // 3. Insert product variants
      if (variants.length > 0) {
        const variantRows = variants.map(v => ({
          product_id: productId,
          color: v.color || null,
          size: v.size || null,
          stock_quantity: parseInt(v.stock_quantity) || 0,
          price_adjustment: parseFloat(v.price_adjustment) || 0
        }))
        await supabase.from('product_variants').insert(variantRows)
      }

      useToastStore.getState().addToast('Product created successfully!', 'success')
      router.push('/asstories/products')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while saving the product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/asstories/products" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-charcoal mb-4">
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h1 className="font-serif text-[1.8rem] text-charcoal">Add New Product</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <form className="grid lg:grid-cols-[1fr_360px] gap-8" onSubmit={handleSubmit}>
        {/* Main */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Basic Information</h2>
            <div className="space-y-4">
              <AdminInput label="Product Name *" value={form.name} onChange={v => update('name', v)} required />
              <AdminInput label="Slug" value={form.slug} onChange={v => update('slug', v)} placeholder="auto-generated-from-name" />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={4}
                  className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none"
                />
              </div>
              <AdminInput label="Short Description" value={form.shortDescription} onChange={v => update('shortDescription', v)} />
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Product Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="Fabric" value={form.fabric} onChange={v => update('fabric', v)} placeholder="e.g. Boski, Lawn" />
              <AdminInput label="Product Type" value={form.productType} onChange={v => update('productType', v)} placeholder="e.g. Kurta, Suit" />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => update('categoryId', e.target.value)}
                  className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep bg-white"
                >
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => update('gender', e.target.value)}
                  className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep bg-white"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="children">Children</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Quality Guarantee</label>
                <select
                  value={form.qualityGuarantee}
                  onChange={e => update('qualityGuarantee', e.target.value)}
                  className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep bg-white"
                >
                  <option value="standard">Standard Quality</option>
                  <option value="premium">Premium Guarantee (Warranty included)</option>
                </select>
              </div>
              <AdminInput label="Weight" value={form.weight} onChange={v => update('weight', v)} placeholder="e.g. Medium" />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Pricing & Inventory</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="Price (PKR) *" value={form.price} onChange={v => update('price', v)} type="number" required />
              <AdminInput label="Sale Price (PKR)" value={form.salePrice} onChange={v => update('salePrice', v)} type="number" />
              <AdminInput label="SKU" value={form.sku} onChange={v => update('sku', v)} />
              <AdminInput label="Stock Quantity" value={form.stockQuantity} onChange={v => update('stockQuantity', v)} type="number" />
              <div className="sm:col-span-2">
                <AdminInput label="Offer Ends At (For limited time sales)" value={form.offerEndTime} onChange={v => update('offerEndTime', v)} type="datetime-local" />
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

          {/* Care */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Additional Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Care Instructions</label>
                <textarea value={form.careInstructions} onChange={e => update('careInstructions', e.target.value)} rows={3} placeholder="Machine wash cold. Do not bleach..." className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Product Details</label>
                <textarea value={form.productDetails} onChange={e => update('productDetails', e.target.value)} rows={3} placeholder="Material, length, finish, etc." className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-emerald-deep resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Images</h2>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative aspect-square">
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5">
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-emerald-deep text-white text-[0.5rem] px-1.5 py-0.5">Primary</span>}
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border py-8 cursor-pointer hover:border-emerald-deep hover:bg-parchment transition-all">
              <Upload size={24} className="text-ink-faint mb-2" />
              <span className="text-sm text-ink-muted">Upload images</span>
              <span className="text-xs text-ink-faint mt-1">JPG, PNG up to 5MB — first is primary</span>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
            </label>
          </div>

          {/* Flags */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-semibold text-charcoal mb-4">Visibility</h2>
            <div className="space-y-3">
              {[
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

          {/* Save */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-deep text-champagne py-3 text-sm font-medium hover:bg-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

function AdminInput({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-emerald-deep"
      />
    </div>
  )
}
