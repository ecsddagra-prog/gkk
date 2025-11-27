import { supabaseAdmin } from '../../../lib/supabase'
import { generateReferralCode, validateEmail, validatePhone } from '../../../lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client not configured' })
  }

  try {
    const { email, phone, password, full_name, role = 'user', referred_by } = req.body

    // Validation
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email || undefined,
      phone: phone || undefined,
      password,
      email_confirm: true,
      phone_confirm: true
    })

    if (authError) throw authError

    // Generate referral code
    const referralCode = generateReferralCode(authData.user.id)

    // Create user profile
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email || null,
        phone: phone || null,
        full_name,
        role,
        referral_code: referralCode,
        referred_by: referred_by || null
      })
      .select()
      .single()

    if (userError) {
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw userError
    }

    // Handle referral if applicable
    if (referred_by) {
      const { data: settings } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'referral_reward')
        .single()

      const rewardAmount = settings?.value?.user || 100

      // Add referral record
      await supabaseAdmin
        .from('referrals')
        .insert({
          referrer_id: referred_by,
          referred_id: authData.user.id,
          referral_code: userData.referral_code,
          reward_amount: rewardAmount
        })

      // Add reward to referrer's wallet
      await supabaseAdmin.rpc('add_wallet_balance', {
        user_id: referred_by,
        amount: rewardAmount,
        transaction_type: 'reward'
      })
    }

    return res.status(201).json({
      user: userData,
      auth: authData
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: error.message })
  }
}

