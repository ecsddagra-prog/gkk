import Link from 'next/link'
import { useState } from 'react'

export default function Header({ user, cities, selectedCity, onCityChange }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-purple-600">Home Solution</h1>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Location Selector */}
                        {cities && cities.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">📍</span>
                                <select
                                    value={selectedCity || ''}
                                    onChange={(e) => onCityChange && onCityChange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* User Menu */}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 transition">
                                    Dashboard
                                </Link>
                                <Link href="/bookings" className="text-gray-700 hover:text-purple-600 transition">
                                    My Bookings
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-gray-700 hover:text-purple-600 transition">
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-purple-600"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        {cities && cities.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <select
                                    value={selectedCity || ''}
                                    onChange={(e) => {
                                        onCityChange && onCityChange(e.target.value)
                                        setMobileMenuOpen(false)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-700 hover:text-purple-600 py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/bookings"
                                        className="text-gray-700 hover:text-purple-600 py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Bookings
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-700 hover:text-purple-600 py-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
