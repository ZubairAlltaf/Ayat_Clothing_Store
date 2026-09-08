const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fbjlporpxkofedkjlysr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiamxwb3JweGtvZmVka2pseXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTQwNzgsImV4cCI6MjEwNDMzMDA3OH0.dO3GKDn_-ya1cbOIsRL-vBo3sVrYYZ8T5pmcdCqZdxE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  const { data: cats, error: err1 } = await supabase.from('categories').select('*');
  console.log('Categories:', cats);

  const { data: prods, error: err2 } = await supabase.from('products').select('id, name, gender, category_id').limit(3);
  console.log('Products:', prods);
}

checkCategories();
