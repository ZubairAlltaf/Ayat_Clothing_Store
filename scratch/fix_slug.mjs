import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Fetching products...')
  const { data, error } = await supabase.from('products').select('id, name, slug').ilike('name', '%Bedsheet%')
  if (error) {
    console.error('Error fetching:', error)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('No product found matching Bedsheet.')
    return
  }

  console.log('Found product:', data[0])
  const badSlug = data[0].slug
  
  const newSlug = data[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  
  console.log(`Updating slug from ${badSlug} to ${newSlug}`)
  
  const { error: updateError } = await supabase.from('products').update({ slug: newSlug }).eq('id', data[0].id)
  
  if (updateError) {
    console.error('Error updating:', updateError)
  } else {
    console.log('Successfully updated product slug!')
  }
}

run()
