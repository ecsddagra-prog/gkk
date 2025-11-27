import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function ProviderLayout({ children, activeModule, setActiveModule }) {
    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: '👤' },
        { id: 'services', label: 'Service Management', icon: '🛠️' },
        { id: 'location', label: 'Location & Radius', icon: '📍' },
        { id: 'pricing', label: 'Service Charges', icon: '💰' },
        { id: 'portfolio', label: 'Experience & Portfolio', icon: '👨‍💼' },
        { id: 'documents', label: 'License & KYC', icon: '📄' },
        { id: 'staff', label: 'Staff Management', icon: '👥' },
        { id: 'location-tracker', label: 'Location Tracker', icon: '📍' },
        { id: 'earnings', label: 'Earnings & Reviews', icon: '📊' },
    ]

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col fixed h-full z-10">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-blue-600">Provider Panel</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === item.id
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t bg-gray-50">
                    <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <span>⬅️</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 overflow-auto">
                <header className="bg-white shadow-sm p-6 sticky top-0 z-20">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {menuItems.find(m => m.id === activeModule)?.label}
                    </h2>
                </header>
                <main className="p-6 pb-20">
                    {children}
                </main>
            </div>
        </div>
    )
}
