import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../ImageUpload'

export default function StaffManagement() {
    const [loading, setLoading] = useState(true)
    const [staff, setStaff] = useState([])
    const [newStaff, setNewStaff] = useState({
        full_name: '',
        phone: '',
        role: 'helper',
        id_proof_url: ''
    })
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.get('/api/provider/staff', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            setStaff(response.data.staff)
        } catch (error) {
            console.error('Error fetching staff:', error)
            toast.error('Failed to load staff')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!newStaff.full_name || !newStaff.phone) return

        try {
            setAdding(true)
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.post('/api/provider/staff', newStaff, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setStaff([response.data.item, ...staff])
            setNewStaff({ full_name: '', phone: '', role: 'helper', id_proof_url: '' })
            toast.success('Staff member added')
        } catch (error) {
            console.error('Error adding staff:', error)
            toast.error('Failed to add staff')
        } finally {
            setAdding(false)
        }
    }

    const handleUpdate = async (member, updates) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/staff', { ...member, ...updates }, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setStaff(staff.map(s => s.id === member.id ? { ...s, ...updates } : s))
            toast.success('Staff updated')
        } catch (error) {
            console.error('Error updating staff:', error)
            toast.error('Failed to update staff')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.delete(`/api/provider/staff?id=${id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setStaff(staff.filter(s => s.id !== id))
            toast.success('Staff member removed')
        } catch (error) {
            console.error('Error removing staff:', error)
            toast.error('Failed to remove staff')
        }
    }

    if (loading) return <div className="p-4">Loading staff...</div>

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Add New Staff</h3>

                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            value={newStaff.full_name}
                            onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Rahul Kumar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. 9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={newStaff.role}
                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="helper">Helper</option>
                            <option value="electrician">Electrician</option>
                            <option value="plumber">Plumber</option>
                            <option value="driver">Driver</option>
                            <option value="manager">Manager</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <ImageUpload
                            label="ID Proof"
                            value={newStaff.id_proof_url}
                            onChange={(url) => setNewStaff({ ...newStaff, id_proof_url: url })}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={adding}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {adding ? 'Adding...' : 'Add Staff Member'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Staff List</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map(member => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.full_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize text-gray-500">{member.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{member.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleUpdate(member, { is_active: !member.is_active })}
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {member.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Remove</button>
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No staff members added</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
