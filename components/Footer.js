import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-white transition">About us</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition">Terms & conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition">Privacy policy</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition">Contact us</Link></li>
                        </ul>
                    </div>

                    {/* For Customers */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">For Customers</h3>
                        <ul className="space-y-2">
                            <li><Link href="/services" className="hover:text-white transition">All Services</Link></li>
                            <li><Link href="/bookings" className="hover:text-white transition">My Bookings</Link></li>
                            <li><Link href="/wallet" className="hover:text-white transition">Wallet</Link></li>
                            <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* For Professionals */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">For Professionals</h3>
                        <ul className="space-y-2">
                            <li><Link href="/provider/register" className="hover:text-white transition">Register as Professional</Link></li>
                            <li><Link href="/provider/dashboard" className="hover:text-white transition">Professional Dashboard</Link></li>
                            <li><Link href="/provider/training" className="hover:text-white transition">Training</Link></li>
                        </ul>
                    </div>

                    {/* Social & App */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
                        <div className="flex gap-4 mb-4">
                            <a href="#" className="text-2xl hover:text-white transition">📘</a>
                            <a href="#" className="text-2xl hover:text-white transition">📷</a>
                            <a href="#" className="text-2xl hover:text-white transition">🐦</a>
                            <a href="#" className="text-2xl hover:text-white transition">💼</a>
                        </div>
                        <p className="text-sm">Download App</p>
                        <div className="flex gap-2 mt-2">
                            <a href="#" className="text-xs bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 transition">
                                📱 App Store
                            </a>
                            <a href="#" className="text-xs bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 transition">
                                🤖 Play Store
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Home Solution. All rights reserved.</p>
                    <p className="mt-2 text-gray-500">
                        ⭐ 4.8 Service Rating | 👥 12M+ Customers Globally
                    </p>
                </div>
            </div>
        </footer>
    )
}
