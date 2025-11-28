import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function UsersManagement({ user }) {
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterRole, setFilterRole] = useState('all')

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
            loadUsers()
        } catch (error) {
            router.push('/admin/dashboard')
        }
    }

    const loadUsers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await axios.get('/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })
            setUsers(response.data || [])
        } catch (error) {
            console.error('Error loading users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const updateUserRole = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error
            toast.success(`Role updated to ${newRole}`)
            loadUsers()
        } catch (error) {
            toast.error('Failed to update role')
        }
    }

    const filteredUsers = users.filter(u => {
        if (filterRole === 'all') return true
        return u.role === filterRole
    })

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
                            <h1 className="text-2xl font-bold text-white">User Management</h1>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-3 py-2 border border-white/30 rounded-lg bg-white/20 text-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">Users</option>
                                <option value="provider">Providers</option>
                                <option value="admin">Admins</option>
                                <option value="superadmin">Super Admins</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Total Users: {filteredUsers.length}</p>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{u.full_name || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{u.phone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={u.role || 'user'}
                                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                                            className="text-sm border-gray-300 rounded-md"
                                        >
                                            <option value="user">User</option>
                                            <option value="provider">Provider</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:text-blue-900">
                                            View Details
                                        </Link>
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
