import { useState } from 'react'
import { Wrench, MapPin, DollarSign, Award } from 'lucide-react'
import ServiceManagement from './ServiceManagement'
import LocationManagement from './LocationManagement'
import PricingSettings from './PricingSettings'
import ExperiencePortfolio from './ExperiencePortfolio'

export default function ProviderServicesModule() {
    const [activeTab, setActiveTab] = useState('services')

    const tabs = [
        { id: 'services', label: 'Services', icon: Wrench },
        { id: 'pricing', label: 'Service Charges', icon: DollarSign },
        { id: 'portfolio', label: 'Portfolio', icon: Award },
        { id: 'locations', label: 'Locations', icon: MapPin },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'services': return <ServiceManagement />
            case 'pricing': return <PricingSettings />
            case 'portfolio': return <ExperiencePortfolio />
            case 'locations': return <LocationManagement />
            default: return <ServiceManagement />
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
