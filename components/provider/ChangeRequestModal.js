import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../ImageUpload'

export default function ChangeRequestModal({ document, onClose, onSuccess }) {
    const [reason, setReason] = useState('')
    const [newDocUrl, setNewDocUrl] = useState('')
    const [newDocNumber, setNewDocNumber] = useState(document.document_number || '')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!reason.trim() || !newDocUrl) {
            toast.error('Please provide a reason and upload the new document')
            return
        }

        try {
            setSubmitting(true)
            const { data: { session } } = await supabase.auth.getSession()

            await axios.post('/api/provider/document-change-request', {
                old_document_id: document.id,
                new_document_url: newDocUrl,
                new_document_number: newDocNumber,
                change_reason: reason
            }, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            toast.success('Change request submitted successfully')
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error submitting change request:', error)
            toast.error(error.response?.data?.error || 'Failed to submit change request')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Request Document Change</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Document Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Current Document</h3>
                        <div className="text-sm text-blue-800">
                            <p><span className="font-medium">Type:</span> {document.document_type}</p>
                            <p><span className="font-medium">Number:</span> {document.document_number}</p>
                            <p><span className="font-medium">Status:</span> Verified</p>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Change <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="E.g., Document expired, incorrect information, better quality scan needed..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Please explain why you need to change this verified document
                        </p>
                    </div>

                    {/* New Document Upload */}
                    <div>
                        <ImageUpload
                            label={`New ${document.document_type} Document *`}
                            value={newDocUrl}
                            onChange={setNewDocUrl}
                        />
                    </div>

                    {/* New Document Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Document Number
                        </label>
                        <input
                            type="text"
                            value={newDocNumber}
                            onChange={(e) => setNewDocNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., XXXX-XXXX-XXXX"
                        />
                    </div>

                    {/* Info Notice */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your current document will remain active until an admin reviews and approves this change request.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Change Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
