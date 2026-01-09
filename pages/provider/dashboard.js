import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import ProviderLayout from '../../components/provider/ProviderLayout'
import ProviderHome from '../../components/provider/ProviderHome'
import MyProfile from '../../components/provider/MyProfile'
import ServiceManagement from '../../components/provider/ServiceManagement'
import LocationManagement from '../../components/provider/LocationManagement'
import PricingSettings from '../../components/provider/PricingSettings'
import ExperiencePortfolio from '../../components/provider/ExperiencePortfolio'
import DocumentUpload from '../../components/provider/DocumentUpload'
import StaffManagement from '../../components/provider/StaffManagement'
import Earnings from '../../components/provider/Earnings'
import PaymentSettings from '../../components/provider/PaymentSettings'
import ProviderServicesModule from '../../components/provider/ProviderServicesModule'
import ProviderGrowthModule from '../../components/provider/ProviderGrowthModule'
import ProviderSettingsModule from '../../components/provider/ProviderSettingsModule'

import ProviderBookings from '../../components/provider/ProviderBookings'
import ProviderSubscribers from '../../components/provider/ProviderSubscribers'

export default function ProviderDashboard({ user }) {
  const router = useRouter()
  const [activeModule, setActiveModule] = useState('home')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (router.isReady && router.query.module) {
      setActiveModule(router.query.module)
    }
  }, [router.isReady, router.query.module])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    checkProvider()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const checkProvider = async () => {
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!providerData) {
        router.push('/provider/register')
        return
      }
      setLoading(false)
    } catch (error) {
      console.error('Error checking provider:', error)
      router.push('/provider/register')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'home': return <ProviderHome user={user} />
      case 'bookings': return <ProviderBookings />
      case 'services-portfolio': return <ProviderServicesModule />
      case 'growth-customers': return <ProviderGrowthModule user={user} />
      case 'profile-settings': return <ProviderSettingsModule />

      // Keep old routes accessible for direct links if any, but hide from menu
      case 'profile': return <MyProfile />
      case 'subscribers': return <ProviderSubscribers />
      case 'services': return <ServiceManagement />
      case 'location-management': return <LocationManagement />
      case 'pricing': return <PricingSettings />
      case 'portfolio': return <ExperiencePortfolio />
      case 'documents': return <DocumentUpload />
      case 'staff': return <StaffManagement />
      case 'earnings': return <Earnings user={user} />
      case 'payment-settings': return <PaymentSettings />

      default: return <ProviderHome user={user} />
    }
  }

  return (
    <ProviderLayout activeModule={activeModule} setActiveModule={setActiveModule}>
      {renderModule()}
    </ProviderLayout>
  )
}
