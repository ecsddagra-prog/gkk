import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function UserDetails({ user }) {
    const router = useRouter()
    const { id } = router.query
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user || !id) return
        checkAccessAndLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, id])

    const checkAccessAndLoad = async () => {
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || profile.role !== 'superadmin') {
                toast.error('Access denied')
                router.push('/admin/dashboard')
                return
            }
            loadUser()
        } catch (error) {
            router.push('/admin/dashboard')
        }
    }

    const loadUser = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setUserData(data)
        } catch (error) {
            console.error('Error loading user:', error)
            toast.error('Failed to load user')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">User not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/users" className="text-white hover:text-purple-200">
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-white">User Details</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            <p className="text-lg font-semibold">{userData.full_name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                            <p className="text-lg font-semibold">{userData.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                            <p className="text-lg font-semibold">{userData.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                            <span className={`inline-block px-3 py-1 text-sm rounded-full ${userData.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                                    userData.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                        userData.role === 'provider' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {userData.role || 'user'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                            <p className="text-lg font-semibold">{new Date(userData.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                            <p className="text-sm text-gray-600 font-mono">{userData.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
