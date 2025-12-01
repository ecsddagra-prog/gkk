import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                    <div className="prose prose-purple max-w-none text-gray-600">
                        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Information We Collect</h2>
                        <p className="mb-4">
                            We collect information you provide directly to us, such as when you create an account, book a service, or contact customer support. This may include your name, email address, phone number, and payment information.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use your information to provide, maintain, and improve our services, process transactions, and communicate with you about your bookings and account.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Information Sharing</h2>
                        <p className="mb-4">
                            We share your information with service professionals to facilitate your bookings. We do not sell your personal information to third parties.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Data Security</h2>
                        <p className="mb-4">
                            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
