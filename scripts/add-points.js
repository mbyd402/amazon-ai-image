const { createClient } = require('@supabase/supabase-js')

// Hardcode from your .env.local
const supabaseUrl = 'https://mtjprdkzncxbvbdhodmt.supabase.co'
const supabaseServiceRoleKey = 'sb_secret_IBqXWh-HF-7V7SjsBgv_cg_qhrYU4Mp'

console.log('Connecting to Supabase...')

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log('Finding user mbyd402@gmail.com...')
  
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email, remaining_points, total_points')
    .eq('email', 'mbyd402@gmail.com')

  if (error) {
    console.error('Error finding user:', error)
    process.exit(1)
  }

  if (!users || users.length === 0) {
    console.error('User not found')
    process.exit(1)
  }

  const user = users[0]
  console.log('Found user:', user)
  const currentPoints = user.remaining_points || 0
  const addPoints = 100 - currentPoints

  console.log(`Adding ${addPoints} points, total will be 100...`)

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      remaining_points: 100,
      total_points: (user.total_points || 0) + addPoints,
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Update error:', updateError)
    process.exit(1)
  }

  console.log('✅ Success! User mbyd402@gmail.com now has 100 remaining points.')
  process.exit(0)
}

main()
