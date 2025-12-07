import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { FileText, Upload, Eye, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, Button, FormInput, FormSelect, LoadingSkeleton, Badge, StatusBadge } from '../shared'
import ImageUpload from '../ImageUpload'
import ChangeRequestModal from './ChangeRequestModal'
import styles from '../../styles/DocumentUpload.module.css'
import { formatDate } from '../../lib/utils'

export default function DocumentUpload() {
    const [loading, setLoading] = useState(true)
    const [documents, setDocuments] = useState([])
    const [newDoc, setNewDoc] = useState({
        document_type: 'aadhar',
        document_number: '',
        document_url: ''
    })
    const [uploading, setUploading] = useState(false)
    const [changeRequestModal, setChangeRequestModal] = useState({ open: false, document: null })

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
        if (!newDoc.document_url) {
            toast.error('Please upload a document image')
            return
        }

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

    const openChangeRequestModal = (doc) => {
        setChangeRequestModal({ open: true, document: doc })
    }

    const closeChangeRequestModal = () => {
        setChangeRequestModal({ open: false, document: null })
    }

    const handleChangeRequestSuccess = () => {
        fetchDocuments()
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <LoadingSkeleton variant="rect" width="100%" height="400px" />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Upload New Document Card */}
            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Upload size={20} style={{ color: 'var(--color-primary-600)' }} />
                        <CardTitle>Upload New Document</CardTitle>
                    </div>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleUpload} className={styles.uploadForm}>
                        <div className={styles.formRow}>
                            <FormSelect
                                label="Document Type"
                                value={newDoc.document_type}
                                onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                                options={[
                                    { value: 'aadhar', label: 'Aadhar Card' },
                                    { value: 'pan', label: 'PAN Card' },
                                    { value: 'certificate', label: 'Skill Certificate' },
                                    { value: 'license', label: 'Trade License' },
                                    { value: 'other', label: 'Other' }
                                ]}
                            />

                            <FormInput
                                label="Document Number"
                                type="text"
                                value={newDoc.document_number}
                                onChange={(e) => setNewDoc({ ...newDoc, document_number: e.target.value })}
                                placeholder="e.g. XXXX-XXXX-XXXX"
                                required
                            />
                        </div>

                        <div className={styles.uploadSection}>
                            <ImageUpload
                                label="Document Image"
                                value={newDoc.document_url}
                                onChange={(url) => setNewDoc({ ...newDoc, document_url: url })}
                            />
                        </div>

                        <div className={styles.formActions}>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={uploading}
                                disabled={!newDoc.document_url}
                            >
                                <Upload size={18} />
                                Upload Document
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* Uploaded Documents Card */}
            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <FileText size={20} style={{ color: 'var(--color-primary-600)' }} />
                        <CardTitle>Uploaded Documents</CardTitle>
                    </div>
                </CardHeader>
                <CardBody>
                    {documents.length > 0 ? (
                        <div className={styles.documentsList}>
                            {documents.map(doc => (
                                <div key={doc.id} className={styles.documentCard}>
                                    <div className={styles.documentHeader}>
                                        <div className={styles.documentInfo}>
                                            <h4 className={styles.documentType}>{doc.document_type}</h4>
                                            <p className={styles.documentNumber}>{doc.document_number}</p>
                                        </div>
                                        <StatusBadge status={doc.status} />
                                    </div>

                                    {doc.status === 'rejected' && doc.rejection_reason && (
                                        <div className={styles.rejectionReason}>
                                            <AlertCircle size={14} />
                                            <span>{doc.rejection_reason}</span>
                                        </div>
                                    )}

                                    <div className={styles.documentFooter}>
                                        <span className={styles.documentDate}>
                                            <Clock size={14} />
                                            {formatDate(doc.created_at)}
                                        </span>
                                        <div className={styles.documentActions}>
                                            <a
                                                href={doc.document_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewLink}
                                            >
                                                <Eye size={16} />
                                                View
                                            </a>
                                            {doc.status === 'verified' ? (
                                                <button
                                                    onClick={() => openChangeRequestModal(doc)}
                                                    className={styles.changeButton}
                                                >
                                                    Request Change
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className={styles.deleteButton}
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📄</div>
                            <h3 className={styles.emptyTitle}>No Documents Uploaded</h3>
                            <p className={styles.emptyText}>
                                Upload your documents for verification to start accepting bookings
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Change Request Modal */}
            {changeRequestModal.open && (
                <ChangeRequestModal
                    document={changeRequestModal.document}
                    onClose={closeChangeRequestModal}
                    onSuccess={handleChangeRequestSuccess}
                />
            )}
        </div>
    )
}
