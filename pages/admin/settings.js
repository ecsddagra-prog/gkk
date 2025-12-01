import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminSettings({ user }) {
  const router = useRouter()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState('')

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

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [selectedService])

  const loadServices = async () => {
    const { data } = await supabase.from('services').select('id, name').order('name')
    setServices(data || [])
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      // 1. Fetch Global Settings
      const { data: globalData } = await supabase
        .from('admin_settings')
        .select('*')
        .is('service_id', null)

      const finalSettings = {}

      // Populate with global defaults
      globalData?.forEach(setting => {
        finalSettings[setting.key] = { ...setting.value, _isInherited: true }
      })

      // 2. If Service Selected, Fetch & Merge Overrides
      if (selectedService) {
        const { data: serviceData } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('service_id', selectedService)

        serviceData?.forEach(setting => {
          finalSettings[setting.key] = { ...setting.value, _isInherited: false }
        })
      }

      setSettings(finalSettings)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key, value) => {
    try {
      // Check if record exists for this scope
      let query = supabase.from('admin_settings').select('id').eq('key', key)

      if (selectedService) {
        query = query.eq('service_id', selectedService)
      } else {
        query = query.is('service_id', null)
      }

      const { data: existing } = await query.single()

      let error
      if (existing) {
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({
            value,
            updated_by: user.id,
            updated_at: new Date()
          })
          .eq('id', existing.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('admin_settings')
          .insert({
            key,
            value,
            updated_by: user.id,
            service_id: selectedService || null
          })
        error = insertError
      }

      if (error) throw error
      toast.success('Setting updated successfully')
      loadSettings()
    } catch (error) {
      console.error('Update error:', error)
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Configure for:</span>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Global Defaults</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
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
                  {settings.cashback_percentage?._isInherited && selectedService && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Global Default</span>
                  )}
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
                  {settings.reward_points_per_booking?._isInherited && selectedService && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Global Default</span>
                  )}
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
                  {settings.provider_commission?._isInherited && selectedService && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Global Default</span>
                  )}
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
          {/* Booking Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Booking Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Show Online Provider Count
                    {settings.show_provider_count?._isInherited && selectedService && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Global Default</span>
                    )}
                  </label>
                  <p className="text-sm text-gray-500">Show users how many providers are online when booking</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const newValue = !settings.show_provider_count?.value
                      setSettings({
                        ...settings,
                        show_provider_count: { value: newValue }
                      })
                      updateSetting('show_provider_count', { value: newValue })
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.show_provider_count?.value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.show_provider_count?.value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

