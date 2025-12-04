import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import axios from 'axios'
import { CreditCard, Building2, Smartphone, Upload as UploadIcon, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, Button, FormInput, LoadingSkeleton } from '../shared'
import styles from '../../styles/PaymentSettings.module.css'

export default function PaymentSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [settings, setSettings] = useState({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: '',
        qr_code_url: '',
        primary_method: 'upi'
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await axios.get('/api/provider/payment-settings', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })

            if (response.data.settings) {
                setSettings(response.data.settings)
            }
        } catch (error) {
            console.error('Error loading settings:', error)
            toast.error('Failed to load payment settings')
        } finally {
            setLoading(false)
        }
    }

    const handleQRUpload = async (e) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('Please select an image to upload')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setSettings(prev => ({ ...prev, qr_code_url: publicUrl }))
            toast.success('QR code uploaded successfully')
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload QR code')
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            await axios.post('/api/provider/payment-settings', settings, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            })

            toast.success('Payment settings saved successfully!')
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save payment settings')
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

    const paymentMethods = [
        { value: 'upi', label: 'UPI', icon: '📱' },
        { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
        { value: 'cash', label: 'Cash', icon: '💵' },
        { value: 'all', label: 'All Methods', icon: '💳' }
    ]

    return (
        <div className={styles.container}>
            <form onSubmit={handleSave} className={styles.form}>
                {/* Primary Method Card */}
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <CreditCard size={20} style={{ color: 'var(--color-primary-600)' }} />
                            <CardTitle>Primary Payment Method</CardTitle>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <p className={styles.description}>
                            Select your preferred method for receiving payments from customers
                        </p>
                        <div className={styles.methodGrid}>
                            {paymentMethods.map(method => (
                                <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, primary_method: method.value }))}
                                    className={`${styles.methodCard} ${settings.primary_method === method.value ? styles.active : ''}`}
                                >
                                    <div className={styles.methodIcon}>{method.icon}</div>
                                    <div className={styles.methodLabel}>{method.label}</div>
                                </button>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Bank Details Card */}
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Building2 size={20} style={{ color: 'var(--color-primary-600)' }} />
                            <CardTitle>Bank Transfer Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className={styles.formGrid}>
                            <FormInput
                                label="Account Holder Name"
                                type="text"
                                value={settings.account_holder_name}
                                onChange={e => setSettings(prev => ({ ...prev, account_holder_name: e.target.value }))}
                                placeholder="John Doe"
                            />

                            <FormInput
                                label="Bank Name"
                                type="text"
                                value={settings.bank_name}
                                onChange={e => setSettings(prev => ({ ...prev, bank_name: e.target.value }))}
                                placeholder="State Bank of India"
                            />

                            <FormInput
                                label="Account Number"
                                type="text"
                                value={settings.account_number}
                                onChange={e => setSettings(prev => ({ ...prev, account_number: e.target.value }))}
                                placeholder="1234567890"
                            />

                            <FormInput
                                label="IFSC Code"
                                type="text"
                                value={settings.ifsc_code}
                                onChange={e => setSettings(prev => ({ ...prev, ifsc_code: e.target.value }))}
                                placeholder="SBIN0001234"
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* UPI Details Card */}
                <Card>
                    <CardHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Smartphone size={20} style={{ color: 'var(--color-primary-600)' }} />
                            <CardTitle>UPI / Digital Wallet</CardTitle>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className={styles.upiSection}>
                            <div className={styles.upiForm}>
                                <FormInput
                                    label="UPI ID"
                                    type="text"
                                    value={settings.upi_id}
                                    onChange={e => setSettings(prev => ({ ...prev, upi_id: e.target.value }))}
                                    placeholder="yourname@upi"
                                    helpText="e.g. 9876543210@paytm"
                                />
                            </div>

                            <div className={styles.qrSection}>
                                <label className={styles.qrLabel}>Payment QR Code</label>
                                <div className={styles.qrUpload}>
                                    <label className={styles.uploadButton}>
                                        <UploadIcon size={18} />
                                        <span>{uploading ? 'Uploading...' : 'Upload QR'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleQRUpload}
                                            disabled={uploading}
                                            className={styles.fileInput}
                                        />
                                    </label>
                                    {settings.qr_code_url && (
                                        <div className={styles.qrPreview}>
                                            <img
                                                src={settings.qr_code_url}
                                                alt="Payment QR Code"
                                                className={styles.qrImage}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Save Button */}
                <div className={styles.formActions}>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={saving}
                    >
                        <Save size={18} />
                        Save Payment Settings
                    </Button>
                </div>
            </form>
        </div>
    )
}
