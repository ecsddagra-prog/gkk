import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminProviders({ user }) {
  const router = useRouter()
  const [providers, setProviders] = useState([])
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
      loadProviders()
    } catch (error) {
      router.push('/dashboard')
    }
  }

  const loadProviders = async () => {
    try {
      const { data } = await supabase
        .from('providers')
        .select('*, user:users(*)')
        .order('created_at', { ascending: false })

      setProviders(data || [])
    } catch (error) {
      console.error('Error loading providers:', error)
      toast.error('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  const toggleVerification = async (providerId, currentStatus) => {
    try {
      await supabase
        .from('providers')
        .update({ is_verified: !currentStatus })
        .eq('id', providerId)

      toast.success(`Provider ${!currentStatus ? 'verified' : 'unverified'}`)
      loadProviders()
    } catch (error) {
      toast.error('Failed to update verification status')
    }
  }

  const toggleSuspension = async (providerId, currentStatus) => {
    try {
      await supabase
        .from('providers')
        .update({ 
          is_suspended: !currentStatus,
          suspension_until: !currentStatus ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', providerId)

      toast.success(`Provider ${!currentStatus ? 'suspended' : 'unsuspended'}`)
      loadProviders()
    } catch (error) {
      toast.error('Failed to update suspension status')
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
              <h1 className="text-2xl font-bold text-blue-600">Manage Providers</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providers.map(provider => (
                <tr key={provider.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{provider.user?.full_name}</div>
                    <div className="text-sm text-gray-500">{provider.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.business_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {provider.average_rating ? `${provider.average_rating.toFixed(1)} ⭐` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provider.total_jobs_completed || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full block ${
                        provider.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {provider.is_verified ? 'Verified' : 'Pending'}
                      </span>
                      {provider.is_suspended && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 block">
                          Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleVerification(provider.id, provider.is_verified)}
                      className={`${
                        provider.is_verified ? 'text-yellow-600' : 'text-green-600'
                      } hover:underline`}
                    >
                      {provider.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => toggleSuspension(provider.id, provider.is_suspended)}
                      className={`${
                        provider.is_suspended ? 'text-green-600' : 'text-red-600'
                      } hover:underline`}
                    >
                      {provider.is_suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

