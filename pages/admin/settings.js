import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminSettings({ user }) {
  const router = useRouter()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    checkAdminAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const checkAdminAccess = async () => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        router.push('/dashboard')
        return
      }
      loadSettings()
    } catch (error) {
      router.push('/dashboard')
    }
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')

      const settingsObj = {}
      data?.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })
      setSettings(settingsObj)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key, value) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value,
          updated_by: user.id
        })

      if (error) throw error
      toast.success('Setting updated successfully')
      loadSettings()
    } catch (error) {
      toast.error('Failed to update setting')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">Platform Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Cashback Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Cashback Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cashback Percentage (%)
                </label>
                <input
                  type="number"
                  value={settings.cashback_percentage?.value || 5}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      cashback_percentage: { value: parseFloat(e.target.value) }
                    })
                  }}
                  onBlur={() => updateSetting('cashback_percentage', settings.cashback_percentage)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Reward Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Reward Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Points per ₹100
                </label>
                <input
                  type="number"
                  value={settings.reward_points_per_booking?.value || 10}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      reward_points_per_booking: { value: parseFloat(e.target.value) }
                    })
                  }}
                  onBlur={() => updateSetting('reward_points_per_booking', settings.reward_points_per_booking)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Referral Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Referral Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Referral Reward (₹)
                </label>
                <input
                  type="number"
                  value={settings.referral_reward?.user || 100}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      referral_reward: {
                        ...settings.referral_reward,
                        user: parseFloat(e.target.value)
                      }
                    })
                  }}
                  onBlur={() => updateSetting('referral_reward', settings.referral_reward)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Referral Reward (₹)
                </label>
                <input
                  type="number"
                  value={settings.referral_reward?.provider || 200}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      referral_reward: {
                        ...settings.referral_reward,
                        provider: parseFloat(e.target.value)
                      }
                    })
                  }}
                  onBlur={() => updateSetting('referral_reward', settings.referral_reward)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Provider Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Provider Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  value={settings.provider_commission?.value || 15}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      provider_commission: { value: parseFloat(e.target.value) }
                    })
                  }}
                  onBlur={() => updateSetting('provider_commission', settings.provider_commission)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Quality Control Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Quality Control</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Rating Threshold
                </label>
                <input
                  type="number"
                  value={settings.low_rating_threshold?.value || 2}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      low_rating_threshold: { value: parseFloat(e.target.value) }
                    })
                  }}
                  onBlur={() => updateSetting('low_rating_threshold', settings.low_rating_threshold)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="5"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suspension Days
                </label>
                <input
                  type="number"
                  value={settings.suspension_days?.value || 7}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      suspension_days: { value: parseInt(e.target.value) }
                    })
                  }}
                  onBlur={() => updateSetting('suspension_days', settings.suspension_days)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

