import { useState } from 'react'
import { User, FileText, Users, CreditCard } from 'lucide-react'
import MyProfile from './MyProfile'
import DocumentUpload from './DocumentUpload'
import StaffManagement from './StaffManagement'
import PaymentSettings from './PaymentSettings'

export default function ProviderSettingsModule() {
    const [activeTab, setActiveTab] = useState('profile')

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'documents', label: 'License & KYC', icon: FileText },
        { id: 'staff', label: 'Staff Management', icon: Users },
        { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <MyProfile />
            case 'documents': return <DocumentUpload />
            case 'staff': return <StaffManagement />
            case 'payment': return <PaymentSettings />
            default: return <MyProfile />
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
                        `}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="min-h-[500px]">
                {renderContent()}
            </div>
        </div>
    )
}
