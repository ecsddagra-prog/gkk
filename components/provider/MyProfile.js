import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { Camera, User as UserIcon, Mail, Phone, Building2, Calendar, LogOut } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardBody, FormInput, LoadingSkeleton } from '../shared'
import styles from '../../styles/MyProfile.module.css'

export default function MyProfile() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        business_name: '',
        avatar_url: '',
        created_at: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data: publicUserData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (userError) throw userError

            const { data: providerData, error: providerError } = await supabase
                .from('providers')
                .select('*')
                .eq('user_id', session.user.id)
                .single()

            if (providerError && providerError.code !== 'PGRST116') throw providerError

            setProfile({
                full_name: publicUserData?.full_name || '',
                email: publicUserData?.email || session.user.email || '',
                phone: publicUserData?.phone || '',
                avatar_url: publicUserData?.avatar_url || '',
                business_name: providerData?.business_name || '',
                created_at: providerData?.created_at || publicUserData?.created_at || ''
            })
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    async function handleAvatarUpload(e) {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))

            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await supabase
                    .from('users')
                    .update({ avatar_url: publicUrl })
                    .eq('id', session.user.id)
            }

            toast.success('Profile image updated!')
        } catch (error) {
            console.error('Error uploading avatar:', error)
            toast.error('Error uploading avatar')
        } finally {
            setUploading(false)
        }
    }

    async function saveProfile(e) {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No session found')

            const { error: userError } = await supabase
                .from('users')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone
                })
                .eq('id', session.user.id)

            if (userError) throw userError

            const { error: providerError } = await supabase
                .from('providers')
                .update({
                    business_name: profile.business_name
                })
                .eq('user_id', session.user.id)

            if (providerError) throw providerError

            toast.success('Profile updated successfully!')
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Failed to update profile: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleLogout() {
        try {
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            console.error('Error logging out:', error)
            toast.error('Failed to logout')
        }
    }

    if (loading) {
        return (
            <div className={styles.profileContainer}>
                <LoadingSkeleton variant="rect" width="100%" height="400px" />
            </div>
        )
    }

    return (
        <div className={styles.profileContainer}>
            {/* Profile Header Card */}
            <Card className={styles.headerCard}>
                <div className={styles.headerContent}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className={styles.avatar}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {profile.full_name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                            )}
                            <label className={styles.avatarUpload}>
                                <Camera size={16} />
                                <input
                                    type="file"
                                    className={styles.fileInput}
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                            </label>
                            {uploading && (
                                <div className={styles.uploadingOverlay}>
                                    <div className="spinner"></div>
                                </div>
                            )}
                        </div>
                        <div className={styles.userInfo}>
                            <h2 className={styles.userName}>{profile.full_name || 'Provider'}</h2>
                            <p className={styles.businessName}>{profile.business_name || 'Business Name'}</p>
                            {profile.created_at && (
                                <p className={styles.memberSince}>
                                    <Calendar size={14} />
                                    Member since {new Date(profile.created_at).toLocaleDateString('en-IN', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            </Card>

            {/* Profile Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardBody>
                    <form onSubmit={saveProfile} className={styles.profileForm}>
                        <div className={styles.formGrid}>
                            <FormInput
                                label="Full Name"
                                type="text"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                required
                                placeholder="Enter your full name"
                            />

                            <FormInput
                                label="Email"
                                type="email"
                                value={profile.email}
                                disabled
                                helpText="Email cannot be changed"
                            />

                            <FormInput
                                label="Phone Number"
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                required
                                placeholder="Enter your phone number"
                            />

                            <FormInput
                                label="Business Name"
                                type="text"
                                value={profile.business_name}
                                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                                required
                                placeholder="Enter your business name"
                            />
                        </div>

                        <div className={styles.formActions}>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={saving}
                                style={{ minWidth: '150px' }}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    )
}
