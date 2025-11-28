import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminServiceRequests({ user }) {
    const router = useRouter()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, pending, approved, rejected

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        checkAdminAccess()
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
            loadData()
        } catch (error) {
            router.push('/dashboard')
        }
    }

    const loadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const { data } = await axios.get('/api/admin/service-requests', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            setRequests(data.requests || [])
        } catch (error) {
            console.error('Error loading requests:', error)
            toast.error('Failed to load service requests')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/admin/service-requests', {
                id,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success(`Request ${newStatus} successfully`)
            loadData()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.delete(`/api/admin/service-requests?id=${id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Request deleted successfully')
            loadData()
        } catch (error) {
            console.error('Error deleting request:', error)
            toast.error('Failed to delete request')
        }
    }

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
                            <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">← Back</Link>
                            <h1 className="text-2xl font-bold text-blue-600">Service Requests</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Manage Requests</h2>
                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Requests</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{req.providers?.business_name || 'Unknown Provider'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{req.service_name}</div>
                                            <div className="text-xs text-gray-500">Category: {req.service_categories?.name || 'Unspecified'}</div>
                                            {req.description && (
                                                <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={req.description}>
                                                    {req.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'approved')}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-50 px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
