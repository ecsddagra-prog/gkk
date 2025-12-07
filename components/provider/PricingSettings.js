import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { DollarSign, TrendingUp, Percent } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, Button, FormInput, FormSelect, LoadingSkeleton } from '../shared'
import styles from '../../styles/PricingSettings.module.css'

export default function PricingSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        travel_charge_type: 'per_km',
        travel_charge_amount: 0,
        free_travel_radius_km: 0,
        enable_travel_charges: false,
        enable_rental_charges: false,
        gst_enabled: false,
        gst_percentage: 18
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.get('/api/provider/pricing', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            setSettings(response.data)
        } catch (error) {
            console.error('Error fetching pricing settings:', error)
            toast.error('Failed to load pricing settings')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        setSaving(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/pricing', settings, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Pricing settings updated successfully!')
        } catch (error) {
            console.error('Error updating settings:', error)
            toast.error('Failed to update settings')
        } finally {
            setSaving(false)
        }
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
            {/* Travel Charges Card */}
            <Card>
                <CardHeader>
                    <div className={styles.cardHeaderRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <DollarSign size={20} className={styles.cardIcon} />
                            <CardTitle>Travel Charges</CardTitle>
                        </div>
                        <div className={styles.toggleWrapper}>
                            <button
                                onClick={() => setSettings({ ...settings, enable_travel_charges: !settings.enable_travel_charges })}
                                className={`${styles.toggleSwitch} ${settings.enable_travel_charges ? styles.active : ''}`}
                                aria-label="Toggle travel charges"
                            >
                                <span className={styles.toggleKnob}></span>
                            </button>
                            <span className={styles.toggleLabel}>
                                {settings.enable_travel_charges ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                {settings.enable_travel_charges && (
                    <CardBody>
                        <div className={styles.formGrid}>
                            <FormSelect
                                label="Charge Type"
                                value={settings.travel_charge_type}
                                onChange={(e) => setSettings({ ...settings, travel_charge_type: e.target.value })}
                                options={[
                                    { value: 'per_km', label: 'Per KM' },
                                    { value: 'fixed', label: 'Fixed Fee' },
                                    { value: 'slab', label: 'Slab Based (Coming Soon)' }
                                ]}
                            />

                            <FormInput
                                label={`Amount (₹)${settings.travel_charge_type === 'per_km' ? ' per km' : ''}`}
                                type="number"
                                value={settings.travel_charge_amount}
                                onChange={(e) => setSettings({ ...settings, travel_charge_amount: parseFloat(e.target.value) || 0 })}
                                placeholder="Enter amount"
                            />

                            <FormInput
                                label="Free Travel Radius (km)"
                                type="number"
                                value={settings.free_travel_radius_km}
                                onChange={(e) => setSettings({ ...settings, free_travel_radius_km: parseFloat(e.target.value) || 0 })}
                                placeholder="e.g. First 3 km free"
                                helpText="Distance within which travel is free"
                            />
                        </div>
                    </CardBody>
                )}
            </Card>

            {/* GST & Taxes Card */}
            <Card>
                <CardHeader>
                    <div className={styles.cardHeaderRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Percent size={20} className={styles.cardIcon} />
                            <CardTitle>GST & Taxes</CardTitle>
                        </div>
                        <div className={styles.toggleWrapper}>
                            <button
                                onClick={() => setSettings({ ...settings, gst_enabled: !settings.gst_enabled })}
                                className={`${styles.toggleSwitch} ${settings.gst_enabled ? styles.active : ''}`}
                                aria-label="Toggle GST"
                            >
                                <span className={styles.toggleKnob}></span>
                            </button>
                            <span className={styles.toggleLabel}>
                                {settings.gst_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                {settings.gst_enabled && (
                    <CardBody>
                        <div className={styles.formSingle}>
                            <FormInput
                                label="GST Percentage (%)"
                                type="number"
                                value={settings.gst_percentage}
                                onChange={(e) => setSettings({ ...settings, gst_percentage: parseFloat(e.target.value) || 18 })}
                                placeholder="18"
                                helpText="Standard GST is 18%"
                            />
                        </div>
                    </CardBody>
                )}
            </Card>

            {/* Rental/Tool Charges Card */}
            <Card>
                <CardHeader>
                    <div className={styles.cardHeaderRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <TrendingUp size={20} className={styles.cardIcon} />
                            <CardTitle>Rental & Tool Charges</CardTitle>
                        </div>
                        <div className={styles.toggleWrapper}>
                            <button
                                onClick={() => setSettings({ ...settings, enable_rental_charges: !settings.enable_rental_charges })}
                                className={`${styles.toggleSwitch} ${settings.enable_rental_charges ? styles.active : ''}`}
                                aria-label="Toggle rental charges"
                            >
                                <span className={styles.toggleKnob}></span>
                            </button>
                            <span className={styles.toggleLabel}>
                                {settings.enable_rental_charges ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardBody>
                    <p className={styles.helpText}>
                        If enabled, you can add specific rental charges for tools and equipment to the final bill during job completion.
                    </p>
                </CardBody>
            </Card>

            {/* Save Button */}
            <div className={styles.actions}>
                <Button
                    variant="primary"
                    onClick={handleUpdate}
                    loading={saving}
                    size="lg"
                >
                    Save Configuration
                </Button>
            </div>
        </div>
    )
}
