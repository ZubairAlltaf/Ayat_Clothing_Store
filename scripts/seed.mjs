import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Key in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const MOCK_PRODUCTS = [
  { name: 'Serene Bloom', slug: 'serene-bloom', fabric: 'Lawn', product_type: '3 Piece', price: 4500, gender: 'women', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
  { name: 'Noor-e-Aab', slug: 'noor-e-aab', fabric: 'Chiffon', product_type: '3 Piece', price: 8750, sale_price: 7875, gender: 'women', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
  { name: 'Zarafshan', slug: 'zarafshan', fabric: 'Organza', product_type: '3 Piece', price: 12990, gender: 'women', image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
  { name: 'Tashreeh', slug: 'tashreeh', fabric: 'Lawn', product_type: '3 Piece', price: 3590, gender: 'women', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
  { name: 'Heritage Boski', slug: 'heritage-boski', fabric: 'Boski', product_type: 'Suit Length', price: 6200, gender: 'men', is_best_seller: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
  { name: 'Master Plan', slug: 'master-plan', fabric: 'Wash & Wear', product_type: 'Suit Length', price: 5500, gender: 'men', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
  { name: 'Eagle Cotton Premium', slug: 'eagle-cotton', fabric: 'Cotton', product_type: 'Suit Length', price: 4800, gender: 'men', image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
  { name: 'Little Star Kurta', slug: 'little-star', fabric: 'Cotton', product_type: '2 Piece', price: 2800, gender: 'children', image_url: 'https://ik.imagekit.io/ids6t96oe/hero_men.jpg' },
  { name: 'Mini Heritage Set', slug: 'mini-heritage', fabric: 'Lawn', product_type: '3 Piece', price: 3200, gender: 'children', is_new_arrival: true, image_url: 'https://ik.imagekit.io/ids6t96oe/hero_women.jpg' },
]

async function seed() {
  console.log('🌱 Seeding products into Supabase...')
  
  for (const product of MOCK_PRODUCTS) {
    const { image_url, ...productData } = product
    
    // 1. Insert Product
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert({
        ...productData,
        is_active: true
      })
      .select()
      .single()

    if (productError) {
      // If it already exists due to unique slug, just fetch it
      if (productError.code === '23505') {
         console.log(`⚠️ Product ${product.name} already exists. Skipping...`)
         continue
      } else {
         console.error(`❌ Error inserting product ${product.name}:`, productError)
         continue
      }
    }

    console.log(`✅ Inserted product: ${product.name}`)

    // 2. Insert Product Image
    const { error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: insertedProduct.id,
        image_url: image_url,
        is_primary: true,
        position: 0
      })

    if (imageError) {
      console.error(`❌ Error inserting image for ${product.name}:`, imageError)
    } else {
      console.log(`🖼️ Added image for: ${product.name}`)
    }
  }

  console.log('✨ Seeding complete!')
}

seed()
