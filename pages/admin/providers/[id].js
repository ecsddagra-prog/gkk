import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabase'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProviderDetails({ user }) {
    const router = useRouter()
    const { id } = router.query
    const [loading, setLoading] = useState(true)
    const [provider, setProvider] = useState(null)
    const [documents, setDocuments] = useState([])
    const [rejectReason, setRejectReason] = useState('')
    const [rejectingDocId, setRejectingDocId] = useState(null)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        if (id) {
            checkAdminAccess()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, id])

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
            loadProviderDetails()
        } catch (error) {
            router.push('/dashboard')
        }
    }

    const loadProviderDetails = async () => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const { data } = await axios.get(`/api/admin/providers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setProvider(data.provider)
            setDocuments(data.documents)
        } catch (error) {
            console.error('Error loading details:', error)
            toast.error('Failed to load provider details')
        } finally {
            setLoading(false)
        }
    }

    const updateProviderStatus = async (isVerified) => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            await axios.put(`/api/admin/providers/${id}`, {
                action: 'update_status',
                is_verified: isVerified
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setProvider(prev => ({ ...prev, is_verified: isVerified }))
            toast.success(`Provider ${isVerified ? 'verified' : 'unverified'}`)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const updateDocumentStatus = async (docId, status, reason = null) => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            await axios.put(`/api/admin/providers/${id}`, {
                action: 'update_document',
                documentId: docId,
                status,
                rejectionReason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setDocuments(prev => prev.map(doc =>
                doc.id === docId ? { ...doc, status, rejection_reason: reason } : doc
            ))

            if (status === 'rejected') {
                setRejectingDocId(null)
                setRejectReason('')
            }

            toast.success(`Document ${status}`)
        } catch (error) {
            toast.error('Failed to update document')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!provider) return <div className="p-8 text-center">Provider not found</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/providers" className="text-blue-600 hover:text-blue-700">
                                ← Back to List
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Provider Details</h1>
                        </div>
                        <div className="flex gap-3">
                            {provider.is_verified ? (
                                <button
                                    onClick={() => updateProviderStatus(false)}
                                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                                >
                                    Revoke Verification
                                </button>
                            ) : (
                                <button
                                    onClick={() => updateProviderStatus(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Approve Provider
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">Business Name</label>
                                    <div className="font-medium">{provider.business_name}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Provider Name</label>
                                    <div className="font-medium">{provider.user?.full_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <div className="font-medium">{provider.user?.email}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Phone</label>
                                    <div className="font-medium">{provider.user?.phone}</div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Status</label>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 text-xs rounded-full ${provider.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {provider.is_verified ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Documents */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Submitted Documents</h2>

                        {documents.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                                No documents submitted yet.
                            </div>
                        ) : (
                            documents.map(doc => (
                                <div key={doc.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                        <div>
                                            <h3 className="font-semibold capitalize">{doc.document_type.replace('_', ' ')}</h3>
                                            <p className="text-xs text-gray-500">
                                                Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {doc.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {/* Metadata Display */}
                                        {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                                            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                                                {Object.entries(doc.metadata).map(([key, value]) => (
                                                    <div key={key}>
                                                        <span className="text-gray-500 capitalize">{key.replace('_', ' ')}: </span>
                                                        <span className="font-medium">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Document Preview */}
                                        {doc.document_url && (
                                            <div className="mb-4">
                                                <a
                                                    href={doc.document_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden border hover:opacity-95 transition"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={doc.document_url}
                                                        alt={doc.document_type}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </a>
                                                <div className="mt-2 text-center">
                                                    <a
                                                        href={doc.document_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        View Full Size
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {doc.status === 'rejected' && doc.rejection_reason && (
                                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                                                <strong>Reason for rejection:</strong> {doc.rejection_reason}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex justify-end gap-3 pt-4 border-t">
                                            {rejectingDocId === doc.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        placeholder="Reason for rejection..."
                                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                                    />
                                                    <button
                                                        onClick={() => updateDocumentStatus(doc.id, 'rejected', rejectReason)}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                                    >
                                                        Confirm Reject
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setRejectingDocId(null)
                                                            setRejectReason('')
                                                        }}
                                                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {doc.status !== 'approved' && (
                                                        <button
                                                            onClick={() => updateDocumentStatus(doc.id, 'approved')}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                                        >
                                                            Approve Document
                                                        </button>
                                                    )}
                                                    {doc.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => setRejectingDocId(doc.id)}
                                                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
