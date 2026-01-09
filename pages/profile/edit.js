import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function EditProfile({ user }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: user?.user_metadata?.full_name || '',
        phone: user?.phone || ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name,
                    updated_at: new Date()
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success('Profile updated successfully!')
            router.push('/profile')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} />

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Link href="/profile" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-4 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
                    <p className="text-gray-500 mt-2">Update your personal information.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl font-bold relative">
                            {formData.full_name?.charAt(0).toUpperCase() || 'U'}
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-2">Email address cannot be changed</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
