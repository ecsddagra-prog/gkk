import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Wrench, DollarSign, CheckCircle2, XCircle } from 'lucide-react'
import { Button, Card, Badge, Modal, ModalFooter, FormInput, FormSelect, LoadingSkeleton, UnitSelector } from '../shared'
import styles from '../../styles/ServiceManagement.module.css'

export default function ServiceManagement() {
    const [services, setServices] = useState([])
    const [requests, setRequests] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [showAllServices, setShowAllServices] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [requestForm, setRequestForm] = useState({
        service_name: '',
        category_id: '',
        description: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers = { Authorization: `Bearer ${session?.access_token}` }

            const [servicesRes, requestsRes, categoriesRes] = await Promise.all([
                axios.get('/api/provider/services', { headers }),
                axios.get('/api/provider/service-requests', { headers }).catch(() => ({ data: { requests: [] } })),
                axios.get('/api/catalog/categories').catch(() => ({ data: { categories: [] } }))
            ])

            setServices(servicesRes.data.services)
            setRequests(requestsRes.data.requests || [])
            setCategories(categoriesRes.data.categories || [])
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load services')
        } finally {
            setLoading(false)
        }
    }

    const filteredServices = (showAllServices ? services : services.filter(s => s.is_enabled))
        .filter(s => !selectedCategory || s.category_id === selectedCategory)

    const handleUpdate = async (service) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const sub_service_rates = service.subservices?.map(sub => ({
                sub_service_id: sub.id,
                rate: sub.provider_rate || sub.base_charge,
                pricing_unit: sub.pricing_unit || 'job'
            })) || []

            await axios.put('/api/provider/services', {
                service_id: service.id,
                is_enabled: service.is_enabled,
                base_price: service.provider_price,
                inspection_fee: service.inspection_fee,
                emergency_fee: service.emergency_fee,
                pricing_unit: service.pricing_unit || 'job',
                sub_service_rates
            }, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            // Update individual service unit if changed locally (though currently handled via sub_service_rates for sub services)
            // Ideally we should send the service unit too.
            // Let's assume the API will be updated to accept `pricing_unit` for the main service as well.
            // For now, I will add pricing_unit to the body above in a separate step or modify the object passed.
            // But wait, I need to send pricing_unit in the PUT request.
            // Correcting the PUT request payload in the next chunk.
            toast.success('Service updated successfully')
        } catch (error) {
            console.error('Error updating service:', error)
            toast.error('Failed to update service')
        }
    }

    const handleChange = (id, field, value) => {
        setServices(services.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ))
    }

    const handleSubServiceChange = (serviceId, subServiceId, field, value) => {
        setServices(services.map(s => {
            if (s.id === serviceId) {
                return {
                    ...s,
                    subservices: s.subservices.map(sub =>
                        sub.id === subServiceId
                            ? {
                                ...sub,
                                [field === 'rate' ? 'provider_rate' : 'pricing_unit']: field === 'rate' ? value : value
                            }
                            : sub
                    )
                }
            }
            return s
        }))
    }

    const handleRequestSubmit = async (e) => {
        e.preventDefault()
        if (!requestForm.service_name) {
            toast.error('Service name is required')
            return
        }

        setSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.post('/api/provider/service-requests', requestForm, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Request submitted successfully')
            setShowRequestModal(false)
            setRequestForm({ service_name: '', category_id: '', description: '' })
            fetchData()
        } catch (error) {
            console.error('Error submitting request:', error)
            toast.error('Failed to submit request')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.servicesContainer}>
                <LoadingSkeleton variant="rect" width="100%" height="400px" />
            </div>
        )
    }

    return (
        <div className={styles.servicesContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.pageTitle}>
                        {showAllServices ? 'All Available Services' : 'My Services'}
                    </h2>
                    <div className={styles.filterGroup}>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="select"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllServices(!showAllServices)}
                        >
                            {showAllServices ? 'My Services Only' : 'Browse All'}
                        </Button>
                    </div>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowRequestModal(true)}
                >
                    Request New Service
                </Button>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🛠️</div>
                    <h3 className={styles.emptyTitle}>No services found</h3>
                    <p className={styles.emptyText}>
                        {showAllServices
                            ? 'No services available in this category'
                            : 'Enable some services to get started'
                        }
                    </p>
                </div>
            ) : (
                <div className={styles.servicesGrid}>
                    {filteredServices.map(service => (
                        <Card key={service.id} className={`${styles.serviceCard} ${!service.is_enabled ? styles.disabled : ''}`}>
                            <div className={styles.serviceHeader}>
                                <div className={styles.serviceInfo}>
                                    <h3 className={styles.serviceName}>{service.name}</h3>
                                    <p className={styles.categoryName}>{service.service_categories?.name}</p>
                                </div>
                                <button
                                    onClick={() => handleChange(service.id, 'is_enabled', !service.is_enabled)}
                                    className={`${styles.toggleSwitch} ${service.is_enabled ? styles.active : ''}`}
                                    title={service.is_enabled ? 'Enabled' : 'Disabled'}
                                >
                                    <span className={styles.toggleKnob}></span>
                                </button>
                            </div>

                            <div className={styles.pricingSection}>
                                <div className={styles.pricingGrid}>
                                    <div className={styles.priceInput}>
                                        <label className={styles.priceLabel}>Minimum Rate</label>
                                        <div className={styles.priceInputField}>
                                            <span className={styles.currency}>₹</span>
                                            <input
                                                type="number"
                                                value={service.provider_price || ''}
                                                onChange={(e) => handleChange(service.id, 'provider_price', parseFloat(e.target.value))}
                                                disabled={!service.is_enabled}
                                                placeholder="0"
                                            />
                                            <UnitSelector
                                                value={service.pricing_unit || 'job'}
                                                onChange={() => { }}
                                                disabled={true}
                                                className="ml-auto"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.priceInput}>
                                        <label className={styles.priceLabel}>Inspection Fee</label>
                                        <div className={styles.priceInputField}>
                                            <span className={styles.currency}>₹</span>
                                            <input
                                                type="number"
                                                value={service.inspection_fee || ''}
                                                onChange={(e) => handleChange(service.id, 'inspection_fee', parseFloat(e.target.value))}
                                                disabled={!service.is_enabled}
                                                placeholder="0"
                                            />
                                            <span className="text-sm text-gray-500">Per Visit</span>
                                        </div>
                                    </div>
                                    <div className={styles.priceInput}>
                                        <label className={styles.priceLabel}>Emergency Fee</label>
                                        <div className={styles.priceInputField}>
                                            <span className={styles.currency}>₹</span>
                                            <input
                                                type="number"
                                                value={service.emergency_fee || ''}
                                                onChange={(e) => handleChange(service.id, 'emergency_fee', parseFloat(e.target.value))}
                                                disabled={!service.is_enabled}
                                                placeholder="0"
                                            />
                                            <span className="text-sm text-gray-500">Extra</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-services */}
                                {service.subservices && service.subservices.length > 0 && (
                                    <div className={styles.subServices}>
                                        <div className={styles.subServicesTitle}>Sub-services</div>
                                        <div className={styles.subServicesList}>
                                            {service.subservices.map(sub => (
                                                <div key={sub.id} className={styles.subServiceItem}>
                                                    <span className={styles.subServiceName}>• {sub.name}</span>
                                                    <div className={styles.subServiceRate}>
                                                        <div className={styles.priceInputField}>
                                                            <span className={styles.currency}>₹</span>
                                                            <input
                                                                type="number"
                                                                value={sub.provider_rate !== null ? sub.provider_rate : ''}
                                                                onChange={(e) => handleSubServiceChange(service.id, sub.id, 'rate', e.target.value)}
                                                                placeholder="0"
                                                                disabled={!service.is_enabled}
                                                            />
                                                            <UnitSelector
                                                                value={sub.pricing_unit || 'job'}
                                                                onChange={() => { }}
                                                                disabled={true}
                                                                className="ml-auto"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardActions}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleUpdate(service)}
                                    // disabled={!service.is_enabled} // Fixed: Allow saving even if disabled
                                    style={{ width: '100%' }}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Service Requests */}
            {requests.length > 0 && (
                <div className={styles.requestsSection}>
                    <h3 className={styles.sectionTitle}>My Service Requests</h3>
                    <Card>
                        <table className={styles.requestsTable}>
                            <thead>
                                <tr>
                                    <th>Service Name</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td>{req.service_name}</td>
                                        <td>{categories.find(c => c.id === req.category_id)?.name || '-'}</td>
                                        <td>
                                            <Badge variant={
                                                req.status === 'approved' ? 'success' :
                                                    req.status === 'rejected' ? 'error' :
                                                        'warning'
                                            }>
                                                {req.status}
                                            </Badge>
                                        </td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {/* Request Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                title="Request New Service"
                size="sm"
            >
                <form onSubmit={handleRequestSubmit}>
                    <FormInput
                        label="Service Name"
                        value={requestForm.service_name}
                        onChange={(e) => setRequestForm({ ...requestForm, service_name: e.target.value })}
                        required
                        placeholder="e.g. AC Installation"
                    />
                    <FormSelect
                        label="Category"
                        value={requestForm.category_id}
                        onChange={(e) => setRequestForm({ ...requestForm, category_id: e.target.value })}
                        options={[
                            { value: '', label: 'Select Category' },
                            ...categories.map(c => ({ value: c.id, label: c.name }))
                        ]}
                    />
                    <FormInput
                        label="Description"
                        value={requestForm.description}
                        onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                        placeholder="Optional details..."
                        type="textarea"
                        rows={3}
                    />
                    <ModalFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowRequestModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting}>
                            Submit Request
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    )
}
