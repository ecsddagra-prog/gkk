import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { MapPin, Navigation, Circle, Target, Edit2, Trash2 } from 'lucide-react'
import { Button, Card, Badge, Modal, ModalFooter, FormInput, LoadingSkeleton } from '../shared'
import styles from '../../styles/LocationManagement.module.css'

export default function LocationManagement() {
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState({
        service_radius_km: 10,
        is_fixed_location: false,
        fixed_location_lat: null,
        fixed_location_lng: null,
        fixed_location_address: '',
        is_online: false,
        current_lat: null,
        current_lng: null
    })
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState({
        address: '',
        radius: 10
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('Please log in to continue')
                return
            }

            const res = await fetch('/api/provider/location', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })

            if (!res.ok) {
                const errorData = await res.text()
                console.error('API Error:', errorData)
                throw new Error(`Failed to fetch settings: ${res.status}`)
            }

            const data = await res.json()

            if (data) {
                setSettings({
                    service_radius_km: Number(data.service_radius_km) || 10,
                    is_fixed_location: Boolean(data.is_fixed_location),
                    fixed_location_lat: data.fixed_location_lat ? Number(data.fixed_location_lat) : null,
                    fixed_location_lng: data.fixed_location_lng ? Number(data.fixed_location_lng) : null,
                    fixed_location_address: data.fixed_location_address || '',
                    is_online: Boolean(data.is_online),
                    current_lat: data.current_lat ? Number(data.current_lat) : null,
                    current_lng: data.current_lng ? Number(data.current_lng) : null
                })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Failed to load location settings')
        } finally {
            setLoading(false)
        }
    }

    const toggleOnlineStatus = async () => {
        try {
            const newStatus = !settings.is_online
            const token = (await supabase.auth.getSession()).data.session?.access_token

            const res = await fetch('/api/provider/location', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude: settings.current_lat || settings.fixed_location_lat,
                    longitude: settings.current_lng || settings.fixed_location_lng,
                    is_online: newStatus
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to update status')
            }

            setSettings(prev => ({ ...prev, is_online: newStatus }))
            toast.success(`You are now ${newStatus ? 'online' : 'offline'}`)
        } catch (error) {
            console.error('Error toggling online status:', error)
            toast.error(error.message || 'Failed to update status')
        }
    }

    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const token = (await supabase.auth.getSession()).data.session?.access_token
                    await fetch('/api/provider/location', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            is_online: settings.is_online
                        })
                    })

                    setSettings(prev => ({
                        ...prev,
                        current_lat: position.coords.latitude,
                        current_lng: position.coords.longitude
                    }))
                    toast.success('Location updated')
                } catch (error) {
                    toast.error('Failed to update location')
                }
            },
            () => toast.error('Unable to get location')
        )
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token
            const res = await fetch('/api/provider/location', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    service_radius_km: editForm.radius,
                    fixed_location_address: editForm.address,
                    is_fixed_location: editForm.address ? true : false
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to update settings')
            }

            toast.success('Location settings updated successfully')
            setShowEditModal(false)
            fetchSettings()
        } catch (error) {
            console.error('Error updating settings:', error)
            toast.error(error.message || 'Failed to update settings')
        }
    }

    if (loading) {
        return (
            <div className={styles.locationContainer}>
                <LoadingSkeleton variant="rect" width="100%" height="400px" />
            </div>
        )
    }

    return (
        <div className={styles.locationContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Location Management</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: settings.is_online ? 'var(--color-emerald-600)' : 'var(--color-text-tertiary)'
                        }}>
                            {settings.is_online ? '🟢 Online' : '⚫ Offline'}
                        </span>
                        <button
                            onClick={toggleOnlineStatus}
                            className={`${styles.toggleSwitch} ${settings.is_online ? styles.active : ''}`}
                            aria-label="Toggle online status"
                        >
                            <span className={styles.toggleKnob}></span>
                        </button>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditForm({
                                address: settings.fixed_location_address,
                                radius: settings.service_radius_km
                            })
                            setShowEditModal(true)
                        }}
                    >
                        Edit Settings
                    </Button>
                </div>
            </div>

            {/* Location Cards */}
            <div className={styles.locationsGrid}>
                {/* Current Location Card */}
                <Card className={styles.locationCard}>
                    <div className={styles.locationHeader}>
                        <div className={styles.locationInfo}>
                            <h3 className={styles.locationName}>
                                <Navigation size={20} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                                Current Location
                            </h3>
                        </div>
                        <Badge variant={settings.is_online ? 'success' : 'neutral'}>
                            {settings.is_online ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    <div className={styles.locationDetails}>
                        {settings.current_lat && settings.current_lng ? (
                            <>
                                <div className={styles.detailRow}>
                                    <MapPin size={16} className={styles.detailIcon} />
                                    <span className={styles.detailLabel}>Latitude:</span>
                                    <span className={styles.detailValue}>{settings.current_lat.toFixed(6)}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <MapPin size={16} className={styles.detailIcon} />
                                    <span className={styles.detailLabel}>Longitude:</span>
                                    <span className={styles.detailValue}>{settings.current_lng.toFixed(6)}</span>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                                No location data available
                            </p>
                        )}
                    </div>

                    <div className={styles.cardActions}>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={getCurrentPosition}
                            style={{ width: '100%' }}
                        >
                            📍 Update Location
                        </Button>
                    </div>
                </Card>

                {/* Service Area Card */}
                <Card className={styles.locationCard}>
                    <div className={styles.locationHeader}>
                        <div className={styles.locationInfo}>
                            <h3 className={styles.locationName}>
                                <Circle size={20} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                                Service Area
                            </h3>
                        </div>
                        <div className={styles.radiusBadge}>
                            <Target size={14} />
                            {settings.service_radius_km} km
                        </div>
                    </div>

                    <div className={styles.locationDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Radius:</span>
                            <span className={styles.detailValue}>{settings.service_radius_km} km</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Coverage:</span>
                            <span className={styles.detailValue}>
                                ~{(Math.PI * Math.pow(settings.service_radius_km, 2)).toFixed(1)} km²
                            </span>
                        </div>
                        <p style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            marginTop: 'var(--space-2)'
                        }}>
                            You can accept bookings within this radius from your current location
                        </p>
                    </div>
                </Card>

                {/* Base/Fixed Location Card */}
                {settings.is_fixed_location && settings.fixed_location_address && (
                    <Card className={styles.locationCard}>
                        <div className={styles.locationHeader}>
                            <div className={styles.locationInfo}>
                                <h3 className={styles.locationName}>
                                    <MapPin size={20} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                                    Base Location
                                </h3>
                            </div>
                            <Badge variant="info">Fixed</Badge>
                        </div>

                        <p className={styles.locationAddress}>{settings.fixed_location_address}</p>

                        <div className={styles.locationDetails}>
                            {settings.fixed_location_lat && settings.fixed_location_lng && (
                                <>
                                    <div className={styles.detailRow}>
                                        <MapPin size={16} className={styles.detailIcon} />
                                        <span className={styles.detailLabel}>Coordinates:</span>
                                        <span className={styles.detailValue}>
                                            {settings.fixed_location_lat.toFixed(4)}, {settings.fixed_location_lng.toFixed(4)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.cardActions}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEditForm({
                                        address: settings.fixed_location_address,
                                        radius: settings.service_radius_km
                                    })
                                    setShowEditModal(true)
                                }}
                            >
                                <Edit2 size={16} />
                                Edit
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Empty State if no fixed location */}
            {!settings.is_fixed_location && !settings.fixed_location_address && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🗺️</div>
                    <h3 className={styles.emptyTitle}>No base location set</h3>
                    <p className={styles.emptyText}>
                        Set a fixed base location if you operate from a shop or office
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditForm({ address: '', radius: settings.service_radius_km })
                            setShowEditModal(true)
                        }}
                    >
                        Set Base Location
                    </Button>
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Location Settings"
                size="md"
            >
                <form onSubmit={handleEditSubmit}>
                    <div className={styles.formSection}>
                        <h4 className={styles.formSectionTitle}>Service Radius</h4>
                        <div className={styles.rangeInput}>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={editForm.radius}
                                onChange={(e) => setEditForm({ ...editForm, radius: Number(e.target.value) })}
                            />
                            <div className={styles.rangeValue}>{editForm.radius} km</div>
                            <p style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-tertiary)',
                                marginTop: 'var(--space-2)'
                            }}>
                                How far are you willing to travel for service calls?
                            </p>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h4 className={styles.formSectionTitle}>Base Location (Optional)</h4>
                        <FormInput
                            label="Address"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            placeholder="Enter your shop/office address..."
                            helpText="Set this if you operate from a fixed location"
                        />
                    </div>

                    <ModalFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Save Changes
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    )
}
