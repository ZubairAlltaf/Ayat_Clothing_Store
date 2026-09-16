import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('products').select('gender').limit(1)
  console.log('Products gender check:', error ? error.message : 'Success')
  
  // To get the actual check constraints or enums in Postgrest isn't straightforward without RPC, but we can try to insert a fake product with gender 'unisex' to see if it fails.
  const { data: d2, error: e2 } = await supabase.from('products').insert({
    name: 'Test Bed Sheet',
    slug: 'test-bed-sheet',
    price: 1000,
    gender: 'unisex'
  })
  if (e2) {
    console.log('Insert test failed:', e2)
  } else {
    console.log('Insert test success, unisex is allowed.')
    await supabase.from('products').delete().eq('slug', 'test-bed-sheet')
  }

  // Check if a messages table exists
  const { error: e3 } = await supabase.from('messages').select('*').limit(1)
  if (e3) {
    console.log('Messages table check:', e3.message)
  } else {
    console.log('Messages table exists.')
  }
}
check()
