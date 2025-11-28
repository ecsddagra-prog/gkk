import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminUsersManagement({ user }) {
    const router = useRouter()
    const [admins, setAdmins] = useState([])
    const [cities, setCities] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'admin',
        password: '',
        city_id: ''
    })

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        checkSuperAdminAccess()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const checkSuperAdminAccess = async () => {
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || profile.role !== 'superadmin') {
                toast.error('Access denied. Super Admin privileges required.')
                router.push('/admin/dashboard')
                return
            }
            loadAdmins()
            loadCities()
        } catch (error) {
            router.push('/admin/dashboard')
        }
    }

    const loadCities = async () => {
        const { data } = await supabase.from('cities').select('id, name').order('name')
        setCities(data || [])
    }

    const loadAdmins = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await axios.get('/api/admin/admins', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })
            setAdmins(response.data || [])
        } catch (error) {
            console.error('Error loading admins:', error)
            toast.error('Failed to load admin users')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('Session expired')
                return
            }

            await axios.post('/api/admin/admins/create', {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role: formData.role,
                city_id: formData.city_id
            }, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })

            toast.success('Admin user created successfully')
            setShowModal(false)
            setFormData({ email: '', full_name: '', role: 'admin', password: '', city_id: '' })
            loadAdmins()
        } catch (error) {
            console.error('Error creating admin:', error)
            toast.error(error.response?.data?.error || 'Failed to create admin user')
        }
    }

    const toggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'superadmin' : 'admin'

        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error
            toast.success(`Role updated to ${newRole}`)
            loadAdmins()
        } catch (error) {
            toast.error('Failed to update role')
        }
    }

    const updateAdminCity = async (userId, cityId) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ city_id: cityId || null })
                .eq('id', userId)

            if (error) throw error
            toast.success('City assignment updated')
            loadAdmins()
        } catch (error) {
            toast.error('Failed to update city')
        }
    }

    const deleteAdmin = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this admin user?')) return

        try {
            const { error } = await supabase
                .from('users')
                .update({ role: 'user' })
                .eq('id', userId)

            if (error) throw error
            toast.success('Admin privileges revoked')
            loadAdmins()
        } catch (error) {
            toast.error('Failed to revoke admin privileges')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/super-dashboard" className="text-white hover:text-purple-200">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold text-white">Admin User Management</h1>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50"
                        >
                            + Add Admin
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned City</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map(admin => (
                                <tr key={admin.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{admin.full_name || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{admin.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${admin.role === 'superadmin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {admin.role === 'superadmin' ? (
                                            <span className="text-sm text-gray-500">All Cities</span>
                                        ) : (
                                            <select
                                                value={admin.city_id || ''}
                                                onChange={(e) => updateAdminCity(admin.id, e.target.value)}
                                                className="text-sm border-gray-300 rounded-md"
                                            >
                                                <option value="">All Cities</option>
                                                {cities.map(city => (
                                                    <option key={city.id} value={city.id}>{city.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(admin.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleUserRole(admin.id, admin.role)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {admin.role === 'admin' ? 'Promote' : 'Demote'}
                                            </button>
                                            {admin.id !== user?.id && (
                                                <button
                                                    onClick={() => deleteAdmin(admin.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Admin User</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                            {formData.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned City</label>
                                    <select
                                        value={formData.city_id}
                                        onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">All Cities</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                                >
                                    Create Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
