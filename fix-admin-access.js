const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mugliulilcwmrgxepxcr.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z2xpdWxpbGN3bXJneGVweGNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc2OTQyNSwiZXhwIjoyMDgwMzQ1NDI1fQ.kVN5tsl-Hquzx-wrcHuJRLkaTHeGwy5C8JxCJh218-c'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminAccess() {
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(10)
    
    if (error) throw error
    
    console.log('Current users:')
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.role || 'no role'}`)
    })
    
    // Make first user admin if no admin exists
    const adminExists = users.some(u => u.role === 'admin' || u.role === 'superadmin')
    
    if (!adminExists && users.length > 0) {
      const firstUser = users[0]
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', firstUser.id)
      
      if (updateError) throw updateError
      
      console.log(`\n✅ Made ${firstUser.email} an admin`)
    } else if (adminExists) {
      console.log('\n✅ Admin user already exists')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

fixAdminAccess()