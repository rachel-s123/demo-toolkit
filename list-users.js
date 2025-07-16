const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsers() {
  try {
    console.log('Fetching users...');
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.id})`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listUsers(); 