import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Users, UserPlus, Phone, Trash2, Power } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody, Button, FormInput, FormSelect, Badge, LoadingSkeleton } from '../shared'
import ImageUpload from '../ImageUpload'
import styles from '../../styles/StaffManagement.module.css'

export default function StaffManagement() {
    const [loading, setLoading] = useState(true)
    const [staff, setStaff] = useState([])
    const [newStaff, setNewStaff] = useState({
        full_name: '',
        phone: '',
        role: 'helper',
        id_proof_url: ''
    })
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.get('/api/provider/staff', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            setStaff(response.data.staff)
        } catch (error) {
            console.error('Error fetching staff:', error)
            toast.error('Failed to load staff')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!newStaff.full_name || !newStaff.phone) {
            toast.error('Please fill all required fields')
            return
        }

        try {
            setAdding(true)
            const { data: { session } } = await supabase.auth.getSession()
            const response = await axios.post('/api/provider/staff', newStaff, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setStaff([response.data.item, ...staff])
            setNewStaff({ full_name: '', phone: '', role: 'helper', id_proof_url: '' })
            toast.success('Staff member added successfully')
        } catch (error) {
            console.error('Error adding staff:', error)
            toast.error('Failed to add staff')
        } finally {
            setAdding(false)
        }
    }

    const handleUpdate = async (member, updates) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/staff', { ...member, ...updates }, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setStaff(staff.map(s => s.id === member.id ? { ...s, ...updates } : s))
            toast.success('Staff updated')
        } catch (error) {
            console.error('Error updating staff:', error)
            toast.error('Failed to update staff')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.delete(`/api/provider/staff?id=${id}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })

            setStaff(staff.filter(s => s.id !== id))
            toast.success('Staff member removed')
        } catch (error) {
            console.error('Error removing staff:', error)
            toast.error('Failed to remove staff')
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
            {/* Add New Staff Card */}
            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <UserPlus size={20} style={{ color: 'var(--color-primary-600)' }} />
                        <CardTitle>Add New Staff</CardTitle>
                    </div>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleAdd} className={styles.addForm}>
                        <div className={styles.formRow}>
                            <FormInput
                                label="Full Name"
                                type="text"
                                value={newStaff.full_name}
                                onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                                placeholder="e.g. Rahul Kumar"
                                required
                            />

                            <FormInput
                                label="Phone Number"
                                type="tel"
                                value={newStaff.phone}
                                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                placeholder="e.g. 9876543210"
                                required
                            />

                            <FormSelect
                                label="Role"
                                value={newStaff.role}
                                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                options={[
                                    { value: 'helper', label: 'Helper' },
                                    { value: 'electrician', label: 'Electrician' },
                                    { value: 'plumber', label: 'Plumber' },
                                    { value: 'driver', label: 'Driver' },
                                    { value: 'manager', label: 'Manager' },
                                    { value: 'other', label: 'Other' }
                                ]}
                            />

                            <div>
                                <ImageUpload
                                    label="ID Proof"
                                    value={newStaff.id_proof_url}
                                    onChange={(url) => setNewStaff({ ...newStaff, id_proof_url: url })}
                                />
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={adding}
                            >
                                <UserPlus size={18} />
                                Add Staff Member
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* Staff List Card */}
            <Card>
                <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Users size={20} style={{ color: 'var(--color-primary-600)' }} />
                        <CardTitle>Staff List ({staff.length})</CardTitle>
                    </div>
                </CardHeader>
                <CardBody>
                    {staff.length > 0 ? (
                        <div className={styles.staffGrid}>
                            {staff.map(member => (
                                <div key={member.id} className={styles.staffCard}>
                                    <div className={styles.staffHeader}>
                                        <div className={styles.staffInfo}>
                                            <h4 className={styles.staffName}>{member.full_name}</h4>
                                            <p className={styles.staffRole}>{member.role}</p>
                                        </div>
                                        <button
                                            onClick={() => handleUpdate(member, { is_active: !member.is_active })}
                                            className={`${styles.statusBadge} ${member.is_active ? styles.active : ''}`}
                                        >
                                            <Power size={12} />
                                            {member.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>

                                    <div className={styles.staffContact}>
                                        <Phone size={14} />
                                        <span>{member.phone}</span>
                                    </div>

                                    {member.id_proof_url && (
                                        <div className={styles.staffProof}>
                                            <a
                                                href={member.id_proof_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.proofLink}
                                            >
                                                View ID Proof
                                            </a>
                                        </div>
                                    )}

                                    <div className={styles.staffActions}>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(member.id)}
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>👥</div>
                            <h3 className={styles.emptyTitle}>No Staff Members</h3>
                            <p className={styles.emptyText}>
                                Add your first staff member to manage your team
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
