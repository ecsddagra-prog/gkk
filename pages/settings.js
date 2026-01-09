import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import toast from 'react-hot-toast'

export default function Settings({ user }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        updates: true
    })

    const toggleNotification = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
        toast.success('Preference updated')
    }

    return (
        <div className="min-h-screen bg-[#F8F9FD]">
            <Header user={user} />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Link href="/profile" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-4 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your preferences and security details.</p>
                </div>

                <div className="space-y-6">
                    {/* Notifications */}
                    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🔔</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                                <p className="text-sm text-gray-500">Choose how we communicate with you</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ToggleRow
                                title="Email Notifications"
                                desc="Receive booking updates and receipts via email"
                                checked={notifications.email}
                                onChange={() => toggleNotification('email')}
                            />
                            <ToggleRow
                                title="Push Notifications"
                                desc="Get real-time updates on your device"
                                checked={notifications.push}
                                onChange={() => toggleNotification('push')}
                            />
                            <ToggleRow
                                title="SMS Notifications"
                                desc="Receive status updates via SMS"
                                checked={notifications.sms}
                                onChange={() => toggleNotification('sms')}
                            />
                        </div>
                    </section>

                    {/* Security */}
                    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Security</h2>
                                <p className="text-sm text-gray-500">Protect your account and data</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-left group">
                                <div>
                                    <h4 className="font-bold text-gray-900">Change Password</h4>
                                    <p className="text-sm text-gray-500">Update your password regularly</p>
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-600">→</div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-left group">
                                <div>
                                    <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-600">→</div>
                            </button>
                        </div>
                    </section>

                    {/* Support */}
                    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🎧</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Support & Legal</h2>
                                <p className="text-sm text-gray-500">Get help or read our policies</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/contact" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-center font-bold text-gray-700 transition-colors">
                                Contact Support
                            </Link>
                            <Link href="/terms" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-center font-bold text-gray-700 transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

function ToggleRow({ title, desc, checked, onChange }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <button
                onClick={onChange}
                className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></span>
            </button>
        </div>
    )
}
