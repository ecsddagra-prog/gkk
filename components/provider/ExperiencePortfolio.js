import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Briefcase, Award, Image as ImageIcon, Trash2, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, Button, FormInput, FormTextarea, LoadingSkeleton } from '../shared'
import ImageUpload from '../ImageUpload'
import styles from '../../styles/ExperiencePortfolio.module.css'

export default function ExperiencePortfolio() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        short_bio: '',
        experience_years: 0,
        past_companies: ''
    })
    const [portfolio, setPortfolio] = useState([])
    const [newImage, setNewImage] = useState({ image_url: '', description: '' })
    const [addingImage, setAddingImage] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const headers = { Authorization: `Bearer ${session?.access_token}` }

            const [profileRes, portfolioRes] = await Promise.all([
                axios.get('/api/provider/profile', { headers }),
                axios.get('/api/provider/portfolio', { headers })
            ])

            setProfile(profileRes.data)
            setPortfolio(portfolioRes.data.portfolio)
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load profile data')
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async () => {
        setSaving(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/profile', profile, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Profile updated successfully')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const addImage = async (e) => {
        e.preventDefault()
        if (!newImage.image_url) {
            toast.error('Please upload an image')
            return
        }

        try {
            setAddingImage(true)
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.post('/api/provider/portfolio', newImage, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setPortfolio([response.data.item, ...portfolio])
            setNewImage({ image_url: '', description: '' })
            toast.success('Image added to portfolio')
        } catch (error) {
            console.error('Error adding image:', error)
            toast.error('Failed to add image')
        } finally {
            setAddingImage(false)
        }
    }

    const deleteImage = async (id) => {
        if (!confirm('Are you sure you want to delete this image?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.delete(`/api/provider/portfolio?id=${id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setPortfolio(portfolio.filter(p => p.id !== id))
            toast.success('Image deleted')
        } catch (error) {
            console.error('Error deleting image:', error)
            toast.error('Failed to delete image')
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
            {/* Professional Profile Card */}
            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Briefcase size={20} style={{ color: 'var(--color-primary-600)' }} />
                        <CardTitle>Professional Profile</CardTitle>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className={styles.profileForm}>
                        <div className={styles.formRow}>
                            <FormInput
                                label="Years of Experience"
                                type="number"
                                value={profile.experience_years}
                                onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                                helpText="Total years in this field"
                            />

                            <FormInput
                                label="Past Companies / Brands"
                                type="text"
                                value={profile.past_companies || ''}
                                onChange={(e) => setProfile({ ...profile, past_companies: e.target.value })}
                                placeholder="e.g. Urban Company, Local Agency"
                                helpText="Optional - helps build trust"
                            />
                        </div>

                        <FormTextarea
                            label="Short Bio"
                            value={profile.short_bio || ''}
                            onChange={(e) => setProfile({ ...profile, short_bio: e.target.value })}
                            rows={4}
                            placeholder="Tell customers about your expertise, specializations, and what makes you stand out..."
                            helpText="A compelling bio helps customers choose you"
                        />

                        <div className={styles.formActions}>
                            <Button
                                variant="primary"
                                onClick={updateProfile}
                                loading={saving}
                            >
                                <Award size={18} />
                                Save Profile
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Work Portfolio Card */}
            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <ImageIcon size={20} style={{ color: 'var(--color-primary-600)' }} />
                        <CardTitle>Work Portfolio</CardTitle>
                    </div>
                </CardHeader>
                <CardBody>
                    {/* Add New Image Form */}
                    <form onSubmit={addImage} className={styles.addImageForm}>
                        <h4 className={styles.formTitle}>
                            <Plus size={18} />
                            Add New Work Photo
                        </h4>
                        <div className={styles.uploadGrid}>
                            <div className={styles.uploadSection}>
                                <ImageUpload
                                    label="Portfolio Image"
                                    value={newImage.image_url}
                                    onChange={(url) => setNewImage({ ...newImage, image_url: url })}
                                />
                            </div>
                            <div className={styles.descriptionSection}>
                                <FormInput
                                    label="Description (Optional)"
                                    type="text"
                                    value={newImage.description}
                                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                                    placeholder="e.g. AC Installation, Kitchen Repair..."
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={addingImage}
                                    disabled={!newImage.image_url}
                                    style={{ marginTop: 'auto' }}
                                >
                                    Add Photo
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Image Grid */}
                    {portfolio.length > 0 ? (
                        <div className={styles.portfolioGrid}>
                            {portfolio.map(item => (
                                <div key={item.id} className={styles.portfolioItem}>
                                    <div className={styles.imageWrapper}>
                                        <img
                                            src={item.image_url}
                                            alt={item.description || 'Portfolio'}
                                            className={styles.portfolioImage}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error' }}
                                        />
                                        <div className={styles.imageOverlay}>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => deleteImage(item.id)}
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                    {item.description && (
                                        <div className={styles.imageDescription}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📸</div>
                            <h3 className={styles.emptyTitle}>No Portfolio Images</h3>
                            <p className={styles.emptyText}>
                                Add photos of your best work to attract more customers
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
