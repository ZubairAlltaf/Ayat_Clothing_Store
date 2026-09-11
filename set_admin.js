const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdmin(email) {
  // 1. Get user by email from auth.users via admin api
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error fetching users:", listError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }
  
  console.log(`Found user: ${user.id}`);
  
  // 2. Update profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);
    
  if (updateError) {
    console.error("Error updating profile:", updateError);
  } else {
    console.log(`Successfully granted admin access to ${email}`);
  }
}

setAdmin('ayatasad0304@gmail.com');
