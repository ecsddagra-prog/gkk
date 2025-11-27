import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../ImageUpload'

export default function DocumentUpload() {
    const [loading, setLoading] = useState(true)
    const [documents, setDocuments] = useState([])
    const [newDoc, setNewDoc] = useState({
        document_type: 'aadhar',
        document_number: '',
        document_url: ''
    })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.get('/api/provider/documents', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            setDocuments(response.data.documents)
        } catch (error) {
            console.error('Error fetching documents:', error)
            toast.error('Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!newDoc.document_url) return

        try {
            setUploading(true)
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.post('/api/provider/documents', newDoc, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setDocuments([response.data.item, ...documents])
            setNewDoc({ document_type: 'aadhar', document_number: '', document_url: '' })
            toast.success('Document uploaded successfully')
        } catch (error) {
            console.error('Error uploading document:', error)
            toast.error('Failed to upload document')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this document?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.delete(`/api/provider/documents?id=${id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setDocuments(documents.filter(d => d.id !== id))
            toast.success('Document deleted')
        } catch (error) {
            console.error('Error deleting document:', error)
            toast.error('Failed to delete document')
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Verified</span>
            case 'rejected':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
        }
    }

    if (loading) return <div className="p-4">Loading documents...</div>

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Upload New Document</h3>

                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                        <select
                            value={newDoc.document_type}
                            onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="aadhar">Aadhar Card</option>
                            <option value="pan">PAN Card</option>
                            <option value="certificate">Skill Certificate</option>
                            <option value="license">Trade License</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
                        <input
                            type="text"
                            required
                            value={newDoc.document_number}
                            onChange={(e) => setNewDoc({ ...newDoc, document_number: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. XXXX-XXXX-XXXX"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <ImageUpload
                            label="Document Image"
                            value={newDoc.document_url}
                            onChange={(url) => setNewDoc({ ...newDoc, document_url: url })}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map(doc => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{doc.document_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doc.document_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(doc.status)}
                                    {doc.status === 'rejected' && doc.rejection_reason && (
                                        <div className="text-xs text-red-600 mt-1">{doc.rejection_reason}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 mr-4">View</a>
                                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No documents uploaded</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
