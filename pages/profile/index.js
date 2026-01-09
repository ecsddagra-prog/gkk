import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function Profile({ user }) {
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }
        loadProfile()
    }, [user])

    const loadProfile = async () => {
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(data)
        } catch (error) {
            console.error('Error loading profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* User Hero Card */}
                <section className="mb-10">
                    <div className="glass-premium bg-white/70 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl border border-white">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile?.full_name || 'User Name'}</h1>
                            <p className="text-gray-500 font-medium">{profile?.email}</p>
                            <div className="flex gap-4 mt-3 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider">Premium Member</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Verified Account</span>
                            </div>
                        </div>
                        <Link
                            href="/profile/edit"
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <p className="text-purple-100 font-medium mb-1">Wallet Balance</p>
                        <h3 className="text-4xl font-black">₹{profile?.wallet_balance || '0.00'}</h3>
                        <Link href="/wallet">
                            <button className="mt-4 text-xs font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors">Add Money</button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg group hover:border-purple-200 transition-colors">
                        <p className="text-gray-500 font-medium mb-1">Cashback Earned</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-4xl font-black text-gray-900">₹450</h3>
                            <span className="text-green-500 text-sm font-bold mb-1">+₹50 this month</span>
                        </div>
                        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="w-[65%] h-full bg-green-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg group hover:border-purple-200 transition-colors">
                        <p className="text-gray-500 font-medium mb-1">Reward Points</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl">⭐</div>
                            <h3 className="text-4xl font-black text-gray-900">1,250</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-tighter">Gold Tier Status</p>
                    </div>
                </section>

                {/* Categories / Actions Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ProfileActionCard
                        title="Orders & Bookings"
                        desc="View your complete service history"
                        icon="📅"
                        link="/profile/bookings"
                    />
                    <ProfileActionCard
                        title="Saved Addresses"
                        desc="Manage your home and office locations"
                        icon="📍"
                        link="/addresses"
                    />
                    <ProfileActionCard
                        title="Service Providers"
                        desc="Your favorite experts and teams"
                        icon="👥"
                        link="/providers/saved"
                    />
                    <ProfileActionCard
                        title="Settings"
                        desc="Notification and security preferences"
                        icon="⚙️"
                        link="/settings"
                    />
                    <div
                        onClick={handleLogout}
                        className="group cursor-pointer bg-red-50 hover:bg-red-100 rounded-3xl p-6 border border-red-100 transition-all active:scale-95"
                    >
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🚪</div>
                        <h4 className="text-xl font-bold text-red-700">Logout</h4>
                        <p className="text-red-600 text-sm mt-1 font-medium opacity-60">Sign out of your account</p>
                    </div>
                </section>

                {/* Referral Section */}
                <section className="mt-12 bg-white rounded-3xl p-1 shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-purple-50 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Invite Friends & Earn</h3>
                            <p className="text-gray-600 mt-1">Get ₹100 for every friend who completes their first booking.</p>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-2xl flex items-center gap-4 border border-purple-100 shadow-sm">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referral Code</p>
                                <p className="text-xl font-black text-purple-700 tracking-widest uppercase">{profile?.referral_code || 'GKK-789'}</p>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(profile?.referral_code || '')
                                    toast.success('Code copied!')
                                }}
                                className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

function ProfileActionCard({ title, desc, icon, link }) {
    return (
        <Link href={link} className="group glass-premium bg-white hover:bg-white/90 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200 active:scale-95">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="text-xl font-bold text-gray-900">{title}</h4>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
        </Link>
    )
}
