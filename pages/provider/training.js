import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import ProviderLayout from '../../components/provider/ProviderLayout' // Assuming this exists or I'll wrap manually

export default function ProviderTraining() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login?redirect=/provider/training')
            return
        }
        setUser(session.user)
        setLoading(false)
    }

    const modules = [
        {
            title: "Platform Basics",
            description: "Learn how to use the Home Solution provider app effectively.",
            duration: "15 mins",
            status: "completed"
        },
        {
            title: "Customer Service Excellence",
            description: "Tips and tricks for delivering 5-star service experiences.",
            duration: "30 mins",
            status: "in_progress"
        },
        {
            title: "Safety & Hygiene Protocols",
            description: "Essential safety guidelines for home service professionals.",
            duration: "20 mins",
            status: "pending"
        },
        {
            title: "Managing Your Earnings",
            description: "Understanding payouts, commissions, and bonuses.",
            duration: "10 mins",
            status: "pending"
        }
    ]

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Header for Provider context if Layout not used */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Provider Training Center</h1>
                    <Link href="/provider/dashboard" className="text-blue-600 hover:text-blue-800">
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome, Professional!</h2>
                        <p className="text-gray-600">
                            Enhance your skills and grow your business with our curated training modules.
                            Completing these courses will help you get more bookings and better ratings.
                        </p>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">Available Courses</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => (
                        <div key={index} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                            <div className="px-4 py-5 sm:p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${module.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        module.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {module.status === 'completed' ? 'Completed' :
                                            module.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                    </span>
                                    <span className="text-sm text-gray-500">{module.duration}</span>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">{module.title}</h4>
                                <p className="text-sm text-gray-600">{module.description}</p>
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                                    {module.status === 'completed' ? 'Review Course' : 'Start Learning'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
