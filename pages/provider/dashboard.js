import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import ProviderLayout from '../../components/provider/ProviderLayout'
import ServiceManagement from '../../components/provider/ServiceManagement'
import LocationSettings from '../../components/provider/LocationSettings'
import PricingSettings from '../../components/provider/PricingSettings'
import ExperiencePortfolio from '../../components/provider/ExperiencePortfolio'
import DocumentUpload from '../../components/provider/DocumentUpload'
import StaffManagement from '../../components/provider/StaffManagement'

export default function ProviderDashboard({ user }) {
  const router = useRouter()
  const [activeModule, setActiveModule] = useState('services')
  const [loading, setLoading] = useState(true)

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
      case 'services': return <ServiceManagement />
      case 'location': return <LocationSettings />
      case 'pricing': return <PricingSettings />
      case 'portfolio': return <ExperiencePortfolio />
      case 'documents': return <DocumentUpload />
      case 'staff': return <StaffManagement />
      default: return <ServiceManagement />
    }
  }

  return (
    <ProviderLayout activeModule={activeModule} setActiveModule={setActiveModule}>
      {renderModule()}
    </ProviderLayout>
  )
}
