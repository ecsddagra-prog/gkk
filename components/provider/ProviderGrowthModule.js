import { useState } from 'react'
import { Users, TrendingUp, Star } from 'lucide-react'
import ProviderSubscribers from './ProviderSubscribers'
import Earnings from './Earnings'

export default function ProviderGrowthModule({ user }) {
    const [activeTab, setActiveTab] = useState('subscribers')

    const tabs = [
        { id: 'subscribers', label: 'My Subscribers', icon: Users },
        { id: 'earnings', label: 'Earnings & Reviews', icon: TrendingUp },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'subscribers': return <ProviderSubscribers />
            case 'earnings': return <Earnings user={user} />
            default: return <ProviderSubscribers />
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
