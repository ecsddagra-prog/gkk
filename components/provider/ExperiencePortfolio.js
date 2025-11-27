import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function ExperiencePortfolio() {
    const [loading, setLoading] = useState(true)
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
        try {
            const { data: { session } } = await supabase.auth.getSession()
            await axios.put('/api/provider/profile', profile, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            })
            toast.success('Profile updated successfully')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        }
    }

    const addImage = async (e) => {
        e.preventDefault()
        if (!newImage.image_url) return

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

    if (loading) return <div className="p-4">Loading profile...</div>

    return (
        <div className="space-y-8">
            {/* Professional Profile */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Professional Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        <input
                            type="number"
                            value={profile.experience_years}
                            onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Past Companies / Brands (Optional)</label>
                        <input
                            type="text"
                            value={profile.past_companies || ''}
                            onChange={(e) => setProfile({ ...profile, past_companies: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g. Urban Company, Local Agency"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Short Bio</label>
                        <textarea
                            rows={4}
                            value={profile.short_bio || ''}
                            onChange={(e) => setProfile({ ...profile, short_bio: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tell customers about your expertise..."
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={updateProfile}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Save Profile
                    </button>
                </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Work Portfolio</h3>

                {/* Add New Image Form */}
                <form onSubmit={addImage} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Add New Work Photo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="url"
                                required
                                value={newImage.image_url}
                                onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Image URL (https://...)"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={newImage.description}
                                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Description (Optional)"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={addingImage}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {addingImage ? 'Adding...' : 'Add Photo'}
                        </button>
                    </div>
                </form>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {portfolio.map(item => (
                        <div key={item.id} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={item.image_url}
                                alt={item.description || 'Portfolio'}
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error' }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={() => deleteImage(item.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                            {item.description && (
                                <div className="p-2 text-sm text-gray-700 bg-white border-t">
                                    {item.description}
                                </div>
                            )}
                        </div>
                    ))}
                    {portfolio.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No portfolio images added yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
