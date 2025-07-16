const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env file or environment variables.');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllUsers() {
  try {
    console.log('🔍 Fetching all users from Supabase...\n');

    // Get all users using the admin API
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in the database.');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);

    // Display user information
    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log(`   Status: ${user.banned_until ? 'Banned' : 'Active'}`);
      
      if (user.user_metadata) {
        console.log(`   Metadata: ${JSON.stringify(user.user_metadata)}`);
      }
      
      console.log(''); // Empty line for readability
    });

    // Summary statistics
    const confirmedUsers = users.filter(user => user.email_confirmed_at).length;
    const activeUsers = users.filter(user => !user.banned_until).length;
    const recentUsers = users.filter(user => {
      const createdDate = new Date(user.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;

    console.log('📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Email Confirmed: ${confirmedUsers}`);
    console.log(`   Active Users: ${activeUsers}`);
    console.log(`   New Users (Last 30 days): ${recentUsers}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { listAllUsers };
}

// Run the script if called directly
if (require.main === module) {
  listAllUsers();
} 